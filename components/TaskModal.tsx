
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Tag, Subtask, SocialPlatform } from '../types';
import { useApp } from '../context/AppContext';
import { X, Send, Sparkles, Image as ImageIcon, Link as LinkIcon, Clock, CheckSquare, Plus, Trash2, Tag as TagIcon, Play, Pause, ExternalLink, Check, ZoomIn, Layers, Smartphone } from 'lucide-react';
import { generateTaskIdeas } from '../services/geminiService';
import { SOCIAL_PLATFORMS } from '../constants';
import clsx from 'clsx';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

const TAG_COLORS = [
    'bg-red-200 text-red-800', 'bg-orange-200 text-orange-800', 'bg-yellow-200 text-yellow-800',
    'bg-green-200 text-green-800', 'bg-teal-200 text-teal-800', 'bg-blue-200 text-blue-800',
    'bg-indigo-200 text-indigo-800', 'bg-purple-200 text-purple-800', 'bg-pink-200 text-pink-800', 'bg-gray-200 text-gray-800'
];

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose }) => {
  const { updateTask, users, currentUser, delegateTask, availableTags, createTag } = useApp();
  const [editedTask, setEditedTask] = useState<Task>({ ...task, attachments: task.attachments || (task.imageUrl ? [task.imageUrl] : []) });
  const [commentText, setCommentText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');
  
  // Tag creation state
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);

  // Subtask state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Link state
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [tempLink, setTempLink] = useState('');

  // Live Timer State for display
  const [displayTime, setDisplayTime] = useState(editedTask.timeSpent);

  // Image Zoom State
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [expandedImageSrc, setExpandedImageSrc] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    if (editedTask.isTimerRunning && editedTask.lastTimerStart) {
        interval = setInterval(() => {
            const currentSession = Date.now() - (editedTask.lastTimerStart || Date.now());
            setDisplayTime(editedTask.timeSpent + currentSession);
        }, 1000);
    } else {
        setDisplayTime(editedTask.timeSpent);
    }
    return () => clearInterval(interval);
  }, [editedTask.isTimerRunning, editedTask.lastTimerStart, editedTask.timeSpent]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Determine if we need to stop/start timer based on status changes manually done in modal
    // Note: The main logic is in AppContext.updateTask, but we trigger it by passing the modified task object.
    updateTask(editedTask);
    onClose();
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    setEditedTask({ ...editedTask, status: newStatus });
  };

  const handleDelegation = (userId: string) => {
    if (window.confirm(`Delegar esta tarefa para ${users.find(u => u.id === userId)?.name}?`)) {
      delegateTask(task.id, userId);
      onClose();
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Math.random().toString(),
      userId: currentUser?.id || 'unknown',
      text: commentText,
      timestamp: Date.now()
    };
    setEditedTask({ 
      ...editedTask, 
      comments: [...editedTask.comments, newComment] 
    });
    setCommentText('');
  };

  const handleMagicRewrite = async () => {
    setIsGenerating(true);
    const newDesc = await generateTaskIdeas(editedTask.description);
    setEditedTask({ ...editedTask, description: newDesc });
    setIsGenerating(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
          const fileReaders: Promise<string>[] = [];
          Array.from(files).forEach(file => {
              fileReaders.push(new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(file);
              }));
          });

          Promise.all(fileReaders).then(newImages => {
              const currentAttachments = editedTask.attachments || [];
              const updatedAttachments = [...currentAttachments, ...newImages];
              setEditedTask({ 
                  ...editedTask, 
                  attachments: updatedAttachments,
                  imageUrl: updatedAttachments[0] // Set cover image to the first one
              });
          });
      }
  };

  const removeAttachment = (index: number) => {
      const currentAttachments = editedTask.attachments || [];
      const updatedAttachments = currentAttachments.filter((_, i) => i !== index);
      setEditedTask({ 
          ...editedTask, 
          attachments: updatedAttachments,
          imageUrl: updatedAttachments.length > 0 ? updatedAttachments[0] : undefined
      });
  };

  const saveLink = () => {
      if (tempLink) {
          // Ensure protocol
          let url = tempLink;
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
              url = 'https://' + url;
          }
          setEditedTask({ ...editedTask, link: url });
          setShowLinkInput(false);
          setTempLink('');
      }
  };

  const sendForApproval = () => {
      setEditedTask({ ...editedTask, isApprovalRequested: true, approvalStatus: 'pending', status: TaskStatus.WAITING });
      updateTask({ ...editedTask, isApprovalRequested: true, approvalStatus: 'pending', status: TaskStatus.WAITING });
      onClose();
  };

  // --- Tag Logic ---
  const toggleTag = (tag: Tag) => {
      const exists = editedTask.tags.find(t => t.id === tag.id);
      if (exists) {
          setEditedTask({ ...editedTask, tags: editedTask.tags.filter(t => t.id !== tag.id) });
      } else {
          setEditedTask({ ...editedTask, tags: [...editedTask.tags, tag] });
      }
  };

  const handleCreateTag = () => {
      if (!newTagName) return;
      createTag(newTagName, newTagColor);
      setIsCreatingTag(false);
      setNewTagName('');
  };

  // --- Subtask Logic ---
  const addSubtask = () => {
      if (!newSubtaskTitle) return;
      const subtask: Subtask = { id: Math.random().toString(), title: newSubtaskTitle, completed: false };
      setEditedTask({ ...editedTask, subtasks: [...editedTask.subtasks, subtask] });
      setNewSubtaskTitle('');
  };

  const toggleSubtask = (id: string) => {
      const updatedSubtasks = editedTask.subtasks.map(s => 
          s.id === id ? { ...s, completed: !s.completed } : s
      );
      setEditedTask({ ...editedTask, subtasks: updatedSubtasks });
  };

  const deleteSubtask = (id: string) => {
      setEditedTask({ ...editedTask, subtasks: editedTask.subtasks.filter(s => s.id !== id) });
  };

  const subtaskProgress = editedTask.subtasks.length > 0 
      ? Math.round((editedTask.subtasks.filter(s => s.completed).length / editedTask.subtasks.length) * 100) 
      : 0;

  // --- Time Logic ---
  const formatTime = (ms: number) => {
      const seconds = Math.floor((ms / 1000) % 60);
      const minutes = Math.floor((ms / (1000 * 60)) % 60);
      const hours = Math.floor((ms / (1000 * 60 * 60)));
      return `${hours}h ${minutes}m ${seconds}s`;
  };

  const getPlatformIcon = (platform: string) => {
      return SOCIAL_PLATFORMS.find(p => p.label === platform)?.icon || <Smartphone size={14} />;
  };

  return (
    <>
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl min-h-[80vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-joy-50 to-purple-50 p-6 flex justify-between items-start border-b border-joy-100 shrink-0">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
               <span className="text-4xl">{editedTask.emoji}</span>
               <input 
                 value={editedTask.title} 
                 onChange={e => setEditedTask({...editedTask, title: e.target.value})}
                 className="text-3xl font-extrabold bg-transparent border-none focus:ring-0 text-gray-800 w-full"
               />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${editedTask.status === TaskStatus.TODO ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                {editedTask.status}
              </span>
              {editedTask.socialPlatform && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${SOCIAL_PLATFORMS.find(p => p.label === editedTask.socialPlatform)?.color || 'bg-gray-200 text-gray-700'}`}>
                      {getPlatformIcon(editedTask.socialPlatform)} {editedTask.socialPlatform}
                  </span>
              )}
              {editedTask.tags.map(tag => (
                  <span key={tag.id} className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${tag.color}`}>
                      <TagIcon size={10} /> {tag.name}
                  </span>
              ))}
              {editedTask.isApprovalRequested && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Em Aprovação</span>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors"><X size={28} className="text-gray-400" /></button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Main Area */}
            <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar">
                
                {/* Tabs */}
                <div className="flex gap-6 border-b border-gray-100 pb-2">
                    <button onClick={() => setActiveTab('details')} className={`text-base font-bold pb-2 transition-colors ${activeTab === 'details' ? 'text-joy-600 border-b-2 border-joy-500' : 'text-gray-400 hover:text-gray-600'}`}>Detalhes</button>
                    <button onClick={() => setActiveTab('comments')} className={`text-base font-bold pb-2 transition-colors ${activeTab === 'comments' ? 'text-joy-600 border-b-2 border-joy-500' : 'text-gray-400 hover:text-gray-600'}`}>Comentários ({editedTask.comments.length})</button>
                    <button onClick={() => setActiveTab('history')} className={`text-base font-bold pb-2 transition-colors ${activeTab === 'history' ? 'text-joy-600 border-b-2 border-joy-500' : 'text-gray-400 hover:text-gray-600'}`}>Histórico</button>
                </div>

                {activeTab === 'details' && (
                  <div className="space-y-8">
                    {/* Description */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
                                Descrição
                            </label>
                            <button 
                                onClick={handleMagicRewrite} 
                                disabled={isGenerating}
                                className="flex items-center gap-1 text-xs font-bold text-joy-600 hover:text-joy-700 bg-joy-50 px-3 py-1.5 rounded-full transition-colors"
                            >
                                <Sparkles size={14} /> {isGenerating ? 'Mágica acontecendo...' : 'Melhorar com IA'}
                            </button>
                        </div>
                        <textarea 
                            value={editedTask.description}
                            onChange={e => setEditedTask({...editedTask, description: e.target.value})}
                            className="w-full h-32 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-joy-200 resize-none text-gray-700 text-lg leading-relaxed shadow-inner"
                        />
                    </div>

                    {/* Legenda Field */}
                    <div>
                        <label className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                            Legenda do Post
                        </label>
                        <textarea 
                            value={editedTask.caption || ''}
                            onChange={e => setEditedTask({...editedTask, caption: e.target.value})}
                            className="w-full h-28 p-4 bg-white rounded-2xl border border-gray-200 focus:border-joy-300 focus:ring-2 focus:ring-joy-100 resize-none text-gray-700 text-base leading-relaxed shadow-sm"
                            placeholder="Escreva a legenda para a arte/post aqui..."
                        />
                    </div>

                    {/* Time Tracking Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="text-blue-600" />
                            <h3 className="font-bold text-blue-900 text-lg">Controle de Horas</h3>
                        </div>
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="flex-1 w-full">
                                <label className="text-xs font-bold text-blue-400 uppercase mb-1 block">Tempo Estimado (Horas)</label>
                                <input 
                                    type="number" 
                                    value={editedTask.estimatedHours}
                                    onChange={e => setEditedTask({...editedTask, estimatedHours: parseFloat(e.target.value)})}
                                    className="w-full p-2 rounded-xl border border-blue-200 text-blue-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    min="0"
                                    step="0.5"
                                />
                            </div>
                            
                            <div className="flex-1 flex flex-col items-center w-full">
                                <span className="text-xs font-bold text-blue-400 uppercase mb-1">Cronômetro</span>
                                <div className={clsx("text-3xl font-mono font-black tracking-widest px-6 py-2 rounded-xl bg-white shadow-sm border", editedTask.isTimerRunning ? "text-green-600 border-green-200 animate-pulse" : "text-gray-600 border-gray-200")}>
                                    {formatTime(displayTime)}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">
                                    {editedTask.isTimerRunning ? 'Em andamento...' : 'Pausado (Inicie movendo para Em Andamento)'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Checklist / Subtasks */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">
                                <CheckSquare size={20} className="text-joy-500" />
                                Checklist
                            </h3>
                            <span className="text-xs font-bold bg-joy-100 text-joy-600 px-2 py-1 rounded-md">{subtaskProgress}%</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
                            <div 
                                className="h-full bg-joy-500 transition-all duration-500 ease-out" 
                                style={{ width: `${subtaskProgress}%` }}
                            />
                        </div>

                        <div className="space-y-3 mb-4">
                            {editedTask.subtasks.map(st => (
                                <div key={st.id} className="flex items-center gap-3 group">
                                    <button 
                                        onClick={() => toggleSubtask(st.id)}
                                        className={clsx(
                                            "w-6 h-6 rounded border flex items-center justify-center transition-colors",
                                            st.completed ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-300 hover:border-joy-400"
                                        )}
                                    >
                                        {st.completed && <Plus size={16} className="rotate-45" />}
                                    </button>
                                    <span className={clsx("flex-1 text-gray-700 font-medium transition-all", st.completed && "line-through text-gray-400")}>
                                        {st.title}
                                    </span>
                                    <button onClick={() => deleteSubtask(st.id)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={newSubtaskTitle} 
                                onChange={e => setNewSubtaskTitle(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addSubtask()}
                                placeholder="Adicionar item..."
                                className="flex-1 p-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-joy-400"
                            />
                            <button onClick={addSubtask} className="bg-joy-500 text-white p-2 rounded-lg hover:bg-joy-600 font-bold">
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Image Gallery */}
                    {editedTask.attachments && editedTask.attachments.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-bold text-gray-600 text-sm uppercase">Galeria de Anexos</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {editedTask.attachments.map((img, index) => (
                                    <div 
                                        key={index}
                                        className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm"
                                    >
                                        <img 
                                            src={img} 
                                            alt={`Attachment ${index + 1}`} 
                                            className="w-full h-full object-cover cursor-zoom-in"
                                            onClick={() => {
                                                setExpandedImageSrc(img);
                                                setIsImageExpanded(true);
                                            }}
                                        />
                                        <button 
                                            onClick={() => removeAttachment(index)}
                                            className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-red-500 hover:text-white rounded-full text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                            title="Remover imagem"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        {index === 0 && (
                                            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white text-[10px] font-bold rounded-full">
                                                Capa
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                  </div>
                )}

                {activeTab === 'comments' && (
                    <div className="space-y-6 h-full flex flex-col">
                        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                            {editedTask.comments.length === 0 && <p className="text-center text-gray-400 py-10">Nenhum comentário ainda.</p>}
                            {editedTask.comments.map(c => (
                                <div key={c.id} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-joy-100 flex items-center justify-center text-joy-600 font-bold text-sm shrink-0 border-2 border-white shadow-sm">
                                        {users.find(u => u.id === c.userId)?.name[0]}
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none flex-1 shadow-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-bold text-gray-700 text-sm">{users.find(u => u.id === c.userId)?.name}</p>
                                            <span className="text-xs text-gray-400">{new Date(c.timestamp).toLocaleString()}</span>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">{c.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <input 
                                type="text" 
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                placeholder="Escreva um comentário (use @para mencionar)..."
                                className="flex-1 p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-joy-300 outline-none text-gray-700"
                                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                            />
                            <button onClick={handleAddComment} className="p-3 bg-joy-500 text-white rounded-xl hover:bg-joy-600 shadow-lg shadow-joy-200 transition-transform active:scale-95"><Send size={20} /></button>
                        </div>
                    </div>
                )}
                
                {activeTab === 'history' && (
                     <div className="space-y-4">
                        {editedTask.history.length === 0 && <p className="text-gray-400 text-center">Sem histórico.</p>}
                        {editedTask.history.map((h) => (
                            <div key={h.id} className="flex gap-4 items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                                <div className="w-2 h-2 rounded-full bg-joy-400"></div>
                                <span className="font-bold text-joy-700 min-w-[80px]">{new Date(h.timestamp).toLocaleDateString()}</span>
                                <span className="flex-1">{h.action}</span>
                            </div>
                        ))}
                     </div>
                )}
            </div>

            {/* Sidebar Actions */}
            <div className="w-full md:w-80 bg-gray-50 p-8 space-y-6 border-l border-gray-100 overflow-y-auto">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Status</label>
                    <select 
                        value={editedTask.status} 
                        onChange={handleStatusChange}
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-joy-200 outline-none"
                    >
                        {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                
                {/* Social Network Selector */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Rede Social</label>
                    <div className="relative">
                        <select 
                            value={editedTask.socialPlatform || ''}
                            onChange={(e) => setEditedTask({ ...editedTask, socialPlatform: e.target.value as SocialPlatform })}
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-joy-200 outline-none appearance-none"
                        >
                            <option value="">Selecione...</option>
                            {SOCIAL_PLATFORMS.map(p => (
                                <option key={p.label} value={p.label}>{p.label}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            {getPlatformIcon(editedTask.socialPlatform || '')}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Data de Entrega</label>
                    <input 
                        type="date" 
                        value={new Date(editedTask.dueDate).toISOString().split('T')[0]}
                        onChange={(e) => setEditedTask({...editedTask, dueDate: new Date(e.target.value).getTime()})}
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-joy-200 outline-none"
                    />
                </div>

                {/* Tags Management */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase flex justify-between items-center">
                        Etiquetas 
                        <button onClick={() => setIsCreatingTag(!isCreatingTag)} className="text-joy-500 hover:text-joy-600"><Plus size={14}/></button>
                    </label>
                    
                    {isCreatingTag && (
                        <div className="bg-white p-3 rounded-xl border border-joy-100 shadow-sm space-y-2 animate-fade-in">
                            <input 
                                placeholder="Nome da etiqueta" 
                                className="w-full text-xs p-1 border-b outline-none"
                                value={newTagName}
                                onChange={e => setNewTagName(e.target.value)}
                            />
                            <div className="flex flex-wrap gap-1">
                                {TAG_COLORS.map(color => (
                                    <button 
                                        key={color} 
                                        onClick={() => setNewTagColor(color)}
                                        className={clsx("w-4 h-4 rounded-full", color.split(' ')[0], newTagColor === color && "ring-2 ring-offset-1 ring-gray-400")}
                                    />
                                ))}
                            </div>
                            <button onClick={handleCreateTag} className="w-full bg-joy-500 text-white text-xs font-bold py-1 rounded-lg">Criar</button>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => {
                            const isSelected = editedTask.tags.some(t => t.id === tag.id);
                            return (
                                <button
                                    key={tag.id}
                                    onClick={() => toggleTag(tag)}
                                    className={clsx(
                                        "px-2 py-1 rounded-lg text-xs font-bold border transition-all",
                                        tag.color,
                                        isSelected ? "ring-2 ring-offset-1 ring-joy-400 border-transparent" : "opacity-60 hover:opacity-100 border-transparent bg-opacity-50"
                                    )}
                                >
                                    {tag.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Delegar</label>
                    <select 
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 shadow-sm focus:ring-2 focus:ring-joy-200 outline-none"
                        value={editedTask.assigneeId}
                        onChange={(e) => handleDelegation(e.target.value)}
                    >
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Anexos (Carrossel)</label>
                    <div className="grid grid-cols-2 gap-2">
                        <label className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl text-xs cursor-pointer hover:bg-joy-50 hover:border-joy-200 text-gray-600 transition-colors">
                            <ImageIcon size={20} className="mb-1 text-joy-400" />
                            Adicionar Imagens
                            <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                        </label>
                        
                        {!showLinkInput ? (
                            <div 
                                onClick={() => setShowLinkInput(true)}
                                className={clsx(
                                    "flex flex-col items-center justify-center p-3 bg-white border rounded-xl text-xs cursor-pointer transition-colors relative group",
                                    editedTask.link ? "border-blue-200 bg-blue-50 text-blue-700" : "border-gray-200 hover:bg-joy-50 hover:border-joy-200 text-gray-600"
                                )}
                            >
                                <LinkIcon size={20} className={clsx("mb-1", editedTask.link ? "text-blue-500" : "text-joy-400")} />
                                {editedTask.link ? 'Editar Link' : 'Adicionar Link'}
                            </div>
                        ) : (
                            <div className="col-span-1 p-1 bg-white border border-joy-300 rounded-xl flex items-center">
                                <input 
                                    autoFocus
                                    className="w-full text-xs outline-none p-1" 
                                    placeholder="https://..."
                                    value={tempLink}
                                    onChange={e => setTempLink(e.target.value)}
                                    onBlur={() => !tempLink && setShowLinkInput(false)}
                                />
                                <button onClick={saveLink} className="p-1 bg-joy-500 text-white rounded-lg ml-1 hover:bg-joy-600">
                                    <Check size={12} />
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {editedTask.link && (
                        <div className="mt-2 text-xs text-blue-600 truncate bg-blue-50 p-2 rounded-lg border border-blue-100 flex justify-between items-center">
                            <a href={editedTask.link} target="_blank" rel="noreferrer" className="truncate flex-1 hover:underline flex items-center gap-1">
                                <ExternalLink size={10}/> {editedTask.link}
                            </a>
                            <button onClick={() => setEditedTask({...editedTask, link: undefined})} className="text-red-400 hover:text-red-600 ml-2"><Trash2 size={12}/></button>
                        </div>
                    )}
                </div>

                <hr className="border-gray-200" />
                
                {!editedTask.isApprovalRequested && (
                    <button 
                        onClick={sendForApproval}
                        className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 shadow-lg shadow-blue-200 transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Send size={18} /> Enviar Aprovação
                    </button>
                )}

                <button 
                    onClick={handleSave}
                    className="w-full py-4 bg-joy-500 text-white rounded-2xl font-bold text-lg hover:bg-joy-600 shadow-xl shadow-joy-300 transition-transform active:scale-95"
                >
                    Salvar Card
                </button>
            </div>
        </div>
      </div>
    </div>

    {/* Image Lightbox Overlay */}
    {isImageExpanded && expandedImageSrc && (
        <div 
            className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
            onClick={() => setIsImageExpanded(false)}
        >
            <img 
                src={expandedImageSrc} 
                alt="Full size" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
            />
            <button className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors">
                <X size={48} />
            </button>
        </div>
    )}
    </>
  );
};

export default TaskModal;

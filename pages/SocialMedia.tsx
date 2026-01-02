
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus, SocialPlatform } from '../types';
import { Calendar as CalendarIcon, Grid, Plus, Sparkles, ChevronLeft, ChevronRight, Image as ImageIcon, Smartphone, Hash, BarChart3, GripVertical, Clock, X, Layers, Instagram, Facebook, Linkedin, Youtube, Twitter, MessageCircle, Video, Filter } from 'lucide-react';
import clsx from 'clsx';
import { generateCaption } from '../services/geminiService';
import { SOCIAL_PLATFORMS } from '../constants';

const HASHTAG_GROUPS = {
    'Geral': '#marketing #sucesso #business #empreendedorismo',
    'Vendas': '#promoção #oferta #blackfriday #desconto #imperdivel',
    'Lifestyle': '#goodvibes #lifestyle #diaadia #bastidores #team',
    'Motivacional': '#foco #força #fé #motivação #frasedodia'
};

const SocialMedia: React.FC = () => {
  const { tasks, updateTask, currentUser, addTask } = useApp();
  const [viewMode, setViewMode] = useState<'calendar' | 'feed'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  
  // Platform Filter State
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<SocialPlatform | 'ALL'>('ALL');

  // Creator State
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostDate, setNewPostDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newPostPlatform, setNewPostPlatform] = useState<SocialPlatform>('Instagram');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null); // For editing existing

  // Filter tasks relevant to Social Media
  const socialTasks = tasks.filter(t => 
    t.origin === 'Instagram/Facebook' || 
    t.origin === 'TikTok' || 
    t.tags.some(tag => tag.name.toLowerCase().includes('social') || tag.name.toLowerCase().includes('insta')) ||
    t.socialPlatform !== undefined
  );

  const filteredSocialTasks = selectedPlatformFilter === 'ALL' 
    ? socialTasks 
    : socialTasks.filter(t => t.socialPlatform === selectedPlatformFilter);

  const backlogTasks = filteredSocialTasks.filter(t => !t.postDate);
  const scheduledTasks = filteredSocialTasks.filter(t => t.postDate);

  // Calendar Logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
      setDraggedTaskId(taskId);
      e.dataTransfer.setData("taskId", taskId);
  };

  const handleDropOnDay = (e: React.DragEvent, day: number) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData("taskId");
      if (taskId) {
          const task = tasks.find(t => t.id === taskId);
          if (task) {
              const newPostDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getTime();
              updateTask({ ...task, postDate: newPostDate });
          }
      }
      setDraggedTaskId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
  };

  const openCreator = (task?: Task) => {
      if (task) {
          setActiveTask(task);
          setNewPostCaption(task.caption || task.description || '');
          setNewPostImage(task.imageUrl || null);
          setNewPostDate(task.postDate ? new Date(task.postDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
          setNewPostPlatform(task.socialPlatform || 'Instagram');
      } else {
          setActiveTask(null);
          setNewPostCaption('');
          setNewPostImage(null);
          setNewPostDate(new Date().toISOString().split('T')[0]);
          setNewPostPlatform('Instagram');
      }
      setIsCreatorOpen(true);
  };

  const handleGenerateCaption = async () => {
      setIsGenerating(true);
      const topic = activeTask?.title || newPostCaption || "Marketing Digital";
      const caption = await generateCaption(topic, "Divertido e inspirador");
      setNewPostCaption(caption);
      setIsGenerating(false);
  };

  const savePost = () => {
      const timestamp = new Date(newPostDate).getTime();
      if (activeTask) {
          updateTask({
              ...activeTask,
              caption: newPostCaption,
              imageUrl: newPostImage || undefined,
              postDate: timestamp,
              socialPlatform: newPostPlatform,
              status: TaskStatus.TODO
          });
      } else {
          const newTask: Task = {
              id: Math.random().toString(),
              title: 'Novo Post Social',
              description: 'Criado via Social Studio',
              caption: newPostCaption,
              imageUrl: newPostImage || undefined,
              postDate: timestamp,
              socialPlatform: newPostPlatform,
              status: TaskStatus.TODO,
              columnId: 'c_todo', // Default
              assigneeId: currentUser?.id || '',
              creatorId: currentUser?.id || '',
              createdAt: Date.now(),
              dueDate: timestamp,
              tags: [{ id: 'social', name: 'Social Media', color: 'bg-pink-200 text-pink-800' }],
              emoji: '📸',
              comments: [],
              history: [],
              isApprovalRequested: false,
              approvalStatus: 'none',
              subtasks: [],
              estimatedHours: 1,
              timeSpent: 0,
              isTimerRunning: false,
              origin: 'Instagram/Facebook'
          };
          addTask(newTask);
      }
      setIsCreatorOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setNewPostImage(reader.result as string);
          reader.readAsDataURL(file);
      }
  };

  const changeMonth = (offset: number) => {
      const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
      setCurrentDate(new Date(newDate));
  };

  const getPlatformIcon = (platform?: SocialPlatform) => {
      const found = SOCIAL_PLATFORMS.find(p => p.label === platform);
      return found ? found.icon : <Grid size={14}/>;
  };
  
  const getPlatformColor = (platform?: SocialPlatform) => {
      const found = SOCIAL_PLATFORMS.find(p => p.label === platform);
      return found ? found.color : 'bg-gray-100 text-gray-500';
  };

  return (
    <div className="flex h-full gap-6">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                        Social Planner 📸
                    </h2>
                    <p className="text-gray-400 font-bold text-sm">Organize, crie e agende.</p>
                </div>
                
                <div className="flex gap-4">
                    {/* Platform Filter */}
                    <div className="relative group">
                         <div className="py-2"> {/* Added Wrapper to prevent hover gap */}
                            <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm font-bold text-gray-600 hover:text-pink-500 transition-colors">
                                <Filter size={16}/> {selectedPlatformFilter === 'ALL' ? 'Todas Redes' : selectedPlatformFilter}
                            </button>
                         </div>
                         <div className="absolute top-full left-0 bg-white shadow-xl rounded-xl border border-gray-100 p-2 w-48 z-20 hidden group-hover:block animate-fade-in mt-0">
                             <button onClick={() => setSelectedPlatformFilter('ALL')} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm font-bold text-gray-600">Todas</button>
                             {SOCIAL_PLATFORMS.map(p => (
                                 <button key={p.label} onClick={() => setSelectedPlatformFilter(p.label)} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm font-bold text-gray-600 flex items-center gap-2">
                                     {p.icon} {p.label}
                                 </button>
                             ))}
                         </div>
                    </div>

                    <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                        <button 
                            onClick={() => setViewMode('calendar')}
                            className={clsx("px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors", viewMode === 'calendar' ? "bg-joy-100 text-joy-600" : "text-gray-500 hover:text-gray-700")}
                        >
                            <CalendarIcon size={16}/>
                        </button>
                        <button 
                            onClick={() => setViewMode('feed')}
                            className={clsx("px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors", viewMode === 'feed' ? "bg-purple-100 text-purple-600" : "text-gray-500 hover:text-gray-700")}
                        >
                            <Grid size={16}/>
                        </button>
                    </div>

                    <button 
                        onClick={() => openCreator()}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-pink-200 hover:shadow-xl transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Plus size={20}/> Novo Post
                    </button>
                </div>
            </div>

            {/* View: Calendar */}
            {viewMode === 'calendar' && (
                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden animate-fade-in">
                    <div className="p-4 flex items-center justify-between border-b border-gray-100">
                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft/></button>
                        <h3 className="text-xl font-bold text-gray-700 capitalize">
                            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight/></button>
                    </div>
                    
                    <div className="grid grid-cols-7 text-center py-2 bg-gray-50 border-b border-gray-100">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                            <div key={d} className="text-xs font-bold text-gray-400 uppercase">{d}</div>
                        ))}
                    </div>

                    <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-gray-50/30 border-r border-b border-gray-100"></div>
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dateTs = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                            const daysTasks = scheduledTasks.filter(t => t.postDate && new Date(t.postDate).toDateString() === dateTs);
                            
                            return (
                                <div 
                                    key={day}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDropOnDay(e, day)}
                                    className="border-r border-b border-gray-100 min-h-[100px] p-2 relative group hover:bg-pink-50/30 transition-colors"
                                >
                                    <span className="text-sm font-bold text-gray-400 group-hover:text-pink-400">{day}</span>
                                    <div className="mt-1 space-y-1">
                                        {daysTasks.map(t => (
                                            <div 
                                                key={t.id}
                                                onClick={() => openCreator(t)}
                                                className={clsx(
                                                    "text-[10px] p-1 rounded-md font-bold truncate cursor-pointer shadow-sm transition-transform hover:scale-105 flex items-center gap-1",
                                                    t.status === TaskStatus.DONE ? "bg-green-100 text-green-700" : "bg-white border border-pink-100 text-gray-600"
                                                )}
                                                title={`${t.socialPlatform}: ${t.title}`}
                                            >
                                                <span className={clsx("p-0.5 rounded-full shrink-0", getPlatformColor(t.socialPlatform))}>{getPlatformIcon(t.socialPlatform)}</span>
                                                <span className="truncate">{t.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {draggedTaskId && <div className="absolute inset-0 bg-pink-100/20 border-2 border-dashed border-pink-300 pointer-events-none opacity-0 group-hover:opacity-100 rounded-lg m-1 flex items-center justify-center text-xs font-bold text-pink-400">Soltar aqui</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* View: Feed Preview */}
            {viewMode === 'feed' && (
                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 overflow-y-auto animate-fade-in">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                             <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]">
                                <div className="w-full h-full rounded-full bg-white p-1">
                                    <img src={currentUser?.avatar} className="w-full h-full rounded-full object-cover" alt="Profile" />
                                </div>
                             </div>
                             <div>
                                 <h2 className="text-2xl font-bold text-gray-800">marketing.oficial</h2>
                                 <div className="flex gap-4 text-sm font-bold text-gray-600 mt-2">
                                     <span>142 posts</span>
                                     <span>2.5k seguidores</span>
                                     <span>120 seguindo</span>
                                 </div>
                                 <p className="text-gray-500 text-sm mt-2">Marketing com alegria! 🚀✨</p>
                                 <div className="mt-2 text-xs font-bold text-pink-500 bg-pink-50 px-2 py-1 rounded-md inline-block">
                                     Visualizando: {selectedPlatformFilter === 'ALL' ? 'Tudo Misturado' : selectedPlatformFilter}
                                 </div>
                             </div>
                        </div>

                        <div className="grid grid-cols-3 gap-1 md:gap-4">
                            {scheduledTasks
                                .sort((a, b) => (a.postDate || 0) - (b.postDate || 0))
                                .map(t => (
                                    <div key={t.id} className="aspect-square bg-gray-100 relative group cursor-pointer overflow-hidden rounded-md" onClick={() => openCreator(t)}>
                                        {t.imageUrl ? (
                                            <img src={t.imageUrl} alt="Post" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                                <span className="text-3xl">{t.emoji}</span>
                                                <span className="text-xs text-center px-2 mt-1">{t.title}</span>
                                            </div>
                                        )}
                                        {t.attachments && t.attachments.length > 1 && (
                                            <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-sm">
                                                <Layers size={14} className="text-white"/>
                                            </div>
                                        )}
                                        {/* Platform Icon Overlay */}
                                        <div className="absolute top-2 left-2 bg-white/90 p-1 rounded-full shadow-sm">
                                            {getPlatformIcon(t.socialPlatform)}
                                        </div>

                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm">
                                            {new Date(t.postDate!).toLocaleDateString([], {day: '2-digit', month: '2-digit'})}
                                        </div>
                                    </div>
                                ))
                            }
                            {/* Placeholders */}
                            {[1,2,3].map(i => (
                                <div key={i} className="aspect-square bg-gray-50 border border-gray-100 rounded-md flex items-center justify-center text-gray-200">
                                    <ImageIcon size={32}/>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Backlog Sidebar */}
        <div className="w-72 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            <div className="p-4 bg-pink-50 border-b border-pink-100">
                <h3 className="font-bold text-pink-700 flex items-center gap-2">
                    <Grid size={18}/> Backlog Kanban
                </h3>
                <p className="text-xs text-pink-500">Arraste para o calendário</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {backlogTasks.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        <p>Tudo agendado! 🎉</p>
                        <p className="text-xs mt-2">Crie tarefas no Kanban com a tag "Social Media" para aparecerem aqui.</p>
                    </div>
                )}
                {backlogTasks.map(task => (
                    <div 
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing hover:border-pink-300 transition-all group"
                    >
                        {task.imageUrl && (
                            <div className="h-24 w-full mb-2 rounded-lg overflow-hidden relative">
                                <img src={task.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                                {task.attachments && task.attachments.length > 1 && (
                                    <div className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-sm">
                                        <Layers size={12} />
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xl">{task.emoji}</span>
                            <div className="flex gap-1">
                                {task.socialPlatform && <span className={clsx("p-1 rounded-full", getPlatformColor(task.socialPlatform))}>{getPlatformIcon(task.socialPlatform)}</span>}
                                <GripVertical size={16} className="text-gray-300 group-hover:text-pink-400"/>
                            </div>
                        </div>
                        <p className="font-bold text-sm text-gray-700 line-clamp-2 leading-tight">{task.title}</p>
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400">
                            <Clock size={10}/>
                            <span>Prazo: {new Date(task.dueDate).toLocaleDateString([], {day:'2-digit', month:'2-digit'})}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Mobile Creator Modal */}
        {isCreatorOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex animate-fade-in relative">
                    <button 
                        onClick={() => setIsCreatorOpen(false)}
                        className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 text-gray-500"
                    >
                        <X size={20}/>
                    </button>

                    {/* Left: Tools */}
                    <div className="w-1/2 p-8 bg-gray-50 overflow-y-auto custom-scrollbar border-r border-gray-200">
                        <h3 className="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
                            <Sparkles className="text-pink-500"/> Estúdio de Criação
                        </h3>

                        <div className="space-y-6">
                            
                            {/* Platform Selector */}
                            <div>
                                <label className="font-bold text-gray-600 text-sm uppercase mb-2 block">Onde vamos postar?</label>
                                <div className="relative">
                                    <select 
                                        value={newPostPlatform}
                                        onChange={(e) => setNewPostPlatform(e.target.value as SocialPlatform)}
                                        className="w-full p-3 pl-10 rounded-xl border border-gray-200 outline-none focus:border-pink-400 text-gray-700 font-bold appearance-none bg-white cursor-pointer"
                                    >
                                        {SOCIAL_PLATFORMS.map(p => (
                                            <option key={p.label} value={p.label}>{p.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-pink-500">
                                        {getPlatformIcon(newPostPlatform)}
                                    </div>
                                </div>
                            </div>

                            {/* Upload */}
                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-white hover:border-pink-400 transition-colors cursor-pointer relative group">
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                                {newPostImage ? (
                                    <div className="relative h-40">
                                        <img src={newPostImage} className="h-full w-full object-contain rounded-lg" alt="Upload" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">Trocar Imagem</div>
                                    </div>
                                ) : (
                                    <div className="text-gray-400">
                                        <ImageIcon size={40} className="mx-auto mb-2"/>
                                        <p className="font-bold">Arraste uma imagem ou clique</p>
                                    </div>
                                )}
                            </div>

                            {/* Caption & AI */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="font-bold text-gray-600 text-sm uppercase">Legenda</label>
                                    <button 
                                        onClick={handleGenerateCaption}
                                        disabled={isGenerating}
                                        className="text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full font-bold flex items-center gap-1 hover:shadow-md transition-all"
                                    >
                                        <Sparkles size={12}/> {isGenerating ? 'Criando...' : 'Mágica do Gemini'}
                                    </button>
                                </div>
                                <textarea 
                                    className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none resize-none text-sm text-gray-700"
                                    placeholder="Escreva algo incrível..."
                                    value={newPostCaption}
                                    onChange={e => setNewPostCaption(e.target.value)}
                                />
                            </div>

                            {/* Hashtags */}
                            <div>
                                <label className="font-bold text-gray-600 text-sm uppercase mb-2 block">Grupos de Hashtags</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(HASHTAG_GROUPS).map(([group, tags]) => (
                                        <button 
                                            key={group}
                                            onClick={() => setNewPostCaption(prev => prev + ' ' + tags)}
                                            className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:border-pink-400 hover:text-pink-500 transition-colors flex items-center gap-1"
                                        >
                                            <Hash size={12}/> {group}
                                        </button>
                                    ))}
                                </div>
                            </div>

                             {/* Date */}
                             <div>
                                <label className="font-bold text-gray-600 text-sm uppercase mb-2 block">Data da Publicação</label>
                                <input 
                                    type="date"
                                    value={newPostDate}
                                    onChange={e => setNewPostDate(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-pink-400 text-gray-700 font-bold"
                                />
                            </div>

                            {/* Viralometer (Mock) */}
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-100">
                                <h4 className="font-bold text-orange-600 flex items-center gap-2 mb-2">
                                    <BarChart3 size={18}/> Viralômetro
                                </h4>
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                    <div className="bg-orange-400 h-2 rounded-full" style={{ width: `${Math.min(100, (newPostCaption.length / 5) + (newPostImage ? 40 : 0))}%` }}></div>
                                </div>
                                <p className="text-xs text-orange-400 font-bold text-right">Potencial de alcance: Alto 🚀</p>
                            </div>

                            <button 
                                onClick={savePost}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-colors shadow-xl"
                            >
                                {activeTask ? 'Atualizar Post' : 'Agendar Post'}
                            </button>
                        </div>
                    </div>

                    {/* Right: Phone Preview */}
                    <div className="w-1/2 bg-gray-100 flex items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                        <div className="w-[320px] h-[650px] bg-white rounded-[40px] shadow-2xl border-8 border-gray-900 relative overflow-hidden flex flex-col">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>
                            
                            {/* Phone Header */}
                            <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-center pt-4 shrink-0 gap-2">
                                <span className="font-bold text-gray-800 text-sm">Post Preview</span>
                                <span className={clsx("p-1 rounded-full", getPlatformColor(newPostPlatform))}>{getPlatformIcon(newPostPlatform)}</span>
                            </div>

                            {/* Phone Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                                <div className="flex items-center gap-2 p-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 p-[2px]">
                                        <img src={currentUser?.avatar} className="w-full h-full rounded-full border border-white" />
                                    </div>
                                    <span className="text-xs font-bold">marketing.oficial</span>
                                </div>
                                
                                <div className="w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                                    {newPostImage ? (
                                        <img src={newPostImage} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-gray-300 flex flex-col items-center">
                                            <ImageIcon size={40}/>
                                            <span className="text-xs mt-1">Imagem aqui</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-3">
                                    <div className="flex gap-3 text-gray-700 mb-2">
                                        <span className="hover:text-red-500 cursor-pointer">❤</span>
                                        <span>💬</span>
                                        <span>✈</span>
                                    </div>
                                    <p className="text-xs text-gray-800 leading-relaxed">
                                        <span className="font-bold mr-1">marketing.oficial</span>
                                        {newPostCaption || 'Sua legenda incrível aparecerá aqui... ✨'}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-2 uppercase">Há 2 minutos</p>
                                </div>
                            </div>

                            {/* Phone Footer */}
                            <div className="h-12 border-t border-gray-100 flex justify-around items-center text-gray-400">
                                <Smartphone size={20} className="text-black"/>
                                <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default SocialMedia;

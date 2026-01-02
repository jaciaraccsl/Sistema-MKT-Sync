
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskStatus, Task } from '../types';
import { CheckCircle, XCircle, Clock, ZoomIn, Calendar, Tag, Share2, AlertCircle, X } from 'lucide-react';
import clsx from 'clsx';

const Approvals: React.FC = () => {
  const { tasks, updateTask, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // State for Rejection (Change Request) inside Modal
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Image Zoom State
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const approvalTasks = tasks.filter(t => t.isApprovalRequested);
  
  const filteredTasks = approvalTasks.filter(t => {
      if (activeTab === 'pending') return t.approvalStatus === 'pending';
      if (activeTab === 'approved') return t.approvalStatus === 'approved';
      return t.approvalStatus === 'rejected';
  });

  const handleApprove = (task: Task) => {
    updateTask({
        ...task,
        approvalStatus: 'approved',
        status: TaskStatus.DONE,
        history: [...task.history, { id: Math.random().toString(), action: 'Aprovado!', timestamp: Date.now(), userId: currentUser?.id || 'sys' }]
    });
    setSelectedTask(null);
  };

  const handleReject = (task: Task) => {
      if (!rejectionReason.trim()) return;
      
      updateTask({
        ...task,
        approvalStatus: 'rejected',
        status: TaskStatus.IN_PROGRESS,
        comments: [...task.comments, { id: Math.random().toString(), userId: currentUser?.id || 'sys', text: `Solicitação de alteração: ${rejectionReason}`, timestamp: Date.now() }],
        history: [...task.history, { id: Math.random().toString(), action: 'Solicitou alterações', timestamp: Date.now(), userId: currentUser?.id || 'sys' }]
      });
      
      setRejectionReason('');
      setIsRejecting(false);
      setSelectedTask(null);
  };

  const handleDismiss = (task: Task) => {
      // Remove from approval list by setting isApprovalRequested to false
      updateTask({
          ...task,
          isApprovalRequested: false
      });
      setSelectedTask(null);
  };

  const openModal = (task: Task) => {
      setSelectedTask(task);
      setIsRejecting(false);
      setRejectionReason('');
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400 mb-8">Central de Aprovação 🎨</h2>

      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm flex flex-col items-center border-b-4 border-yellow-400">
            <span className="text-4xl font-black text-gray-800">{approvalTasks.filter(t => t.approvalStatus === 'pending').length}</span>
            <span className="text-gray-500 font-bold">Em Análise</span>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm flex flex-col items-center border-b-4 border-green-500">
            <span className="text-4xl font-black text-gray-800">{approvalTasks.filter(t => t.approvalStatus === 'approved').length}</span>
            <span className="text-gray-500 font-bold">Aprovadas</span>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm flex flex-col items-center border-b-4 border-red-400">
            <span className="text-4xl font-black text-gray-800">{approvalTasks.filter(t => t.approvalStatus === 'rejected').length}</span>
            <span className="text-gray-500 font-bold">Ajustes</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6">
          {['pending', 'approved', 'rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={clsx(
                    "px-6 py-2 rounded-full font-bold capitalize transition-all",
                    activeTab === tab ? "bg-joy-500 text-white shadow-md" : "bg-white text-gray-500 hover:bg-gray-50"
                )}
              >
                  {tab === 'pending' ? 'Em Análise' : tab === 'approved' ? 'Aprovados' : 'Reprovados'}
              </button>
          ))}
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.length === 0 && (
              <div className="col-span-full text-center py-20 text-gray-400">
                  <p className="text-xl">Nenhuma arte nesta categoria ✨</p>
              </div>
          )}
          
          {filteredTasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => openModal(task)}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-transparent hover:border-joy-300"
              >
                  <div className="h-48 bg-gray-100 relative overflow-hidden">
                      {task.imageUrl ? (
                          <img src={task.imageUrl} alt="Art" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                              <span className="text-4xl">🖼️</span>
                          </div>
                      )}
                      {task.approvalStatus === 'approved' && (
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                              <span className="bg-white text-green-600 px-4 py-1 rounded-full font-bold shadow-lg">Aprovado</span>
                          </div>
                      )}
                  </div>
                  
                  <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{task.title}</h3>
                          <span className="text-2xl">{task.emoji}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-bold">{task.origin || 'Geral'}</span>
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-400 text-center font-bold mt-2 text-joy-500">Clique para ver detalhes</p>
                  </div>
              </div>
          ))}
      </div>

      {/* Approval Detail Modal */}
      {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-fade-in">
                  
                  {/* Left Side: Image */}
                  <div 
                      className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center relative overflow-hidden group cursor-zoom-in"
                      onClick={() => selectedTask.imageUrl && setIsImageExpanded(true)}
                  >
                      {selectedTask.imageUrl ? (
                          <>
                            <img src={selectedTask.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                                <ZoomIn className="text-white opacity-0 group-hover:opacity-100 drop-shadow-lg transition-opacity" size={48} />
                            </div>
                          </>
                      ) : (
                          <div className="flex flex-col items-center text-gray-400">
                              <ZoomIn size={48} className="mb-2"/>
                              <p>Sem imagem anexada</p>
                          </div>
                      )}
                  </div>

                  {/* Right Side: Details */}
                  <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto custom-scrollbar relative">
                      <button 
                        onClick={() => setSelectedTask(null)}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                          <X size={24} className="text-gray-400"/>
                      </button>

                      <div className="mb-6">
                          <div className="flex items-center gap-2 mb-2">
                              <span className="text-3xl">{selectedTask.emoji}</span>
                              <span className={clsx("px-3 py-1 rounded-full text-xs font-bold uppercase", 
                                selectedTask.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                selectedTask.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
                              )}>
                                  {selectedTask.approvalStatus === 'pending' ? 'Em Análise' : selectedTask.approvalStatus === 'approved' ? 'Aprovado' : 'Reprovado'}
                              </span>
                          </div>
                          <h2 className="text-2xl font-extrabold text-gray-800 leading-tight mb-2">{selectedTask.title}</h2>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                             {selectedTask.tags.map(tag => (
                                 <span key={tag.id} className={`text-xs px-2 py-1 rounded-md font-bold flex items-center gap-1 ${tag.color}`}>
                                     <Tag size={10}/> {tag.name}
                                 </span>
                             ))}
                             <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold flex items-center gap-1">
                                 <Share2 size={10}/> {selectedTask.origin || 'Não especificado'}
                             </span>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                                  <Clock size={10}/> Entrega da Arte
                              </label>
                              <p className="font-bold text-gray-700">{new Date(selectedTask.dueDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                                  <Calendar size={10}/> Data do Post
                              </label>
                              <p className="font-bold text-joy-600">
                                  {selectedTask.postDate ? new Date(selectedTask.postDate).toLocaleDateString() : '---'}
                              </p>
                          </div>
                      </div>

                      <div className="space-y-4 mb-8 flex-1">
                          <div>
                              <h4 className="text-sm font-bold text-gray-500 uppercase mb-1">Descrição</h4>
                              <p className="text-gray-700 bg-gray-50 p-3 rounded-xl text-sm leading-relaxed">{selectedTask.description}</p>
                          </div>
                          {selectedTask.caption && (
                              <div>
                                  <h4 className="text-sm font-bold text-gray-500 uppercase mb-1">Legenda</h4>
                                  <p className="text-gray-600 italic bg-gray-50 p-3 rounded-xl text-sm border-l-4 border-joy-300">
                                      "{selectedTask.caption}"
                                  </p>
                              </div>
                          )}
                      </div>

                      {/* Action Area */}
                      {selectedTask.approvalStatus === 'pending' && (
                          <div className="mt-auto pt-4 border-t border-gray-100">
                              {!isRejecting ? (
                                  <div className="flex gap-4">
                                      <button 
                                        onClick={() => setIsRejecting(true)}
                                        className="flex-1 py-3 rounded-2xl border-2 border-red-100 text-red-500 font-bold hover:bg-red-50 transition-colors"
                                      >
                                          Solicitar Alteração
                                      </button>
                                      <button 
                                        onClick={() => handleApprove(selectedTask)}
                                        className="flex-1 py-3 rounded-2xl bg-green-500 text-white font-bold hover:bg-green-600 shadow-lg shadow-green-200 transition-transform active:scale-95"
                                      >
                                          Aprovar Arte ✅
                                      </button>
                                  </div>
                              ) : (
                                  <div className="animate-fade-in">
                                      <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-red-500 flex items-center gap-2"><AlertCircle size={16}/> O que precisa ser alterado?</h4>
                                        <button onClick={() => setIsRejecting(false)} className="text-xs text-gray-400 underline">Cancelar</button>
                                      </div>
                                      <textarea 
                                        autoFocus
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Descreva detalhadamente as alterações necessárias..."
                                        className="w-full h-24 p-3 bg-red-50 border border-red-100 rounded-xl focus:ring-2 focus:ring-red-200 outline-none text-sm mb-3 text-gray-700 resize-none"
                                      />
                                      <button 
                                        onClick={() => handleReject(selectedTask)}
                                        disabled={!rejectionReason.trim()}
                                        className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      >
                                          Enviar Solicitação
                                      </button>
                                  </div>
                              )}
                          </div>
                      )}

                      {selectedTask.approvalStatus === 'rejected' && (
                          <div className="mt-auto p-4 bg-red-50 border border-red-100 rounded-xl mb-4">
                              <p className="text-xs font-bold text-red-400 uppercase mb-1">Último feedback</p>
                              <p className="text-red-700 text-sm">{selectedTask.comments[selectedTask.comments.length-1]?.text}</p>
                          </div>
                      )}

                      {(selectedTask.approvalStatus === 'approved' || selectedTask.approvalStatus === 'rejected') && (
                           <button 
                              onClick={() => handleDismiss(selectedTask)}
                              className="w-full py-3 bg-joy-500 text-white rounded-xl font-bold hover:bg-joy-600 shadow-lg shadow-joy-200 transition-transform active:scale-95 flex items-center justify-center gap-2 mt-auto"
                            >
                              <CheckCircle size={20} /> Concluído
                            </button>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Image Lightbox Overlay for Approvals */}
      {isImageExpanded && selectedTask?.imageUrl && (
        <div 
            className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
            onClick={(e) => {
                e.stopPropagation();
                setIsImageExpanded(false);
            }}
        >
            <img 
                src={selectedTask.imageUrl} 
                alt="Full View" 
                className="max-w-full max-h-full object-contain rounded-md"
            />
            <button onClick={() => setIsImageExpanded(false)} className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors">
                <X size={48} />
            </button>
        </div>
      )}
    </div>
  );
};

export default Approvals;

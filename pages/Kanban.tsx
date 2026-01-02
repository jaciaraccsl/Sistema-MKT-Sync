import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, Column as ColumnType, TaskStatus, UserRole } from '../types';
import TaskModal from '../components/TaskModal';
import { Plus, GripVertical, AlertCircle, Clock, Tag as TagIcon } from 'lucide-react';

const Kanban: React.FC = () => {
  const { tasks, columns, updateTask, currentUser, addTask, addColumn } = useApp();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [newColTitle, setNewColTitle] = useState('');
  const [isAddingCol, setIsAddingCol] = useState(false);

  // Filter tasks: ADMIN sees all, User sees assigned + created + delegated by them
  const visibleTasks = currentUser?.role === UserRole.ADMIN 
    ? tasks 
    : tasks.filter(t => t.assigneeId === currentUser?.id);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, columnId: string, colTitle: string) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const task = tasks.find(t => t.id === draggedTaskId);
    if (task) {
      // Map column ID to Status based on the new specific columns
      let newStatus = task.status;
      const lowerTitle = colTitle.toLowerCase();
      
      if (lowerTitle.includes('ideias')) newStatus = TaskStatus.IDEAS;
      else if (lowerTitle.includes('fazer')) newStatus = TaskStatus.TODO;
      else if (lowerTitle.includes('andamento')) newStatus = TaskStatus.IN_PROGRESS;
      else if (lowerTitle.includes('conclu')) newStatus = TaskStatus.DONE;
      else if (lowerTitle.includes('aguard')) newStatus = TaskStatus.WAITING;
      else if (lowerTitle.includes('cancelad')) newStatus = TaskStatus.CANCELLED;

      updateTask({ 
        ...task, 
        columnId, 
        status: newStatus,
        completedAt: newStatus === TaskStatus.DONE ? Date.now() : undefined
      });
    }
    setDraggedTaskId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const createNewTask = (columnId: string) => {
    // Determine status based on column
    const col = columns.find(c => c.id === columnId);
    let initialStatus = TaskStatus.TODO;
    if (col) {
        const lowerTitle = col.title.toLowerCase();
        if (lowerTitle.includes('ideias')) initialStatus = TaskStatus.IDEAS;
        else if (lowerTitle.includes('fazer')) initialStatus = TaskStatus.TODO;
        else if (lowerTitle.includes('andamento')) initialStatus = TaskStatus.IN_PROGRESS;
        else if (lowerTitle.includes('conclu')) initialStatus = TaskStatus.DONE;
        else if (lowerTitle.includes('aguard')) initialStatus = TaskStatus.WAITING;
        else if (lowerTitle.includes('cancelad')) initialStatus = TaskStatus.CANCELLED;
    }

    const newTask: Task = {
        id: Math.random().toString(),
        title: 'Nova Tarefa',
        description: 'Descrição da tarefa...',
        status: initialStatus,
        columnId,
        assigneeId: currentUser?.id || '',
        creatorId: currentUser?.id || '',
        createdAt: Date.now(),
        dueDate: Date.now() + 86400000,
        tags: [],
        emoji: '📌',
        comments: [],
        history: [],
        isApprovalRequested: false,
        approvalStatus: 'none',
        subtasks: [],
        estimatedHours: 0,
        timeSpent: 0,
        isTimerRunning: false
    };
    addTask(newTask);
    setSelectedTask(newTask); // Open modal immediately
  };

  return (
    <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-joy-500 to-purple-600">Tarefas 📋</h2>
            {currentUser?.role === UserRole.ADMIN && (
                <div className="flex gap-2">
                    {isAddingCol ? (
                        <div className="flex gap-2 animate-fade-in">
                            <input 
                                autoFocus
                                className="px-3 py-1 rounded-lg border border-joy-200 outline-none"
                                placeholder="Nome da coluna"
                                value={newColTitle}
                                onChange={e => setNewColTitle(e.target.value)}
                            />
                            <button 
                                onClick={() => { 
                                    if(newColTitle) addColumn(newColTitle, 'bg-gray-100'); 
                                    setNewColTitle(''); 
                                    setIsAddingCol(false);
                                }} 
                                className="bg-joy-500 text-white px-3 rounded-lg"
                            >OK</button>
                        </div>
                    ) : (
                        <button onClick={() => setIsAddingCol(true)} className="flex items-center gap-1 bg-white text-joy-600 px-4 py-2 rounded-xl shadow-sm hover:shadow-md font-bold transition-all">
                            <Plus size={18} /> Nova Coluna
                        </button>
                    )}
                </div>
            )}
        </div>

        <div className="flex-1 overflow-x-auto pb-4">
            <div className="flex h-full gap-6 min-w-max">
                {columns.sort((a,b) => a.order - b.order).map(col => (
                    <div 
                        key={col.id}
                        className={`w-80 flex-shrink-0 flex flex-col rounded-3xl ${col.color} bg-opacity-50 backdrop-blur-sm border border-white shadow-lg`}
                        onDrop={(e) => handleDrop(e, col.id, col.title)}
                        onDragOver={handleDragOver}
                    >
                        {/* Column Header */}
                        <div className="p-4 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">{col.title}</h3>
                            <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs font-bold text-gray-500">
                                {visibleTasks.filter(t => t.columnId === col.id).length}
                            </span>
                        </div>

                        {/* Task List */}
                        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3 custom-scrollbar">
                            {visibleTasks
                                .filter(t => t.columnId === col.id)
                                .map(task => (
                                    <div 
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                        onClick={() => setSelectedTask(task)}
                                        className="bg-white p-4 rounded-2xl shadow-sm border border-transparent hover:border-joy-300 hover:shadow-md transition-all cursor-pointer group relative"
                                    >
                                        {task.imageUrl && (
                                            <div className="h-32 mb-3 rounded-xl overflow-hidden">
                                                <img src={task.imageUrl} alt="cover" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-2xl">{task.emoji}</span>
                                            {task.dueDate < Date.now() && task.status !== TaskStatus.DONE && task.status !== TaskStatus.CANCELLED && task.status !== TaskStatus.IDEAS && (
                                                <AlertCircle size={16} className="text-red-500" />
                                            )}
                                        </div>

                                        <h4 className="font-bold text-gray-800 mb-1 leading-tight">{task.title}</h4>
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>

                                        {/* Tags Preview */}
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {task.tags.slice(0, 3).map(tag => (
                                                <span key={tag.id} className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${tag.color}`}>
                                                    {tag.name}
                                                </span>
                                            ))}
                                            {task.tags.length > 3 && <span className="text-[10px] text-gray-400">+{task.tags.length - 3}</span>}
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                                            <div className="flex -space-x-2">
                                                {/* Assigned User Avatar */}
                                                 <div className="w-6 h-6 rounded-full bg-joy-100 border border-white flex items-center justify-center text-xs font-bold text-joy-600">
                                                    {task.assigneeId === currentUser?.id ? 'Eu' : 'U'}
                                                 </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                <Clock size={12} />
                                                <span>{new Date(task.dueDate).toLocaleDateString([], {day:'2-digit', month:'2-digit'})}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                            <button 
                                onClick={() => createNewTask(col.id)}
                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 font-bold hover:border-joy-400 hover:text-joy-500 transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus size={16} /> Novo Card
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {selectedTask && (
            <TaskModal 
                task={selectedTask} 
                isOpen={!!selectedTask} 
                onClose={() => setSelectedTask(null)} 
            />
        )}
    </div>
  );
};

export default Kanban;
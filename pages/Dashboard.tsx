import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskStatus, UserRole } from '../types';
import { Calendar, Clock, Smile, Frown, Meh, AlertTriangle, CheckCircle, List, Save, Trash2, Edit2, Plus, Users } from 'lucide-react';
import { EMOTIONS, MOOD_QUOTES } from '../constants';
import clsx from 'clsx';

const Dashboard: React.FC = () => {
  const { currentUser, tasks, mood, setMood, notes, addNote, editNote, deleteNote, meetings, users } = useApp();
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'OVERDUE' | null>(null);
  const [motivationalQuote, setMotivationalQuote] = useState<string>('');
  
  // Notes State
  const [noteText, setNoteText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter tasks based on role and visibility rules
  const myTasks = currentUser?.role === 'ADMIN' 
    ? tasks 
    : tasks.filter(t => t.assigneeId === currentUser?.id);

  // Stats Logic
  const today = Date.now();
  const todoCount = myTasks.filter(t => t.status === TaskStatus.TODO).length;
  const dueTodayCount = myTasks.filter(t => new Date(t.dueDate).toDateString() === new Date(today).toDateString()).length;
  const waitingCount = myTasks.filter(t => t.status === TaskStatus.WAITING).length;
  const doneTodayCount = myTasks.filter(t => t.status === TaskStatus.DONE && new Date(t.completedAt || 0).toDateString() === new Date(today).toDateString()).length;
  const overdueCount = myTasks.filter(t => t.dueDate < today && t.status !== TaskStatus.DONE).length;

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    if (editingId) {
        editNote(editingId, noteText);
        setEditingId(null);
    } else {
        addNote(noteText);
    }
    setNoteText('');
  };

  const handleEditClick = (noteText: string, id: string) => {
      setNoteText(noteText);
      setEditingId(id);
  };

  const handleMoodSelection = (emoji: string) => {
    setMood(emoji);
    const quotes = MOOD_QUOTES[emoji] || ["Vamos lá!"];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setMotivationalQuote(randomQuote);
  };

  const StatCard = ({ title, count, color, icon, onClick, active }: any) => (
    <div 
      onClick={onClick}
      className={clsx(
        "p-4 rounded-3xl bg-white shadow-sm border-2 cursor-pointer transition-all hover:-translate-y-1",
        active ? `border-${color}-500 ring-2 ring-${color}-200` : "border-transparent",
        "hover:shadow-md"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-xl bg-${color}-100 text-${color}-600`}>
          {icon}
        </div>
        <span className={`text-2xl font-black text-${color}-600`}>{count}</span>
      </div>
      <p className="text-sm font-bold text-gray-500">{title}</p>
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800">
            Olá, {currentUser?.name.split(' ')[0]}! {mood}
          </h2>
          <p className="text-gray-500">Vamos fazer o marketing brilhar hoje?</p>
        </div>
        <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-400">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long'})}</p>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard 
            title="A Fazer" 
            count={todoCount} 
            color="blue" 
            icon={<List size={20} />} 
            onClick={() => setFilterStatus(TaskStatus.TODO)}
            active={filterStatus === TaskStatus.TODO}
        />
        <StatCard 
            title="Para Hoje" 
            count={dueTodayCount} 
            color="yellow" 
            icon={<Clock size={20} />} 
            onClick={() => setFilterStatus(null)} // Reset or specific logic
            active={false}
        />
        <StatCard 
            title="Aguardando" 
            count={waitingCount} 
            color="purple" 
            icon={<Clock size={20} />}
            onClick={() => setFilterStatus(TaskStatus.WAITING)}
            active={filterStatus === TaskStatus.WAITING}
        />
        <StatCard 
            title="Concluídas" 
            count={doneTodayCount} 
            color="green" 
            icon={<CheckCircle size={20} />}
            onClick={() => setFilterStatus(TaskStatus.DONE)}
            active={filterStatus === TaskStatus.DONE}
        />
        <StatCard 
            title="Atrasadas" 
            count={overdueCount} 
            color="red" 
            icon={<AlertTriangle size={20} />} 
            onClick={() => setFilterStatus('OVERDUE')}
            active={filterStatus === 'OVERDUE'}
        />
      </div>

      {/* Filtered List View (If clicked) */}
      {filterStatus && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-joy-100 animate-fade-in">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                  Filtrando: {filterStatus === 'OVERDUE' ? 'Atrasadas 🚨' : filterStatus}
                  <button onClick={() => setFilterStatus(null)} className="text-xs text-gray-400 hover:text-joy-500 ml-auto">Limpar Filtro</button>
              </h3>
              <div className="space-y-2">
                  {myTasks
                    .filter(t => {
                        if (filterStatus === 'OVERDUE') return t.dueDate < today && t.status !== TaskStatus.DONE;
                        return t.status === filterStatus;
                    })
                    .map(t => (
                      <div key={t.id} className="flex items-center gap-3 p-3 bg-joy-50 rounded-xl border border-joy-100">
                          <span className="text-xl">{t.emoji}</span>
                          <span className="font-bold text-gray-700 flex-1">{t.title}</span>
                          <span className="text-xs text-gray-400">{new Date(t.dueDate).toLocaleDateString()}</span>
                      </div>
                  ))}
                  {myTasks.length === 0 && <p className="text-center text-gray-400 italic">Nada por aqui!</p>}
              </div>
          </div>
      )}

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Notes */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-yellow-100 relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">✏️</div>
          <h3 className="font-bold text-gray-700 mb-3">Bloco de Notas 📒</h3>
          
          {/* Input Area */}
          <div className="relative mb-4">
            <textarea 
                className="w-full h-24 bg-yellow-50 rounded-xl p-3 pr-12 border-none resize-none focus:ring-2 focus:ring-yellow-200 text-gray-700 handwriting custom-scrollbar"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Ideias brilhantes aqui..."
                style={{ fontFamily: 'cursive' }}
            />
            <button 
                onClick={handleSaveNote}
                className="absolute bottom-3 right-3 w-8 h-8 bg-yellow-400 text-white rounded-full flex items-center justify-center shadow hover:bg-yellow-500 transition-transform active:scale-90"
                title="Salvar"
            >
                {editingId ? <Save size={16} /> : <Plus size={20} />}
            </button>
          </div>

          {/* Saved Notes List */}
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
            {notes.length === 0 && (
                <p className="text-center text-xs text-gray-400 italic py-2">Nenhuma anotação salva.</p>
            )}
            {notes.map((note) => (
                <div key={note.id} className="group/item flex items-start gap-2 p-3 bg-yellow-50/50 rounded-xl border border-yellow-100 hover:bg-yellow-50 transition-colors">
                    <p className="text-sm text-gray-600 flex-1 break-words whitespace-pre-wrap leading-relaxed" style={{ fontFamily: 'cursive' }}>
                        {note.text}
                    </p>
                    <div className="flex flex-col gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                         <button 
                            onClick={() => handleEditClick(note.text, note.id)} 
                            className="text-blue-400 hover:text-blue-600 p-1 hover:bg-blue-50 rounded"
                            title="Editar"
                         >
                             <Edit2 size={14} />
                         </button>
                         <button 
                            onClick={() => deleteNote(note.id)} 
                            className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                            title="Excluir"
                         >
                             <Trash2 size={14} />
                         </button>
                    </div>
                </div>
            ))}
          </div>
        </div>

        {/* Reminders & Meetings */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 flex flex-col">
           <h3 className="font-bold text-gray-700 mb-3 flex justify-between items-center">
               Reuniões & Prazos
               <button className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">Sync Google 📅</button>
           </h3>
           
           <div className="flex-1 space-y-4 overflow-y-auto">
               {/* Meetings Mock */}
               <div>
                   <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Agenda (Google Calendar)</h4>
                   {meetings.map(m => (
                       <div key={m.id} className="flex items-center gap-3 mb-2 p-2 hover:bg-gray-50 rounded-lg">
                           <div className="w-1 h-8 bg-blue-400 rounded-full"></div>
                           <div>
                               <p className="font-bold text-sm text-gray-700">{m.title}</p>
                               <p className="text-xs text-gray-400">{new Date(m.date).toLocaleString()}</p>
                           </div>
                       </div>
                   ))}
               </div>
               
               {/* Task Due Reminders */}
               <div>
                   <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Entregas Próximas</h4>
                   {myTasks
                    .filter(t => t.dueDate > today && t.dueDate < today + 86400000 * 2)
                    .map(t => (
                       <div key={t.id} className="flex items-center gap-2 mb-2 p-2 bg-red-50 rounded-lg text-red-700 text-sm">
                           <AlertTriangle size={14} />
                           <span className="truncate">{t.title}</span>
                           <span className="ml-auto font-bold">{new Date(t.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                       </div>
                    ))}
               </div>
           </div>
        </div>

        {/* Mood Tracker */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-joy-200 flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-gray-700 mb-4 text-center">Como estou hoje? 🌡️</h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {EMOTIONS.map((emo) => (
                        <button 
                            key={emo.label}
                            onClick={() => handleMoodSelection(emo.emoji)}
                            className={clsx(
                                "flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300",
                                mood === emo.emoji 
                                    ? `${emo.color} text-white shadow-lg scale-110` 
                                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                            )}
                        >
                            <span className="text-2xl mb-1">{emo.emoji}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wide">{emo.label}</span>
                        </button>
                    ))}
                </div>
                
                {/* Motivational Quote */}
                {motivationalQuote ? (
                    <div className="p-4 bg-joy-50 rounded-xl border border-joy-100 animate-fade-in">
                        <p className="text-sm text-joy-800 font-bold text-center italic">"{motivationalQuote}"</p>
                    </div>
                ) : (
                    <p className="text-xs text-center text-gray-400">Selecione um emoji para uma mensagem especial!</p>
                )}
            </div>

            {/* Admin View: Team Moods */}
            {currentUser?.role === UserRole.ADMIN && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                     <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><Users size={12}/> Humor da Equipe (Admin)</h4>
                     <div className="space-y-2 max-h-32 overflow-y-auto">
                         {users.map(user => (
                             <div key={user.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50">
                                 <div className="flex items-center gap-2">
                                     <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                                     <span className="text-gray-700 font-medium">{user.name}</span>
                                 </div>
                                 <span className="text-xl">{user.mood || '❓'}</span>
                             </div>
                         ))}
                     </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
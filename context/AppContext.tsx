
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, User, Column, Notification, UserRole, TaskStatus, Tag, Note, Meeting, TrafficCampaign, TrafficCustomColumn, TrafficPlanningColumn } from '../types';
import { INITIAL_TAGS } from '../constants';

interface AppState {
  currentUser: User | null;
  users: User[];
  tasks: Task[];
  columns: Column[];
  notifications: Notification[];
  notes: Note[];
  meetings: Meeting[];
  mood: string;
  availableTags: Tag[];
  systemLogo: string | null;
  trafficCampaigns: TrafficCampaign[];
  trafficColumns: TrafficCustomColumn[];
  trafficPlanningColumns: TrafficPlanningColumn[];
  
  // Actions
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  setMood: (mood: string) => void;
  addNote: (text: string) => void;
  editNote: (id: string, text: string) => void;
  deleteNote: (id: string) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  delegateTask: (taskId: string, newUserId: string) => void;
  addColumn: (title: string, color: string) => void;
  markNotificationRead: (id: string) => void;
  setCurrentUser: (user: User) => void;
  createTag: (name: string, color: string) => void;
  
  // Traffic Actions
  addTrafficCampaign: (campaign: TrafficCampaign) => void;
  updateTrafficCampaign: (campaign: TrafficCampaign) => void;
  addTrafficColumn: (title: string) => void;
  updateTrafficColumnTitle: (id: string, newTitle: string) => void;
  addTrafficPlanningColumn: (title: string) => void;
  updateTrafficPlanningColumnTitle: (id: string, newTitle: string) => void;

  // Admin Actions
  addNewUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  updateSystemLogo: (url: string) => void;
  broadcastMessage: (msg: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

// Mock Data
const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Ana Silva', email: 'ana@marketing.com', password: '123', role: UserRole.USER, avatar: 'https://picsum.photos/id/64/100/100', mood: '😄' },
  { id: 'u2', name: 'Carlos Admin', email: 'admin@marketing.com', password: 'admin', role: UserRole.ADMIN, avatar: 'https://picsum.photos/id/65/100/100', mood: '😌' },
  { id: 'u3', name: 'Beatriz Design', email: 'bia@marketing.com', password: '123', role: UserRole.USER, avatar: 'https://picsum.photos/id/66/100/100', mood: '🤩' },
];

const MOCK_COLUMNS: Column[] = [
  { id: 'c_todo', title: 'A Fazer 📝', color: 'bg-yellow-100', order: 0 },
  { id: 'c_prog', title: 'Em Andamento 🚀', color: 'bg-blue-100', order: 1 },
  { id: 'c_wait', title: 'Aguardando ⏳', color: 'bg-purple-100', order: 2 },
  { id: 'c_done', title: 'Concluído ✅', color: 'bg-green-100', order: 3 },
  { id: 'c_canc', title: 'Cancelado ❌', color: 'bg-gray-100', order: 4 },
  { id: 'c_ideas', title: 'Ideias 💡', color: 'bg-pink-100', order: 5 },
];

const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Post Instagram Dia das Mães',
    description: 'Criar carrossel com 5 dicas de presentes.',
    status: TaskStatus.TODO,
    columnId: 'c_todo',
    assigneeId: 'u1',
    creatorId: 'u2',
    createdAt: Date.now() - 86400000,
    dueDate: Date.now() + 86400000,
    postDate: Date.now() + 86400000 * 2,
    origin: 'Instagram/Facebook',
    socialPlatform: 'Instagram',
    tags: [INITIAL_TAGS[0]],
    emoji: '🌸',
    comments: [],
    history: [],
    isApprovalRequested: false,
    approvalStatus: 'none',
    subtasks: [
        { id: 'st1', title: 'Pesquisar tendências', completed: true },
        { id: 'st2', title: 'Criar copy', completed: false }
    ],
    estimatedHours: 2,
    timeSpent: 0,
    isTimerRunning: false,
    attachments: []
  },
  {
    id: 't2',
    title: 'Banner Site Promoção',
    description: 'Banner principal desktop e mobile.',
    status: TaskStatus.IN_PROGRESS,
    columnId: 'c_prog',
    assigneeId: 'u1',
    creatorId: 'u2',
    createdAt: Date.now() - 172800000,
    dueDate: Date.now() - 3600000, // Overdue
    postDate: Date.now() + 86400000,
    origin: 'Banner',
    tags: [INITIAL_TAGS[1]],
    emoji: '💻',
    comments: [],
    history: [],
    isApprovalRequested: true,
    approvalStatus: 'pending',
    imageUrl: 'https://picsum.photos/400/200',
    attachments: ['https://picsum.photos/400/200'],
    subtasks: [],
    estimatedHours: 4,
    timeSpent: 3600000, // 1 hour
    isTimerRunning: true,
    lastTimerStart: Date.now() - 100000
  },
  {
    id: 't3',
    title: 'Campanha Black Friday',
    description: 'Brainstorming inicial de temas.',
    status: TaskStatus.IDEAS,
    columnId: 'c_ideas',
    assigneeId: 'u1',
    creatorId: 'u1',
    createdAt: Date.now(),
    dueDate: Date.now() + 86400000 * 10,
    origin: 'Outros',
    socialPlatform: 'LinkedIn',
    tags: [],
    emoji: '💡',
    comments: [],
    history: [],
    isApprovalRequested: false,
    approvalStatus: 'none',
    subtasks: [],
    estimatedHours: 0,
    timeSpent: 0,
    isTimerRunning: false,
    attachments: []
  }
];

const MOCK_TRAFFIC_CAMPAIGNS: TrafficCampaign[] = [
    {
        id: 'tc1',
        platform: 'Facebook',
        name: 'Vendas de Verão - Público Frio',
        isActive: true,
        budgetMonth: 1500,
        budgetDaily: 50,
        spent: 450,
        cpc: 0.85,
        conversions: 22,
        roi: 3.5,
        creativeUrl: 'https://picsum.photos/id/48/400/400',
        caption: 'Aproveite o verão com descontos de até 50%!',
        objective: 'Conversão',
        startDate: Date.now() - 86400000 * 5,
        leadsTarget: 100,
        salesTarget: 50,
        leadsResult: 110,
        salesResult: 42,
        customValues: { 'col1': 'Alta prioridade' },
        planningCustomValues: {}
    },
    {
        id: 'tc2',
        platform: 'Instagram',
        name: 'Remarketing - Carrinho Abandonado',
        isActive: true,
        budgetMonth: 800,
        budgetDaily: 25,
        spent: 120,
        cpc: 1.20,
        conversions: 15,
        roi: 5.2,
        creativeUrl: 'https://picsum.photos/id/30/400/400',
        caption: 'Você esqueceu algo especial...',
        objective: 'Tráfego',
        startDate: Date.now() - 86400000 * 2,
        leadsTarget: 50,
        salesTarget: 20,
        leadsResult: 25,
        salesResult: 8,
        customValues: { 'col1': 'Média' },
        planningCustomValues: {}
    },
    {
        id: 'tc3',
        platform: 'YouTube',
        name: 'Branding - Institucional',
        isActive: false,
        budgetMonth: 3000,
        budgetDaily: 100,
        spent: 2800,
        cpc: 0.15,
        conversions: 5,
        roi: 1.1,
        creativeUrl: 'https://picsum.photos/id/20/400/400',
        caption: 'Conheça nossa história.',
        objective: 'Alcance',
        startDate: Date.now() - 86400000 * 20,
        leadsTarget: 500,
        salesTarget: 0,
        leadsResult: 620,
        salesResult: 0,
        customValues: { 'col1': 'Baixa' },
        planningCustomValues: {}
    }
];

const MOCK_TRAFFIC_COLS: TrafficCustomColumn[] = [
    { id: 'col1', title: 'Prioridade' }
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [columns, setColumns] = useState<Column[]>(MOCK_COLUMNS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notes, setNotes] = useState<Note[]>([{ id: 'n1', text: 'Ideia: Fazer um vídeo viral sobre café ☕', updatedAt: Date.now() }]);
  const [meetings, setMeetings] = useState<Meeting[]>([
    { id: 'm1', title: 'Briefing Cliente X', date: Date.now() + 3600000 * 4 },
    { id: 'm2', title: 'Revisão Semanal', date: Date.now() + 3600000 * 28 },
  ]);
  const [mood, setMoodState] = useState('😄');
  const [availableTags, setAvailableTags] = useState<Tag[]>(INITIAL_TAGS);
  const [systemLogo, setSystemLogo] = useState<string | null>(null);
  
  // Traffic State
  const [trafficCampaigns, setTrafficCampaigns] = useState<TrafficCampaign[]>(MOCK_TRAFFIC_CAMPAIGNS);
  const [trafficColumns, setTrafficColumns] = useState<TrafficCustomColumn[]>(MOCK_TRAFFIC_COLS);
  const [trafficPlanningColumns, setTrafficPlanningColumns] = useState<TrafficPlanningColumn[]>([]);

  // Helper to find admin
  const getAdminId = () => users.find(u => u.role === UserRole.ADMIN)?.id || 'u2';

  // Monitor Timers (12h auto-stop)
  useEffect(() => {
    const interval = setInterval(() => {
        setTasks(currentTasks => currentTasks.map(task => {
            if (task.isTimerRunning && task.lastTimerStart) {
                const sessionDuration = Date.now() - task.lastTimerStart;
                const totalDuration = task.timeSpent + sessionDuration;
                
                // 12 Hours in milliseconds
                if (sessionDuration > 43200000) {
                     const finalTime = totalDuration;
                     const totalHours = finalTime / (1000 * 60 * 60);
                     if (task.estimatedHours > 0 && totalHours > task.estimatedHours) {
                        const assigneeName = users.find(u => u.id === task.assigneeId)?.name || 'Usuário';
                        addNotification(getAdminId(), `⚠️ ALERTA: ${assigneeName} estourou o tempo na tarefa "${task.title}" (Parada Automática).`, 'alert');
                     }

                     addNotification(task.assigneeId, `O cronômetro da tarefa "${task.title}" parou automaticamente (12h atingidas).`, 'alert');
                     
                     return {
                         ...task,
                         isTimerRunning: false,
                         timeSpent: finalTime,
                         lastTimerStart: undefined
                     };
                }
            }
            return task;
        }));
    }, 60000); 
    return () => clearInterval(interval);
  }, [users]);

  const login = (email: string, pass: string): boolean => {
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
      if (user) {
          setCurrentUser(user);
          setMoodState(user.mood || '😄');
          return true;
      }
      return false;
  };

  const logout = () => {
      setCurrentUser(null);
  };

  const addNotification = (userId: string, message: string, type: 'info' | 'alert' | 'success' = 'info') => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      message,
      read: false,
      timestamp: Date.now(),
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
    addNotification(task.assigneeId, `Nova tarefa atribuída: ${task.title}`, 'info');
  };

  const createTag = (name: string, color: string) => {
      const newTag = { id: Math.random().toString(), name, color };
      setAvailableTags(prev => [...prev, newTag]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => {
        if (t.id !== updatedTask.id) return t;

        let newTask = { ...updatedTask };
        const oldTask = t;

        if (newTask.status === TaskStatus.IN_PROGRESS && oldTask.status !== TaskStatus.IN_PROGRESS) {
             newTask.isTimerRunning = true;
             newTask.lastTimerStart = Date.now();
        }

        if (newTask.status !== TaskStatus.IN_PROGRESS && oldTask.status === TaskStatus.IN_PROGRESS && oldTask.isTimerRunning) {
             const sessionTime = oldTask.lastTimerStart ? Date.now() - oldTask.lastTimerStart : 0;
             newTask.timeSpent = (oldTask.timeSpent || 0) + sessionTime;
             newTask.isTimerRunning = false;
             newTask.lastTimerStart = undefined;

             const totalHours = newTask.timeSpent / (1000 * 60 * 60);
             if (newTask.estimatedHours > 0 && totalHours > newTask.estimatedHours) {
                 const assigneeName = users.find(u => u.id === newTask.assigneeId)?.name || 'Usuário';
                 const adminId = getAdminId();
                 addNotification(adminId, `⚠️ ALERTA: ${assigneeName} ultrapassou o tempo estimado (${newTask.estimatedHours}h) na tarefa "${newTask.title}".`, 'alert');
             }
        }
        
        return newTask;
    }));
    
    const lastComment = updatedTask.comments[updatedTask.comments.length - 1];
    const oldTaskVersion = tasks.find(t => t.id === updatedTask.id);
    const isNewComment = oldTaskVersion && updatedTask.comments.length > oldTaskVersion.comments.length;

    if (isNewComment && lastComment && lastComment.timestamp > Date.now() - 1000) {
      if (lastComment.text.includes('@')) {
        if (lastComment.userId !== currentUser?.id) {
             addNotification(currentUser?.id || '', `Nova menção em: ${updatedTask.title}`, 'info');
        }
      }
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const delegateTask = (taskId: string, newUserId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const oldAssignee = task.assigneeId;
    const updatedTask = {
      ...task,
      assigneeId: newUserId,
      history: [
        ...task.history,
        {
          id: Math.random().toString(),
          action: `Delegado de ${users.find(u => u.id === oldAssignee)?.name} para ${users.find(u => u.id === newUserId)?.name}`,
          timestamp: Date.now(),
          userId: currentUser?.id || 'system'
        }
      ]
    };
    
    updateTask(updatedTask);
    addNotification(newUserId, `Tarefa delegada a você: ${task.title}`, 'info');
  };

  const addColumn = (title: string, color: string) => {
    const newCol: Column = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      color,
      order: columns.length
    };
    setColumns([...columns, newCol]);
  };

  const addNote = (text: string) => {
    const newNote: Note = {
        id: Math.random().toString(36).substr(2, 9),
        text,
        updatedAt: Date.now()
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const editNote = (id: string, text: string) => {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, text, updatedAt: Date.now() } : n));
  };

  const deleteNote = (id: string) => {
      setNotes(prev => prev.filter(n => n.id !== id));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const setMood = (newMood: string) => {
    setMoodState(newMood);
    if (currentUser) {
        const updatedUser = { ...currentUser, mood: newMood };
        setCurrentUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    }
  };

  // --- Traffic Logic ---
  const addTrafficCampaign = (campaign: TrafficCampaign) => {
      setTrafficCampaigns(prev => [...prev, campaign]);
  };

  const updateTrafficCampaign = (updatedCampaign: TrafficCampaign) => {
      setTrafficCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
  };

  const addTrafficColumn = (title: string) => {
      const newCol: TrafficCustomColumn = { id: Math.random().toString(36).substr(2, 9), title };
      setTrafficColumns(prev => [...prev, newCol]);
  };

  const updateTrafficColumnTitle = (id: string, newTitle: string) => {
      setTrafficColumns(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  const addTrafficPlanningColumn = (title: string) => {
      const newCol: TrafficPlanningColumn = { id: Math.random().toString(36).substr(2, 9), title };
      setTrafficPlanningColumns(prev => [...prev, newCol]);
  };

  const updateTrafficPlanningColumnTitle = (id: string, newTitle: string) => {
      setTrafficPlanningColumns(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  // --- Admin Functions ---
  const addNewUser = (user: User) => {
      setUsers(prev => [...prev, user]);
  };

  const updateUser = (user: User) => {
      setUsers(prev => prev.map(u => u.id === user.id ? user : u));
      if (currentUser?.id === user.id) {
          setCurrentUser(user);
      }
  };

  const deleteUser = (id: string) => {
      setUsers(prev => prev.filter(u => u.id !== id));
  };

  const updateSystemLogo = (url: string) => {
      setSystemLogo(url);
  };

  const broadcastMessage = (msg: string) => {
      users.forEach(u => addNotification(u.id, `📢 COMUNICADO: ${msg}`, 'info'));
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, tasks, columns, notifications, notes, meetings, mood, availableTags, systemLogo,
      trafficCampaigns, trafficColumns, trafficPlanningColumns,
      setMood, addNote, editNote, deleteNote, addTask, updateTask, deleteTask, delegateTask, addColumn, markNotificationRead, setCurrentUser, createTag,
      login, logout, addNewUser, updateUser, deleteUser, updateSystemLogo, broadcastMessage,
      addTrafficCampaign, updateTrafficCampaign, addTrafficColumn, updateTrafficColumnTitle, addTrafficPlanningColumn, updateTrafficPlanningColumnTitle
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

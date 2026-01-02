
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, User } from '../types';
import { Save, Calendar, Shield, UserPlus, Upload, Users, Lock, Trash2, Edit3, Megaphone, Camera } from 'lucide-react';
import clsx from 'clsx';

const Settings: React.FC = () => {
  const { currentUser, setCurrentUser, users, addNewUser, updateUser, deleteUser, updateSystemLogo, broadcastMessage, systemLogo } = useApp();
  const [googleConnected, setGoogleConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'admin'>('profile');

  // Admin Form States
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.USER);
  const [announcement, setAnnouncement] = useState('');
  
  const toggleGoogle = () => {
      setGoogleConnected(!googleConnected);
      if(!googleConnected) alert("Redirecionando para Google OAuth (Simulado)... Conectado!");
  };

  const handleCreateUser = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newUserEmail || !newUserName) return;
      
      const newUser: User = {
          id: Math.random().toString(),
          name: newUserName,
          email: newUserEmail,
          password: '123', // Default password
          role: newUserRole,
          avatar: `https://ui-avatars.com/api/?name=${newUserName.replace(' ', '+')}&background=random`,
          mood: '🙂'
      };
      addNewUser(newUser);
      setNewUserName('');
      setNewUserEmail('');
      alert('Usuário criado! Senha padrão: 123');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              updateSystemLogo(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleBroadcast = () => {
      if(!announcement) return;
      broadcastMessage(announcement);
      setAnnouncement('');
      alert('Comunicado enviado!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold text-gray-800">Configurações ⚙️</h2>
          {currentUser?.role === UserRole.ADMIN && (
              <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className={clsx("px-4 py-2 rounded-lg text-sm font-bold transition-colors", activeTab === 'profile' ? "bg-joy-100 text-joy-600" : "text-gray-500 hover:text-gray-700")}
                  >
                      Meu Perfil
                  </button>
                  <button 
                    onClick={() => setActiveTab('admin')}
                    className={clsx("px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2", activeTab === 'admin' ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-700")}
                  >
                      <Shield size={14} /> Admin Area
                  </button>
              </div>
          )}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-8 rounded-3xl shadow-sm">
                <h3 className="text-xl font-bold text-gray-700 mb-6 border-b pb-2">Meus Dados</h3>
                <div className="flex items-center gap-6 mb-6">
                    <div className="relative group cursor-pointer">
                        <img src={currentUser?.avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-joy-100 group-hover:border-joy-300 transition-colors" />
                        <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" />
                        </div>
                    </div>
                    <div className="space-y-3 flex-1 max-w-md">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase">Nome</label>
                            <input type="text" value={currentUser?.name} className="w-full font-bold text-gray-800 border-b border-gray-200 focus:border-joy-500 outline-none py-1 bg-transparent" readOnly />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase">Email</label>
                            <input type="email" value={currentUser?.email} className="w-full text-gray-600 border-b border-gray-200 focus:border-joy-500 outline-none py-1 bg-transparent" readOnly />
                        </div>
                        <button className="text-xs text-joy-600 font-bold hover:underline flex items-center gap-1">
                            <Lock size={12} /> Alterar minha senha
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm"><Calendar className="text-blue-500" /></div>
                        <div>
                            <p className="font-bold text-gray-700">Google Calendar</p>
                            <p className="text-xs text-gray-500">{googleConnected ? 'Sincronizado' : 'Não conectado'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={toggleGoogle}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${googleConnected ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
                    >
                        {googleConnected ? 'Desconectar' : 'Conectar'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Admin Tab */}
      {activeTab === 'admin' && currentUser?.role === UserRole.ADMIN && (
        <div className="space-y-8 animate-fade-in">
            
            {/* Create User & System Branding */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Create User */}
                <div className="bg-white p-6 rounded-3xl shadow-sm">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <UserPlus size={20} className="text-joy-500" /> Novo Usuário
                    </h3>
                    <form onSubmit={handleCreateUser} className="space-y-3">
                        <input 
                            placeholder="Nome completo" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-joy-300"
                            value={newUserName}
                            onChange={e => setNewUserName(e.target.value)}
                            required
                        />
                        <input 
                            placeholder="Email corporativo" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-joy-300"
                            value={newUserEmail}
                            onChange={e => setNewUserEmail(e.target.value)}
                            required
                        />
                        <div className="flex gap-2">
                            <button 
                                type="button"
                                onClick={() => setNewUserRole(UserRole.USER)}
                                className={clsx("flex-1 py-2 rounded-lg text-xs font-bold border transition-colors", newUserRole === UserRole.USER ? "bg-joy-100 border-joy-300 text-joy-700" : "border-gray-200 text-gray-500")}
                            >
                                Usuário
                            </button>
                            <button 
                                type="button"
                                onClick={() => setNewUserRole(UserRole.ADMIN)}
                                className={clsx("flex-1 py-2 rounded-lg text-xs font-bold border transition-colors", newUserRole === UserRole.ADMIN ? "bg-purple-100 border-purple-300 text-purple-700" : "border-gray-200 text-gray-500")}
                            >
                                Admin
                            </button>
                        </div>
                        <button type="submit" className="w-full bg-joy-500 text-white font-bold py-3 rounded-xl hover:bg-joy-600 transition-colors">
                            Criar Conta
                        </button>
                    </form>
                </div>

                {/* Branding & Announcements */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm">
                        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <Upload size={20} className="text-purple-500" /> Identidade Visual
                        </h3>
                        <div className="flex items-center gap-4">
                             <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 overflow-hidden">
                                 {systemLogo ? <img src={systemLogo} alt="Logo" className="w-full h-full object-contain" /> : <span className="text-xs text-gray-400">Logo</span>}
                             </div>
                             <div className="flex-1">
                                 <label className="block w-full bg-purple-50 text-purple-600 text-center py-2 rounded-xl cursor-pointer hover:bg-purple-100 font-bold text-sm transition-colors">
                                     Atualizar Logo do Sistema
                                     <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                 </label>
                             </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden">
                        <Megaphone className="absolute top-4 right-4 text-white/10" size={60} />
                        <h3 className="font-bold mb-3 relative z-10">Comunicado Geral</h3>
                        <textarea 
                             placeholder="Enviar notificação para todos os usuários..."
                             className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm h-20 resize-none focus:outline-none focus:bg-white/20 mb-2"
                             value={announcement}
                             onChange={e => setAnnouncement(e.target.value)}
                        />
                        <button 
                            onClick={handleBroadcast}
                            className="w-full bg-white text-gray-900 font-bold py-2 rounded-lg hover:bg-gray-100"
                        >
                            Enviar Notificação
                        </button>
                    </div>
                </div>
            </div>

            {/* Users List */}
            <div className="bg-white p-8 rounded-3xl shadow-sm">
                <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
                    <Users size={20} className="text-blue-500" /> Gerenciar Usuários ({users.length})
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs uppercase text-gray-400">
                                <th className="pb-3 pl-2">Usuário</th>
                                <th className="pb-3">Email</th>
                                <th className="pb-3">Permissão</th>
                                <th className="pb-3 text-right pr-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {users.map(user => (
                                <tr key={user.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="py-3 pl-2">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatar} className="w-8 h-8 rounded-full" alt="" />
                                            <span className="font-bold text-gray-700">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-gray-600">{user.email}</td>
                                    <td className="py-3">
                                        <span className={clsx("px-2 py-1 rounded-md text-xs font-bold", user.role === UserRole.ADMIN ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600")}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-3 text-right pr-2">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => {
                                                    const newPass = prompt("Nova senha para " + user.name);
                                                    if(newPass) {
                                                        updateUser({...user, password: newPass});
                                                        alert("Senha alterada!");
                                                    }
                                                }} 
                                                className="p-1.5 text-blue-400 hover:bg-blue-50 rounded-lg" 
                                                title="Alterar Senha"
                                            >
                                                <Lock size={16}/>
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const newRole = user.role === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
                                                    updateUser({...user, role: newRole});
                                                }}
                                                className="p-1.5 text-orange-400 hover:bg-orange-50 rounded-lg"
                                                title="Trocar Permissão"
                                            >
                                                <Shield size={16}/>
                                            </button>
                                            {user.id !== currentUser.id && (
                                                <button 
                                                    onClick={() => {
                                                        if(confirm("Tem certeza que deseja excluir este usuário?")) deleteUser(user.id);
                                                    }}
                                                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={16}/>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

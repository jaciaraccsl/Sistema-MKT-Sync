
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

const Login: React.FC = () => {
  const { login, systemLogo } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(email, password);
    if (!success) {
      setError('Email ou senha incorretos. Tente novamente!');
    }
  };

  const handleForgotPassword = () => {
      alert("Um email de recuperação foi enviado para sua caixa de entrada! 📧");
  };

  return (
    <div className="min-h-screen bg-joy-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-joy-200 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-60"></div>

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 relative z-10 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          {systemLogo ? (
              <img src={systemLogo} alt="Logo" className="h-20 mb-2 object-contain" />
          ) : (
              <div className="w-20 h-20 bg-gradient-to-tr from-joy-400 to-purple-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
                <Sparkles size={40} />
              </div>
          )}
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-joy-500 to-purple-600">
            Sync Marketing
          </h1>
          <p className="text-gray-400 font-bold">Entre para começar a criar 🚀</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 text-sm font-bold p-3 rounded-xl text-center border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-joy-200 text-gray-700 font-medium"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-joy-200 text-gray-700 font-medium"
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-joy-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="text-right">
                <button type="button" onClick={handleForgotPassword} className="text-xs font-bold text-joy-500 hover:underline">
                    Esqueceu a senha?
                </button>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-joy-500 text-white rounded-2xl font-bold text-lg hover:bg-joy-600 shadow-xl shadow-joy-200 transition-transform active:scale-95"
          >
            Entrar
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
             Dica: Admin (admin@marketing.com / admin) <br/> User (ana@marketing.com / 123)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
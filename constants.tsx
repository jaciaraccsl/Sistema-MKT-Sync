
import React from 'react';
import { LayoutDashboard, Kanban, CheckCircle, Settings, User, Bell, LogOut, Instagram, Facebook, Linkedin, Youtube, Twitter, MessageCircle, Video, Megaphone } from 'lucide-react';
import { SocialPlatform } from './types';

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
  { label: 'Tarefas', path: '/tasks', icon: <Kanban size={20} /> },
  { label: 'Social Media', path: '/social', icon: <Instagram size={20} /> },
  { label: 'Tráfego Pago', path: '/traffic', icon: <Megaphone size={20} /> },
  { label: 'Aprovações', path: '/approvals', icon: <CheckCircle size={20} /> },
  { label: 'Configurações', path: '/settings', icon: <Settings size={20} /> },
];

export const EMOTIONS = [
  { label: 'Feliz', emoji: '😄', color: 'bg-green-400' },
  { label: 'Animado', emoji: '🤩', color: 'bg-yellow-400' },
  { label: 'Tranquilo', emoji: '😌', color: 'bg-blue-300' },
  { label: 'Criativo', emoji: '🎨', color: 'bg-pink-400' },
  { label: 'Pensativo', emoji: '🤔', color: 'bg-violet-400' },
  { label: 'Ansioso', emoji: '😰', color: 'bg-amber-400' },
  { label: 'Preocupado', emoji: '😟', color: 'bg-orange-400' },
  { label: 'Triste', emoji: '😢', color: 'bg-indigo-400' },
  { label: 'Irritado', emoji: '😤', color: 'bg-red-400' },
  { label: 'Desanimado', emoji: '🫠', color: 'bg-gray-400' },
];

export const MOOD_QUOTES: Record<string, string[]> = {
  '😄': [
    "Sua alegria ilumina o escritório! Continue assim!",
    "Sorriso no rosto e foco no objetivo! O mundo é seu.",
    "Nada para alguém que está feliz consigo mesmo. Aproveite o dia!"
  ],
  '🤩': [
    "Que top! Com toda essa animação com certeza o seu dia vai ser maravilhoso e produtivo. Vamos pra cima!",
    "Essa energia vai te levar longe hoje! Voe alto.",
    "Use essa empolgação para criar algo incrível! Você é capaz."
  ],
  '😌': [
    "A paz interior é a melhor ferramenta de trabalho. Mantenha o fluxo.",
    "Devagar e sempre se vai ao longe. Respire.",
    "Mantenha o equilíbrio e conquiste o mundo com serenidade."
  ],
  '🎨': [
    "Deixe a imaginação fluir sem barreiras! O mundo precisa da sua arte.",
    "A criatividade é a inteligência se divertindo. Crie algo novo!",
    "Quebre as regras, misture as cores. Hoje é dia de inovar."
  ],
  '🤔': [
    "Grandes ideias nascem do silêncio. Aproveite esse momento de reflexão.",
    "Analise as possibilidades, mas lembre-se de agir. O insight está chegando.",
    "O pensamento profundo é a base da estratégia. Use isso a seu favor."
  ],
  '😰': [
    "Um passo de cada vez. O futuro chega no tempo certo. Respire.",
    "Foque no agora. Você tem as ferramentas para lidar com o presente.",
    "Sua ansiedade não define sua capacidade. Você é maior que isso."
  ],
  '😟': [
    "Respire fundo. Um passo de cada vez resolve tudo. Confie.",
    "Não se preocupe tanto, você é capaz de resolver isso.",
    "Foque no que você pode controlar agora. Vai dar certo!"
  ],
  '😢': [
    "Tudo bem chorar. Isso limpa a alma. Amanhã o sol brilha de novo.",
    "Respeite seu tempo. Dias nublados são necessários para as flores crescerem.",
    "Sinta, acolha e deixe ir. Você não está sozinho."
  ],
  '😤': [
    "Tire um momento para você. Respire. Tome um café.",
    "Conte até 10. Você é maior que esse estresse.",
    "Transforme essa frustração em determinação. Você consegue."
  ],
  '🫠': [
    "Tudo bem não estar 100% hoje. Faça o seu melhor possível.",
    "Amanhã é um novo dia. Pegue leve consigo mesmo hoje.",
    "Lembre-se de tudo que você já conquistou até aqui. Força!"
  ]
};

export const INITIAL_TAGS = [
  { id: 't1', name: 'Social Media', color: 'bg-pink-200 text-pink-800' },
  { id: 't2', name: 'Design', color: 'bg-purple-200 text-purple-800' },
  { id: 't3', name: 'Campanha', color: 'bg-orange-200 text-orange-800' },
];

export const SOCIAL_PLATFORMS: { label: SocialPlatform; icon: React.ReactNode; color: string }[] = [
    { label: 'Instagram', icon: <Instagram size={14} />, color: 'text-pink-600 bg-pink-100' },
    { label: 'Facebook', icon: <Facebook size={14} />, color: 'text-blue-600 bg-blue-100' },
    { label: 'LinkedIn', icon: <Linkedin size={14} />, color: 'text-blue-700 bg-blue-100' },
    { label: 'YouTube', icon: <Youtube size={14} />, color: 'text-red-600 bg-red-100' },
    { label: 'Twitter', icon: <Twitter size={14} />, color: 'text-sky-500 bg-sky-100' },
    { label: 'WhatsApp', icon: <MessageCircle size={14} />, color: 'text-green-500 bg-green-100' },
    { label: 'TikTok', icon: <Video size={14} />, color: 'text-black bg-gray-200' },
];

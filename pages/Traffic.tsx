
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TrafficCampaign, SocialPlatform } from '../types';
import { SOCIAL_PLATFORMS } from '../constants';
import { Megaphone, Plus, Search, DollarSign, TrendingUp, Activity, PieChart, ChevronDown, ChevronUp, Edit2, Check, X, Image as ImageIcon, ToggleLeft, ToggleRight, Filter, Calendar, Target, ArrowUpRight, ArrowDownRight, Table } from 'lucide-react';
import clsx from 'clsx';

const Traffic: React.FC = () => {
  const { 
      trafficCampaigns, trafficColumns, trafficPlanningColumns, 
      updateTrafficCampaign, addTrafficCampaign, 
      addTrafficColumn, updateTrafficColumnTitle,
      addTrafficPlanningColumn, updateTrafficPlanningColumnTitle
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  // Date Filters
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // Custom Column State (Operational)
  const [newColTitle, setNewColTitle] = useState('');
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editingColTitle, setEditingColTitle] = useState('');

  // Custom Column State (Planning)
  const [newPlanColTitle, setNewPlanColTitle] = useState('');
  const [isAddingPlanCol, setIsAddingPlanCol] = useState(false);
  const [editingPlanColId, setEditingPlanColId] = useState<string | null>(null);
  const [editingPlanColTitle, setEditingPlanColTitle] = useState('');

  // Editing Values State
  const [editingCell, setEditingCell] = useState<{ id: string, field: string } | null>(null);
  const [tempValue, setTempValue] = useState<string | number>('');

  const filteredCampaigns = trafficCampaigns.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.platform.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesDate = true;
      if (dateStart) {
          matchesDate = matchesDate && c.startDate >= new Date(dateStart).getTime();
      }
      if (dateEnd) {
           matchesDate = matchesDate && c.startDate <= new Date(dateEnd).getTime();
      }

      return matchesSearch && matchesDate;
  });

  // Metrics Logic
  const totalInvestment = filteredCampaigns.reduce((acc, curr) => acc + curr.spent, 0);
  const avgCPC = filteredCampaigns.length > 0 ? filteredCampaigns.reduce((acc, curr) => acc + curr.cpc, 0) / filteredCampaigns.length : 0;
  const totalConversions = filteredCampaigns.reduce((acc, curr) => acc + curr.conversions, 0);
  const avgROI = filteredCampaigns.length > 0 ? filteredCampaigns.reduce((acc, curr) => acc + curr.roi, 0) / filteredCampaigns.length : 0;

  const handleToggleStatus = (e: React.MouseEvent, campaign: TrafficCampaign) => {
      e.stopPropagation();
      updateTrafficCampaign({ ...campaign, isActive: !campaign.isActive });
  };

  const getPlatformIcon = (platform: SocialPlatform) => {
      return SOCIAL_PLATFORMS.find(p => p.label === platform)?.icon || <Megaphone size={14} />;
  };

  const handleAddNewColumn = () => {
      if(newColTitle) {
          addTrafficColumn(newColTitle);
          setNewColTitle('');
          setIsAddingCol(false);
      }
  };

  const handleAddNewPlanColumn = () => {
      if(newPlanColTitle) {
          addTrafficPlanningColumn(newPlanColTitle);
          setNewPlanColTitle('');
          setIsAddingPlanCol(false);
      }
  };

  const startEditCell = (id: string, field: string, value: string | number) => {
      setEditingCell({ id, field });
      setTempValue(value);
  };

  const saveCell = () => {
      if (editingCell) {
          const campaign = trafficCampaigns.find(c => c.id === editingCell.id);
          if (campaign) {
              // Check if it's a Planning Custom Column
              if (editingCell.field.startsWith('plan_custom_')) {
                  const customId = editingCell.field.replace('plan_custom_', '');
                  updateTrafficCampaign({
                      ...campaign,
                      planningCustomValues: { ...campaign.planningCustomValues, [customId]: String(tempValue) }
                  });
              } 
              // Check if it's an Operational Custom Column
              else if (editingCell.field.startsWith('custom_')) {
                  const customId = editingCell.field.replace('custom_', '');
                  updateTrafficCampaign({
                      ...campaign,
                      customValues: { ...campaign.customValues, [customId]: String(tempValue) }
                  });
              } 
              // Standard Field
              else {
                  updateTrafficCampaign({ ...campaign, [editingCell.field]: Number(tempValue) });
              }
          }
          setEditingCell(null);
      }
  };

  const createNewCampaign = () => {
      const newC: TrafficCampaign = {
          id: Math.random().toString(),
          name: 'Nova Campanha',
          platform: 'Instagram',
          isActive: true,
          budgetMonth: 0,
          budgetDaily: 0,
          spent: 0,
          cpc: 0,
          conversions: 0,
          roi: 0,
          startDate: Date.now(),
          customValues: {},
          planningCustomValues: {}
      };
      addTrafficCampaign(newC);
      setExpandedRow(newC.id);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, campaign: TrafficCampaign) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              updateTrafficCampaign({ ...campaign, creativeUrl: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const MetricCard = ({ title, value, prefix = '', suffix = '', icon, color, trend }: any) => (
      <div className={`bg-white p-6 rounded-3xl shadow-sm border-l-4 ${color} flex items-center justify-between`}>
          <div>
              <p className="text-gray-400 text-xs font-bold uppercase mb-1">{title}</p>
              <p className="text-2xl font-black text-gray-800">{prefix}{value}{suffix}</p>
              {trend && (
                  <div className={clsx("flex items-center text-xs font-bold mt-1", trend > 0 ? "text-green-500" : "text-red-500")}>
                      {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(trend)}% vs mês anterior
                  </div>
              )}
          </div>
          <div className={`p-3 rounded-xl bg-opacity-20 ${color.replace('border-', 'bg-')} ${color.replace('border-', 'text-')}`}>
              {icon}
          </div>
      </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Gestão de Tráfego 💸</h2>
            <p className="text-gray-400 font-bold text-sm">Controle seus investimentos e ROI.</p>
          </div>
          <button 
            onClick={createNewCampaign}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
          >
              <Plus size={20}/> Nova Campanha
          </button>
      </div>

      {/* Dashboard Topo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Investimento Total" value={totalInvestment.toLocaleString()} prefix="R$ " color="border-blue-500" icon={<DollarSign size={24}/>} trend={12.5} />
          <MetricCard title="CPC Médio" value={avgCPC.toFixed(2)} prefix="R$ " color="border-yellow-500" icon={<TrendingUp size={24}/>} trend={-5.2} />
          <MetricCard title="Conversões" value={totalConversions} color="border-green-500" icon={<Activity size={24}/>} trend={8.0} />
          <MetricCard title="ROI Médio" value={avgROI.toFixed(1)} suffix="x" color="border-purple-500" icon={<PieChart size={24}/>} trend={-1.1} />
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-bold">
              <Filter size={16} /> Filtros:
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
              <Calendar size={14} className="text-gray-400"/>
              <input 
                type="date" 
                className="bg-transparent outline-none text-xs font-bold text-gray-600"
                value={dateStart}
                onChange={e => setDateStart(e.target.value)}
              />
              <span className="text-gray-400">-</span>
              <input 
                type="date" 
                className="bg-transparent outline-none text-xs font-bold text-gray-600"
                value={dateEnd}
                onChange={e => setDateEnd(e.target.value)}
              />
          </div>
      </div>

      {/* PLANNING & RESULTS SECTION */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/30">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Target className="text-blue-500"/> Planejamento Mensal & Resultados
              </h3>
              
              {/* Add Planning Column Button */}
              <div className="flex items-center gap-2">
                  {isAddingPlanCol ? (
                      <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-blue-200 shadow-sm animate-fade-in">
                          <input 
                            autoFocus
                            placeholder="Nome da coluna"
                            className="text-sm px-2 py-1 outline-none w-32"
                            value={newPlanColTitle}
                            onChange={e => setNewPlanColTitle(e.target.value)}
                          />
                          <button onClick={handleAddNewPlanColumn} className="bg-blue-500 text-white p-1 rounded-lg"><Check size={14}/></button>
                          <button onClick={() => setIsAddingPlanCol(false)} className="text-gray-400 p-1 hover:text-red-500"><X size={14}/></button>
                      </div>
                  ) : (
                      <button 
                        onClick={() => setIsAddingPlanCol(true)}
                        className="text-sm font-bold text-blue-600 bg-white border border-blue-100 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2"
                      >
                          <Plus size={16}/> Coluna
                      </button>
                  )}
              </div>
          </div>
          
          <div className="overflow-x-auto">
             <table className="w-full min-w-[1000px]">
                 <thead>
                     <tr className="text-left text-xs font-bold text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                         <th className="p-4 pl-6">Campanha</th>
                         <th className="p-4 text-right">Orçamento Mês</th>
                         <th className="p-4 text-right">Orçamento Dia</th>
                         <th className="p-4 text-right bg-blue-50/50">Meta Leads</th>
                         <th className="p-4 text-right bg-green-50/50">Leads (Real)</th>
                         <th className="p-4 text-right bg-blue-50/50">Meta Vendas</th>
                         <th className="p-4 text-right bg-green-50/50">Vendas (Real)</th>
                         {trafficPlanningColumns.map(col => (
                              <th key={col.id} className="p-4 group relative min-w-[120px]">
                                  {editingPlanColId === col.id ? (
                                      <input 
                                        autoFocus
                                        className="w-20 text-xs bg-white border border-blue-300 rounded px-1"
                                        value={editingPlanColTitle}
                                        onChange={e => setEditingPlanColTitle(e.target.value)}
                                        onBlur={() => {
                                            if(editingPlanColTitle) updateTrafficPlanningColumnTitle(col.id, editingPlanColTitle);
                                            setEditingPlanColId(null);
                                        }}
                                        onKeyDown={e => {
                                            if(e.key === 'Enter') {
                                                if(editingPlanColTitle) updateTrafficPlanningColumnTitle(col.id, editingPlanColTitle);
                                                setEditingPlanColId(null);
                                            }
                                        }}
                                      />
                                  ) : (
                                      <div className="flex items-center gap-2 cursor-pointer hover:text-blue-500" onClick={() => { setEditingPlanColId(col.id); setEditingPlanColTitle(col.title); }}>
                                          {col.title} <Edit2 size={10} className="opacity-0 group-hover:opacity-100"/>
                                      </div>
                                  )}
                              </th>
                          ))}
                     </tr>
                 </thead>
                 <tbody className="text-sm text-gray-700">
                     {filteredCampaigns.filter(c => c.isActive).map(campaign => (
                         <tr key={campaign.id} className="border-b border-gray-50 hover:bg-gray-50">
                             <td className="p-4 pl-6 font-bold">{campaign.name}</td>
                             {['budgetMonth', 'budgetDaily'].map(field => (
                                <td key={field} className="p-4 text-right">
                                    <span 
                                        className="hover:text-blue-600 hover:font-bold border-b border-transparent hover:border-blue-200 cursor-text"
                                        onClick={(e) => { e.stopPropagation(); startEditCell(campaign.id, field, (campaign as any)[field]); }}
                                    >
                                        {editingCell?.id === campaign.id && editingCell?.field === field ? (
                                            <input 
                                                autoFocus
                                                type="number"
                                                className="w-20 text-right p-1 border border-blue-400 rounded outline-none"
                                                value={tempValue}
                                                onChange={e => setTempValue(e.target.value)}
                                                onBlur={saveCell}
                                                onKeyDown={e => e.key === 'Enter' && saveCell()}
                                            />
                                        ) : (
                                            `R$ ${(campaign as any)[field]}`
                                        )}
                                    </span>
                                </td>
                             ))}
                             
                             {/* Targets & Results */}
                             {['leadsTarget', 'leadsResult', 'salesTarget', 'salesResult'].map((field, idx) => {
                                 const isResult = field.includes('Result');
                                 const targetField = field.replace('Result', 'Target');
                                 const isGoalMet = isResult && (campaign as any)[field] >= (campaign as any)[targetField];
                                 const bgClass = isResult ? 'bg-green-50/30' : 'bg-blue-50/30';
                                 
                                 return (
                                     <td key={field} className={`p-4 text-right ${bgClass}`}>
                                         <div className="flex items-center justify-end gap-2">
                                             {isResult && (campaign as any)[targetField] > 0 && (
                                                isGoalMet ? <Check size={14} className="text-green-500"/> : <X size={14} className="text-red-400"/>
                                             )}
                                             <span 
                                                className="hover:text-blue-600 hover:font-bold border-b border-transparent hover:border-blue-200 cursor-text"
                                                onClick={(e) => { e.stopPropagation(); startEditCell(campaign.id, field, (campaign as any)[field] || 0); }}
                                            >
                                                {editingCell?.id === campaign.id && editingCell?.field === field ? (
                                                    <input 
                                                        autoFocus
                                                        type="number"
                                                        className="w-16 text-right p-1 border border-blue-400 rounded outline-none"
                                                        value={tempValue}
                                                        onChange={e => setTempValue(e.target.value)}
                                                        onBlur={saveCell}
                                                        onKeyDown={e => e.key === 'Enter' && saveCell()}
                                                    />
                                                ) : (
                                                    (campaign as any)[field] || 0
                                                )}
                                            </span>
                                         </div>
                                     </td>
                                 );
                             })}
                             
                             {/* Custom Planning Columns */}
                             {trafficPlanningColumns.map(col => (
                                 <td key={col.id} className="p-4">
                                     {editingCell?.id === campaign.id && editingCell?.field === `plan_custom_${col.id}` ? (
                                        <input 
                                            autoFocus
                                            className="w-full p-1 border border-blue-400 rounded outline-none"
                                            value={tempValue}
                                            onChange={e => setTempValue(e.target.value)}
                                            onBlur={saveCell}
                                            onKeyDown={e => e.key === 'Enter' && saveCell()}
                                        />
                                    ) : (
                                        <span 
                                            className="block min-h-[20px] hover:bg-white/50 px-2 rounded cursor-text"
                                            onClick={(e) => { e.stopPropagation(); startEditCell(campaign.id, `plan_custom_${col.id}`, campaign.planningCustomValues[col.id] || ''); }}
                                        >
                                            {campaign.planningCustomValues[col.id] || '-'}
                                        </span>
                                    )}
                                 </td>
                             ))}
                         </tr>
                     ))}
                 </tbody>
             </table>
          </div>
      </div>


      {/* Main Table Area (Operational) */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
          
          {/* Controls */}
          <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center bg-gray-50/50">
              <div className="relative group w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    placeholder="Pesquisar por campanha ou rede social..." 
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
              </div>

              {/* Add Column Button */}
              <div className="flex items-center gap-2">
                  {isAddingCol ? (
                      <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-blue-200 shadow-sm animate-fade-in">
                          <input 
                            autoFocus
                            placeholder="Nome da coluna"
                            className="text-sm px-2 py-1 outline-none w-32"
                            value={newColTitle}
                            onChange={e => setNewColTitle(e.target.value)}
                          />
                          <button onClick={handleAddNewColumn} className="bg-blue-500 text-white p-1 rounded-lg"><Check size={14}/></button>
                          <button onClick={() => setIsAddingCol(false)} className="text-gray-400 p-1 hover:text-red-500"><X size={14}/></button>
                      </div>
                  ) : (
                      <button 
                        onClick={() => setIsAddingCol(true)}
                        className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2"
                      >
                          <Plus size={16}/> Coluna
                      </button>
                  )}
              </div>
          </div>

          {/* Table Header */}
          <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                  <thead>
                      <tr className="text-left text-xs font-bold text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                          <th className="p-4 pl-6 w-24">Plat.</th>
                          <th className="p-4 w-64">Campanha</th>
                          <th className="p-4">Status</th>
                          {/* Removed Budget from operational view to avoid redundancy, kept Spent/ROI/CPC */}
                          <th className="p-4 text-right">Gasto (R$)</th>
                          <th className="p-4 text-right">CPC</th>
                          <th className="p-4 text-right">ROI</th>
                          {trafficColumns.map(col => (
                              <th key={col.id} className="p-4 group relative min-w-[120px]">
                                  {editingColId === col.id ? (
                                      <div className="flex items-center gap-1">
                                          <input 
                                            autoFocus
                                            className="w-20 text-xs bg-white border border-blue-300 rounded px-1"
                                            value={editingColTitle}
                                            onChange={e => setEditingColTitle(e.target.value)}
                                            onBlur={() => {
                                                if(editingColTitle) updateTrafficColumnTitle(col.id, editingColTitle);
                                                setEditingColId(null);
                                            }}
                                            onKeyDown={e => {
                                                if(e.key === 'Enter') {
                                                    if(editingColTitle) updateTrafficColumnTitle(col.id, editingColTitle);
                                                    setEditingColId(null);
                                                }
                                            }}
                                          />
                                      </div>
                                  ) : (
                                      <div className="flex items-center gap-2 cursor-pointer hover:text-blue-500" onClick={() => { setEditingColId(col.id); setEditingColTitle(col.title); }}>
                                          {col.title} <Edit2 size={10} className="opacity-0 group-hover:opacity-100"/>
                                      </div>
                                  )}
                              </th>
                          ))}
                          <th className="p-4 w-10"></th>
                      </tr>
                  </thead>
                  <tbody className="text-sm text-gray-700">
                      {filteredCampaigns.map(campaign => (
                          <React.Fragment key={campaign.id}>
                              <tr 
                                className={clsx(
                                    "border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer group",
                                    expandedRow === campaign.id ? "bg-blue-50/50" : ""
                                )}
                                onClick={() => setExpandedRow(expandedRow === campaign.id ? null : campaign.id)}
                              >
                                  <td className="p-4 pl-6">
                                      <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                                              {getPlatformIcon(campaign.platform)}
                                          </div>
                                          {campaign.creativeUrl && (
                                              <img src={campaign.creativeUrl} alt="Preview" className="w-8 h-8 rounded-lg object-cover border border-gray-200" />
                                          )}
                                      </div>
                                  </td>
                                  <td className="p-4 font-bold text-gray-800">
                                      {campaign.name}
                                  </td>
                                  <td className="p-4">
                                      <button onClick={(e) => handleToggleStatus(e, campaign)}>
                                          {campaign.isActive ? 
                                              <ToggleRight className="text-green-500" size={28}/> : 
                                              <ToggleLeft className="text-gray-300" size={28}/>
                                          }
                                      </button>
                                  </td>
                                  
                                  {/* Editable Cells */}
                                  {['spent', 'cpc', 'roi'].map(field => (
                                      <td key={field} className="p-4 text-right">
                                          {editingCell?.id === campaign.id && editingCell?.field === field ? (
                                              <input 
                                                autoFocus
                                                type="number"
                                                className="w-20 text-right p-1 border border-blue-400 rounded outline-none"
                                                value={tempValue}
                                                onChange={e => setTempValue(e.target.value)}
                                                onBlur={saveCell}
                                                onKeyDown={e => e.key === 'Enter' && saveCell()}
                                                onClick={e => e.stopPropagation()}
                                              />
                                          ) : (
                                              <span 
                                                className="hover:text-blue-600 hover:font-bold border-b border-transparent hover:border-blue-200"
                                                onClick={(e) => { e.stopPropagation(); startEditCell(campaign.id, field, (campaign as any)[field]); }}
                                              >
                                                  {field === 'roi' ? (campaign as any)[field] + 'x' : 'R$ ' + (campaign as any)[field]}
                                              </span>
                                          )}
                                      </td>
                                  ))}

                                  {/* Custom Columns Cells */}
                                  {trafficColumns.map(col => (
                                      <td key={col.id} className="p-4">
                                          {editingCell?.id === campaign.id && editingCell?.field === `custom_${col.id}` ? (
                                              <input 
                                                autoFocus
                                                className="w-full p-1 border border-blue-400 rounded outline-none"
                                                value={tempValue}
                                                onChange={e => setTempValue(e.target.value)}
                                                onBlur={saveCell}
                                                onKeyDown={e => e.key === 'Enter' && saveCell()}
                                                onClick={e => e.stopPropagation()}
                                              />
                                          ) : (
                                              <span 
                                                className="block min-h-[20px] hover:bg-white/50 px-2 rounded cursor-text"
                                                onClick={(e) => { e.stopPropagation(); startEditCell(campaign.id, `custom_${col.id}`, campaign.customValues[col.id] || ''); }}
                                              >
                                                  {campaign.customValues[col.id] || '-'}
                                              </span>
                                          )}
                                      </td>
                                  ))}

                                  <td className="p-4 text-center">
                                      {expandedRow === campaign.id ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
                                  </td>
                              </tr>
                              
                              {/* Expanded Detail Row */}
                              {expandedRow === campaign.id && (
                                  <tr className="bg-gray-50/50 animate-fade-in">
                                      <td colSpan={100} className="p-0">
                                          <div className="p-8 border-b border-gray-100 flex gap-8">
                                              
                                              {/* Creative Preview & Upload */}
                                              <div className="w-64 shrink-0">
                                                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Criativo</label>
                                                  <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden relative group">
                                                      {campaign.creativeUrl ? (
                                                          <img src={campaign.creativeUrl} className="w-full h-full object-cover" />
                                                      ) : (
                                                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                                              <ImageIcon size={32} />
                                                          </div>
                                                      )}
                                                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold cursor-pointer">
                                                          Alterar Criativo
                                                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, campaign)} />
                                                      </label>
                                                  </div>
                                              </div>

                                              {/* Details Grid */}
                                              <div className="flex-1 grid grid-cols-2 gap-6">
                                                  {/* General Info */}
                                                  <div className="col-span-2 grid grid-cols-2 gap-6 pb-6 border-b border-gray-200">
                                                        <div className="col-span-2">
                                                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Nome da Campanha</label>
                                                            <input 
                                                                className="w-full bg-white p-3 border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:border-blue-400"
                                                                value={campaign.name}
                                                                onChange={e => updateTrafficCampaign({...campaign, name: e.target.value})}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Rede Social</label>
                                                            <select 
                                                                className="w-full bg-white p-3 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none"
                                                                value={campaign.platform}
                                                                onChange={e => updateTrafficCampaign({...campaign, platform: e.target.value as SocialPlatform})}
                                                            >
                                                                {SOCIAL_PLATFORMS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Data de Início</label>
                                                            <input 
                                                                type="date"
                                                                className="w-full bg-white p-3 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none"
                                                                value={new Date(campaign.startDate).toISOString().split('T')[0]}
                                                                onChange={e => updateTrafficCampaign({...campaign, startDate: new Date(e.target.value).getTime()})}
                                                            />
                                                        </div>
                                                  </div>
                                                  
                                                  {/* Ad Copy */}
                                                  <div className="col-span-2">
                                                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Legenda / Copy do Anúncio</label>
                                                      <textarea 
                                                        className="w-full bg-white p-3 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none resize-none h-24"
                                                        placeholder="Texto principal do anúncio..."
                                                        value={campaign.caption || ''}
                                                        onChange={e => updateTrafficCampaign({...campaign, caption: e.target.value})}
                                                      />
                                                  </div>
                                              </div>
                                          </div>
                                      </td>
                                  </tr>
                              )}
                          </React.Fragment>
                      ))}
                  </tbody>
              </table>
          </div>
          
          {filteredCampaigns.length === 0 && (
              <div className="p-12 text-center text-gray-400">
                  <Megaphone size={48} className="mx-auto mb-4 opacity-50"/>
                  <p className="text-lg font-bold">Nenhuma campanha encontrada</p>
                  <p className="text-sm">Tente ajustar os filtros ou crie uma nova campanha.</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default Traffic;

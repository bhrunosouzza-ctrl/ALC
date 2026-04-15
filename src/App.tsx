/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  Upload, 
  Filter, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Map as MapIcon, 
  Activity,
  Calendar,
  Layers,
  Search,
  AlertTriangle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, LarvalSample, VisitRecord, NeighborhoodStats } from './lib/utils';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function App() {
  const [samples, setSamples] = useState<LarvalSample[]>([]);
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [selectedYear, setSelectedYear] = useState<string>('Todos');
  const [selectedCycle, setSelectedCycle] = useState<string>('Todos');
  const [selectedBairro, setSelectedBairro] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // File Parsing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'samples' | 'visits') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const formatDate = (val: any) => {
        if (val instanceof Date) {
          return val.toLocaleDateString('pt-BR');
        }
        if (typeof val === 'number') {
          // Handle Excel serial dates if cellDates: true didn't catch it
          const date = new Date((val - 25569) * 86400 * 1000);
          return date.toLocaleDateString('pt-BR');
        }
        return String(val || '');
      };

      if (type === 'samples') {
        // Map fields based on the CSV structure provided
        const mapped = data.map((item: any) => ({
          Identificacao: String(item.Identificação || item.Identificacao || ''),
          DataCadastro: formatDate(item.DataCadastro),
          DataColeta: formatDate(item.DataColeta),
          Ciclo: String(item.Ciclo || ''),
          Bairro: String(item.Bairro || ''),
          Deposito: String(item.Deposito || ''),
          LarvaAegypti: Number(item.LarvaAegypti || 0),
          PupaAegypti: Number(item.PupaAegypti || 0),
          LarvaAlbopictus: Number(item.LarvaAlbopictus || 0),
          PupaAlbopictus: Number(item.PupaAlbopictus || 0),
          LarvaOutros: Number(item.LarvaOutros || 0),
          PupaOutros: Number(item.PupaOutros || 0),
          Classif_LarvaAegypti: String(item.Classif_LarvaAegypti || ''),
          Classif_PupaAegypti: String(item.Classif_PupaAegypti || ''),
          Classif_LarvaAlbopictus: String(item.Classif_LarvaAlbopictus || ''),
          Classif_PupaAlbopictus: String(item.Classif_PupaAlbopictus || ''),
          Classif_LarvaOutros: String(item.Classif_LarvaOutros || ''),
          Classif_PupaOutros: String(item.Classif_PupaOutros || ''),
        }));
        setSamples(mapped);
      } else {
        const mapped = data.map((item: any) => ({
          Identificacao: String(item.Identificação || item.Identificacao || ''),
          Data: formatDate(item.Data),
          Ciclo: String(item.Ciclo || ''),
          Bairro: String(item.Bairro || ''),
          Total_T: Number(item.Total_T || 0),
          Fechado: Number(item.Fechado || 0),
          Recusa: Number(item.Recusa || 0),
          Resgate: Number(item.Resgate || 0),
          Im_Trat: Number(item.Im_Trat || 0),
          Dep_Trat: Number(item.Dep_Trat || 0),
          A1: Number(item.A1 || 0),
          A2: Number(item.A2 || 0),
          B: Number(item.B || 0),
          C: Number(item.C || 0),
          D1: Number(item.D1 || 0),
          D2: Number(item.D2 || 0),
          E: Number(item.E || 0),
          Total_Dep: Number(item.Total_Dep || 0),
        }));
        setVisits(mapped);
      }
      setLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  // Derived Data
  const years = useMemo(() => {
    const sYears = samples.map(s => s.DataColeta?.split('/')[2]).filter(Boolean);
    const vYears = visits.map(v => v.Data?.split('-')[2]).filter(Boolean);
    return Array.from(new Set([...sYears, ...vYears])).sort();
  }, [samples, visits]);

  const cycles = useMemo(() => {
    const sCycles = samples.map(s => s.Ciclo).filter(Boolean);
    const vCycles = visits.map(v => v.Ciclo).filter(Boolean);
    return Array.from(new Set([...sCycles, ...vCycles])).sort();
  }, [samples, visits]);

  const bairros = useMemo(() => {
    const sBairros = samples.map(s => s.Bairro).filter(Boolean);
    const vBairros = visits.map(v => v.Bairro).filter(Boolean);
    return Array.from(new Set([...sBairros, ...vBairros])).sort();
  }, [samples, visits]);

  // Filtered Data
  const filteredSamples = useMemo(() => {
    return samples.filter(s => {
      const year = s.DataColeta?.split('/')[2];
      return (selectedYear === 'Todos' || year === selectedYear) &&
             (selectedCycle === 'Todos' || s.Ciclo === selectedCycle) &&
             (selectedBairro === 'Todos' || s.Bairro === selectedBairro);
    });
  }, [samples, selectedYear, selectedCycle, selectedBairro]);

  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      const year = v.Data?.split('-')[2];
      return (selectedYear === 'Todos' || year === selectedYear) &&
             (selectedCycle === 'Todos' || v.Ciclo === selectedCycle) &&
             (selectedBairro === 'Todos' || v.Bairro === selectedBairro);
    });
  }, [visits, selectedYear, selectedCycle, selectedBairro]);

  // Analytics
  const stats = useMemo(() => {
    const neighborhoodMap = new Map<string, NeighborhoodStats>();

    // Process Visits first to get denominators
    filteredVisits.forEach(v => {
      const current = neighborhoodMap.get(v.Bairro) || {
        bairro: v.Bairro,
        totalVisitas: 0,
        imoveisPositivos: 0,
        depositosPositivos: 0,
        iip: 0,
        ib: 0,
        aegyptiCount: 0,
        albopictusCount: 0,
        outrosCount: 0
      };
      current.totalVisitas += v.Total_T;
      neighborhoodMap.set(v.Bairro, current);
    });

    // Process Samples to get numerators
    filteredSamples.forEach(s => {
      const current = neighborhoodMap.get(s.Bairro) || {
        bairro: s.Bairro,
        totalVisitas: 0,
        imoveisPositivos: 0,
        depositosPositivos: 0,
        iip: 0,
        ib: 0,
        aegyptiCount: 0,
        albopictusCount: 0,
        outrosCount: 0
      };

      const isPositive = s.LarvaAegypti > 0 || s.PupaAegypti > 0 || s.LarvaAlbopictus > 0 || s.PupaAlbopictus > 0;
      if (isPositive) {
        current.imoveisPositivos += 1; // Simplification: each sample is a positive building
        current.depositosPositivos += 1;
      }

      current.aegyptiCount += (s.LarvaAegypti + s.PupaAegypti);
      current.albopictusCount += (s.LarvaAlbopictus + s.PupaAlbopictus);
      current.outrosCount += (s.LarvaOutros + s.PupaOutros);

      neighborhoodMap.set(s.Bairro, current);
    });

    // Calculate Indices
    const result = Array.from(neighborhoodMap.values()).map(item => {
      if (item.totalVisitas > 0) {
        item.iip = Number(((item.imoveisPositivos / item.totalVisitas) * 100).toFixed(2));
        item.ib = Number(((item.depositosPositivos / item.totalVisitas) * 100).toFixed(2));
      }
      return item;
    });

    return result.sort((a, b) => b.iip - a.iip);
  }, [filteredSamples, filteredVisits]);

  const speciesData = useMemo(() => {
    let aegypti = 0;
    let albopictus = 0;
    let outros = 0;

    filteredSamples.forEach(s => {
      aegypti += (s.LarvaAegypti + s.PupaAegypti);
      albopictus += (s.LarvaAlbopictus + s.PupaAlbopictus);
      outros += (s.LarvaOutros + s.PupaOutros);
    });

    return [
      { name: 'Aedes aegypti', value: aegypti },
      { name: 'Aedes albopictus', value: albopictus },
      { name: 'Outros', value: outros }
    ].filter(d => d.value > 0);
  }, [filteredSamples]);

  const depositData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSamples.forEach(s => {
      if (s.LarvaAegypti > 0 || s.PupaAegypti > 0 || s.LarvaAlbopictus > 0 || s.PupaAlbopictus > 0) {
        counts[s.Deposito] = (counts[s.Deposito] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredSamples]);

  const totalInspected = useMemo(() => filteredVisits.reduce((acc, v) => acc + v.Total_T, 0), [filteredVisits]);
  const totalPositive = useMemo(() => filteredSamples.filter(s => s.LarvaAegypti > 0 || s.PupaAegypti > 0 || s.LarvaAlbopictus > 0 || s.PupaAlbopictus > 0).length, [filteredSamples]);
  const avgIIP = totalInspected > 0 ? ((totalPositive / totalInspected) * 100).toFixed(2) : '0.00';

  return (
    <div className="flex h-screen bg-bg-base text-text-primary font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] bg-bg-surface border-r border-border-theme p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
        <div className="text-accent-success font-bold text-lg tracking-tight mb-2">
          ANALYTICS TIMÓTEO
        </div>

        {/* Upload Section in Sidebar */}
        <div className="flex flex-col gap-4">
          <label className="sidebar-label">Importar Dados</label>
          
          <div className="relative group">
            <label className="flex flex-col items-center justify-center p-4 border border-dashed border-border-theme rounded-lg bg-bg-card/50 hover:border-accent-success transition-colors cursor-pointer text-center">
              <Upload className="w-5 h-5 text-text-secondary group-hover:text-accent-success mb-2" />
              <span className="text-[11px] text-text-secondary">Amostras (.xlsx)</span>
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => handleFileUpload(e, 'samples')} />
            </label>
          </div>

          <div className="relative group">
            <label className="flex flex-col items-center justify-center p-4 border border-dashed border-border-theme rounded-lg bg-bg-card/50 hover:border-accent-success transition-colors cursor-pointer text-center">
              <Layers className="w-5 h-5 text-text-secondary group-hover:text-accent-success mb-2" />
              <span className="text-[11px] text-text-secondary">Visitas (.xlsx)</span>
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => handleFileUpload(e, 'visits')} />
            </label>
          </div>
        </div>

        {/* Filters in Sidebar */}
        <div className="flex flex-col gap-5 mt-2">
          <div className="flex flex-col gap-1">
            <label className="sidebar-label">Ano de Referência</label>
            <div className="relative">
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="sidebar-select"
              >
                <option value="Todos">Todos os Anos</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-secondary rotate-90" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="sidebar-label">Ciclo</label>
            <div className="relative">
              <select 
                value={selectedCycle} 
                onChange={(e) => setSelectedCycle(e.target.value)}
                className="sidebar-select"
              >
                <option value="Todos">Todos os Ciclos</option>
                {cycles.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-secondary rotate-90" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="sidebar-label">Bairro</label>
            <div className="relative">
              <select 
                value={selectedBairro} 
                onChange={(e) => setSelectedBairro(e.target.value)}
                className="sidebar-select"
              >
                <option value="Todos">Todos os Bairros</option>
                {bairros.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-secondary rotate-90" />
            </div>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <button className="w-full bg-accent-success text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-accent-success/10">
            Gerar Relatório PDF
          </button>
          <button 
            onClick={() => { setSamples([]); setVisits([]); }}
            className="w-full bg-accent-danger/10 border border-accent-danger/20 text-accent-danger py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-accent-danger/20 transition-all"
          >
            Limpar Dados
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto p-8 gap-8">
        <header className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Monitoramento Arboviroses</h1>
            <p className="text-text-secondary text-sm">Município de Timóteo, MG</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Última Atualização</div>
            <div className="text-sm font-medium">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </div>
        </header>

        {samples.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-md text-center">
              <div className="bg-bg-surface p-6 rounded-2xl border border-border-theme mb-6 inline-block">
                <Activity className="w-12 h-12 text-accent-success" />
              </div>
              <h2 className="text-xl font-bold mb-2">Aguardando Importação</h2>
              <p className="text-text-secondary text-sm">Utilize a barra lateral para importar os arquivos de amostras e visitas para iniciar a análise.</p>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard 
                title="Índice de Breteau (IB)" 
                value={`${(stats.reduce((acc, s) => acc + s.ib, 0) / (stats.length || 1)).toFixed(1)}%`} 
                icon={<Activity className="w-5 h-5" />}
                color={Number(avgIIP) > 3.9 ? "danger" : Number(avgIIP) > 0.9 ? "warn" : "success"}
                subtitle="Média Municipal"
              />
              <KPICard 
                title="Infestação Predial (IIP)" 
                value={`${avgIIP}%`} 
                icon={<AlertTriangle className="w-5 h-5" />}
                color={Number(avgIIP) > 3.9 ? "danger" : Number(avgIIP) > 0.9 ? "warn" : "success"}
                subtitle="Média Municipal"
              />
              <KPICard 
                title="Amostras Coletadas" 
                value={filteredSamples.length.toLocaleString()} 
                icon={<Layers className="w-5 h-5" />}
                color="primary"
              />
              <KPICard 
                title="Status Municipal" 
                value={Number(avgIIP) > 3.9 ? "ALTO RISCO" : Number(avgIIP) > 0.9 ? "ALERTA" : "CONTROLADO"} 
                icon={<CheckCircle2 className="w-5 h-5" />}
                color={Number(avgIIP) > 3.9 ? "danger" : Number(avgIIP) > 0.9 ? "warn" : "success"}
                isStatus
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Species Distribution */}
              <div className="chart-container">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-accent-success" />
                    Frequência de Espécies
                  </h3>
                </div>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={speciesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {speciesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={[ '#3FB950', '#D29922', '#F85149', '#3b82f6' ][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1C2128', borderRadius: '8px', border: '1px solid #30363D', color: '#E6EDF3' }}
                        itemStyle={{ color: '#E6EDF3' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Deposit Types */}
              <div className="chart-container">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-accent-warn" />
                    Tipo de Depósito mais Frequente
                  </h3>
                </div>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={depositData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#30363D" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={100} fontSize={10} tick={{ fill: '#8B949E' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(48, 54, 61, 0.5)' }}
                        contentStyle={{ backgroundColor: '#1C2128', borderRadius: '8px', border: '1px solid #30363D', color: '#E6EDF3' }}
                      />
                      <Bar dataKey="value" fill="#D29922" radius={[0, 4, 4, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Heatmap Simulation */}
              <div className="chart-container">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-accent-danger" />
                    Mapa de Calor: Incidência por Bairro
                  </h3>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                  {stats.map((neighborhood, i) => {
                    const iip = neighborhood.iip || 0;
                    return (
                      <div 
                        key={neighborhood.bairro} 
                        className={cn(
                          "aspect-square rounded-md transition-all duration-500 flex items-center justify-center text-[8px] font-bold text-center p-1 leading-tight",
                          iip > 3.9 ? "bg-accent-danger text-white" : 
                          iip > 0.9 ? "bg-accent-warn text-black" : 
                          iip > 0 ? "bg-accent-success text-white" : "bg-border-theme/30 text-text-secondary"
                        )}
                        title={`${neighborhood.bairro}: ${iip}%`}
                      >
                        {neighborhood.bairro.substring(0, 6)}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-text-secondary mt-4">Distribuição visual do Índice de Infestação Predial (IIP) por bairro.</p>
              </div>

              {/* Ranking Table */}
              <div className="chart-container overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Ranking IIP por Bairro</h3>
                </div>
                <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                  <table className="w-full text-left text-[12px]">
                    <thead className="sticky top-0 bg-bg-card z-10">
                      <tr className="text-text-secondary border-b border-border-theme">
                        <th className="pb-2 font-medium">Bairro</th>
                        <th className="pb-2 font-medium text-center">IIP (%)</th>
                        <th className="pb-2 font-medium text-center">IB (%)</th>
                        <th className="pb-2 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-theme">
                      {stats.map((item) => (
                        <tr key={item.bairro} className="group hover:bg-bg-surface/50 transition-colors">
                          <td className="py-3 font-medium text-text-primary">{item.bairro}</td>
                          <td className="py-3 text-center font-mono text-accent-warn">{item.iip.toFixed(1)}</td>
                          <td className="py-3 text-center text-text-secondary">{item.ib.toFixed(1)}</td>
                          <td className="py-3 text-right">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                              item.iip > 3.9 ? "text-accent-danger border-accent-danger/30 bg-accent-danger/10" : 
                              item.iip > 0.9 ? "text-accent-warn border-accent-warn/30 bg-accent-warn/10" : 
                              "text-accent-success border-accent-success/30 bg-accent-success/10"
                            )}>
                              {item.iip > 3.9 ? "Crítico" : item.iip > 0.9 ? "Alerta" : "Controlado"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function KPICard({ title, value, icon, color, subtitle, isStatus }: { title: string, value: string | number, icon: React.ReactNode, color: string, subtitle?: string, isStatus?: boolean }) {
  const colorMap: Record<string, string> = {
    success: "text-accent-success",
    warn: "text-accent-warn",
    danger: "text-accent-danger",
    primary: "text-text-primary",
  };

  return (
    <div className="stat-card flex flex-col justify-between min-h-[110px]">
      <div>
        <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block mb-1">{title}</span>
        <div className={cn(
          "font-bold tracking-tight",
          isStatus ? "text-lg" : "text-2xl",
          colorMap[color] || "text-text-primary"
        )}>
          {value}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-text-secondary font-medium">{subtitle}</span>
        <div className={cn("opacity-50", colorMap[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}

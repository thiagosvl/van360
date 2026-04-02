import { useState } from "react";
import { 
  Users, 
  Bus, 
  School, 
  TrendingUp, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Button } from "@/components/ui/button";

const data = [
  { name: "Jan", total: 400, revenue: 2400 },
  { name: "Fev", total: 600, revenue: 1398 },
  { name: "Mar", total: 800, revenue: 9800 },
  { name: "Abr", total: 1000, revenue: 3908 },
  { name: "Mai", total: 1200, revenue: 4800 },
  { name: "Jun", total: 1400, revenue: 3800 },
  { name: "Jul", total: 1600, revenue: 4300 },
];

const stats = [
  {
    title: "Total de Motoristas",
    value: "1,280",
    description: "+12.5% em relação ao mês anterior",
    icon: ShieldCheck,
    trend: "up",
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    title: "Passageiros Ativos",
    value: "14,520",
    description: "+4.2% em relação ao mês anterior",
    icon: Users,
    trend: "up",
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  {
    title: "Receita Total",
    value: "R$ 42.500",
    description: "-2.1% em relação ao mês anterior",
    icon: DollarSign,
    trend: "down",
    color: "text-amber-600",
    bg: "bg-amber-50"
  },
  {
    title: "Veículos Cadastrados",
    value: "842",
    description: "+5.1% em relação ao mês anterior",
    icon: Bus,
    trend: "up",
    color: "text-indigo-600",
    bg: "bg-indigo-50"
  },
];

import { ShieldCheck } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 text-left">
          <h1 className="text-3xl font-headline font-black text-[#1a3a5c] tracking-tight uppercase">Dashboard</h1>
          <p className="text-sm font-semibold text-slate-400">Visão macro do ecossistema Van360.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl border-slate-200 h-11 text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-white hover:text-[#1a3a5c]">
            Exportar Dados
          </Button>
          <Button className="rounded-2xl h-11 bg-[#1a3a5c] text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1a3a5c]/20 hover:bg-[#1a3a5c]/95">
            Relatórios Gerais
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300">
             <CardContent className="p-6">
               <div className="flex items-start justify-between">
                 <div className={cn("p-3.5 rounded-2xl", stat.bg)}>
                   <stat.icon className={cn("h-6 w-6", stat.color)} />
                 </div>
                 <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", 
                   stat.trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                    {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.trend === 'up' ? "8.2%" : "3.1%"}
                 </div>
               </div>
               <div className="mt-6 flex flex-col items-start">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.title}</h3>
                  <p className="text-3xl font-headline font-black text-[#1a3a5c] tracking-tighter">{stat.value}</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-2">{stat.description}</p>
               </div>
             </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden bg-white p-2">
           <CardHeader className="flex flex-row items-center justify-between p-6">
              <div className="space-y-1 text-left">
                <CardTitle className="text-sm font-headline font-black text-[#1a3a5c] uppercase tracking-tight">Crescimento de Usuários</CardTitle>
                <CardDescription className="text-xs font-semibold text-slate-400">Total de motoristas e passageiros (Simulado)</CardDescription>
              </div>
              <Activity className="h-5 w-5 text-slate-300" />
           </CardHeader>
           <CardContent className="p-4 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a3a5c" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1a3a5c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '1rem', 
                      border: 'none', 
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                      fontWeight: '700'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#1a3a5c" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
           </CardContent>
        </Card>

        {/* Side Widget */}
        <Card className="border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden bg-white p-2">
           <CardHeader className="p-6">
              <div className="space-y-1 text-left">
                <CardTitle className="text-sm font-headline font-black text-[#1a3a5c] uppercase tracking-tight">Atividades Recentes</CardTitle>
                <CardDescription className="text-xs font-semibold text-slate-400">Últimas 5 ações críticas</CardDescription>
              </div>
           </CardHeader>
           <CardContent className="px-6 flex flex-col gap-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all">
                  <div className="h-10 w-10 bg-slate-50 flex items-center justify-center rounded-xl text-slate-400 group-hover:bg-[#1a3a5c] group-hover:text-white transition-all">
                    <History className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-700 truncate leading-tight">Novo passageiro cadastrado</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Há {item * 5} minutos — Motorista Silva</p>
                  </div>
                  <MoreVertical className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100" />
                </div>
              ))}
              <Button variant="ghost" className="mt-4 w-full rounded-2xl text-[10px] font-black uppercase text-[#1a3a5c] hover:bg-slate-50">
                Ver Todos os Logs
              </Button>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { History } from "lucide-react";

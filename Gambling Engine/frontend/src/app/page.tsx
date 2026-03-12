'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Trophy, 
  CheckCircle, 
  XCircle, 
  Clock,
  Database,
  ShieldAlert,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface Bet {
  bet_id: number;
  game_id: number;
  system_triggered: string;
  odds_taken: number;
  stake: number;
  result: string;
  created_at: string;
}

interface InningLog {
  log_id: number;
  game_id: number;
  inning_number: number;
  half: string;
  runs_scored: number;
  baserunners: number;
}

interface Team {
  team_id: number;
  abbreviation: string;
  bullpen_era_rank: number;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'bets' | 'feed' | 'teams'>('bets');
  const [bets, setBets] = useState<Bet[]>([]);
  const [logs, setLogs] = useState<InningLog[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [betsRes, logsRes, teamsRes] = await Promise.all([
        fetch('/api/bets'),
        fetch('/api/logs'),
        fetch('/api/teams')
      ]);
      setBets(await betsRes.json());
      setLogs(await logsRes.json());
      setTeams(await teamsRes.json());
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const sendTestAlert = async () => {
    setTestLoading(true);
    try {
      const res = await fetch('/api/test-discord', { method: 'POST' });
      const data = await res.json();
      if (data.error) alert(data.error);
      else alert('Test Alert Sent!');
    } catch (err) {
      alert('Network error');
    } finally {
      setTestLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const updateResult = async (bet_id: number, result: string) => {
    try {
      await fetch('/api/bets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bet_id, result }),
      });
      fetchData();
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const stats = {
    total: bets.length,
    wins: bets.filter(b => b.result === 'WON').length,
    losses: bets.filter(b => b.result === 'LOST').length,
    pending: bets.filter(b => b.result === 'PENDING').length,
    winRate: bets.filter(b => b.result !== 'PENDING').length > 0
      ? (bets.filter(b => b.result === 'WON').length / bets.filter(b => b.result !== 'PENDING').length * 100).toFixed(1)
      : '0.0'
  };

  const chartData = [
    { name: 'NR2I Regression', wins: bets.filter(b => b.system_triggered === 'NR2I Regression' && b.result === 'WON').length },
    { name: 'Big Inning Momentum', wins: bets.filter(b => b.system_triggered === 'Big Inning Momentum' && b.result === 'WON').length },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight">Do Something Inc. | Betting Engine</h1>
            <p className="text-slate-400 mt-1">Real-time management & analytics dashboard.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/rules"
              className="bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
            >
              <Settings size={16} /> Rules Engine
            </Link>
            <button 
              onClick={sendTestAlert}
              disabled={testLoading}
              className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-50"
            >
              {testLoading ? 'Sending...' : 'Test Discord Alert'}
            </button>
            <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-emerald-500/30">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-emerald-400">Engine Online</span>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Opportunities" value={stats.total} icon={<Activity className="text-blue-400" />} />
          <StatCard title="Win Rate" value={`${stats.winRate}%`} icon={<Trophy className="text-yellow-400" />} />
          <StatCard title="Total Wins" value={stats.wins} icon={<CheckCircle className="text-emerald-400" />} />
          <StatCard title="Pending Resolution" value={stats.pending} icon={<Clock className="text-slate-400" />} />
        </div>

        {/* Tabs Switcher */}
        <div className="flex gap-1 bg-slate-900/80 p-1 rounded-xl w-fit border border-slate-800">
          <TabButton active={activeTab === 'bets'} onClick={() => setActiveTab('bets')} icon={<Trophy size={16} />} label="Bet History" />
          <TabButton active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} icon={<Database size={16} />} label="Live Data Feed" />
          <TabButton active={activeTab === 'teams'} onClick={() => setActiveTab('teams')} icon={<ShieldAlert size={16} />} label="Bullpen Rankings" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {activeTab === 'bets' && (
              <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Opportunities Tracked</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs uppercase text-slate-500 bg-slate-950/50">
                      <tr>
                        <th className="px-6 py-4">Game ID</th>
                        <th className="px-6 py-4">System</th>
                        <th className="px-6 py-4">Stake</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {loading ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading data...</td></tr>
                      ) : bets.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No bets tracked yet.</td></tr>
                      ) : (
                        bets.map((bet) => (
                          <tr key={bet.bet_id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 font-mono text-blue-400">#{bet.game_id}</td>
                            <td className="px-6 py-4 text-sm font-medium">{bet.system_triggered}</td>
                            <td className="px-6 py-4 text-sm">{(bet.stake * 100).toFixed(1)}%</td>
                            <td className="px-6 py-4">
                              <StatusBadge status={bet.result} />
                            </td>
                            <td className="px-6 py-4">
                              {bet.result === 'PENDING' && (
                                <div className="flex gap-2">
                                  <button onClick={() => updateResult(bet.bet_id, 'WON')} className="p-1 hover:text-emerald-400 transition-colors">
                                    <CheckCircle size={18} />
                                  </button>
                                  <button onClick={() => updateResult(bet.bet_id, 'LOST')} className="p-1 hover:text-rose-400 transition-colors">
                                    <XCircle size={18} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'feed' && (
              <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                  <h2 className="text-xl font-semibold">Live Inning Logs</h2>
                  <p className="text-xs text-slate-500 mt-1">Real-time data flow from MLB-StatsAPI.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs uppercase text-slate-500 bg-slate-950/50">
                      <tr>
                        <th className="px-6 py-4">Log ID</th>
                        <th className="px-6 py-4">Game ID</th>
                        <th className="px-6 py-4">Inning</th>
                        <th className="px-6 py-4">Half</th>
                        <th className="px-6 py-4 text-emerald-400">Runs</th>
                        <th className="px-6 py-4 text-blue-400">Runners</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono text-sm">
                      {logs.map((log) => (
                        <tr key={log.log_id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-3 text-slate-500">#{log.log_id}</td>
                          <td className="px-6 py-3 text-blue-400">{log.game_id}</td>
                          <td className="px-6 py-3">{log.inning_number}</td>
                          <td className="px-6 py-3 uppercase">{log.half}</td>
                          <td className="px-6 py-3 text-emerald-400 font-bold">{log.runs_scored}</td>
                          <td className="px-6 py-3 text-blue-400">{log.baserunners}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'teams' && (
              <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                  <h2 className="text-xl font-semibold">Bullpen Rankings</h2>
                  <p className="text-xs text-slate-500 mt-1">Teams ranked by Bullpen ERA (Season Stats).</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-slate-800">
                  {teams.map((team) => (
                    <div key={team.team_id} className="bg-slate-950 p-4 flex flex-col items-center gap-1">
                      <span className="text-2xl font-black text-slate-700">#{team.bullpen_era_rank}</span>
                      <span className="text-lg font-bold text-white">{team.abbreviation}</span>
                      <div className={`h-1 w-full rounded-full mt-2 ${team.bullpen_era_rank <= 10 ? 'bg-emerald-500' : team.bullpen_era_rank <= 20 ? 'bg-yellow-500' : 'bg-rose-500'}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Analytics Column */}
          <div className="space-y-8">
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-6">Wins by System</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#94a3b8' }}
                    />
                    <Bar dataKey="wins">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#8b5cf6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-emerald-600/20 rounded-xl border border-blue-500/20 p-6">
              <h3 className="text-lg font-semibold text-blue-300">Strategy Insight</h3>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                The engine is currently tracking {logs.length} data points across active games.
                {teams.length > 0 && ` System 2 is prioritizing fade opportunities against teams like ${teams[teams.length - 1].abbreviation} (Rank ${teams[teams.length - 1].bullpen_era_rank}).`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        {icon}
      </div>
      <span className="text-3xl font-bold tracking-tight">{value}</span>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    WON: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    LOST: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    PENDING: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${styles[status]}`}>
      {status}
    </span>
  );
}

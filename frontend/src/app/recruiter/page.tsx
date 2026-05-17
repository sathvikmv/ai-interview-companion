'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
    ArcElement, PointElement, LineElement, RadialLinearScale, Filler
} from 'chart.js';
import RecruiterDashboard from '@/components/RecruiterDashboard';
import { getCandidates, getAnalytics } from '@/lib/api';
import { BarChart3, BrainCircuit, RefreshCw, Loader2, Home, Users2, TrendingUp } from 'lucide-react';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
    ArcElement, PointElement, LineElement, RadialLinearScale, Filler
);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: { color: '#94a3b8', font: { size: 11 } },
        },
    },
    scales: {
        x: {
            ticks: { color: '#64748b' },
            grid: { color: 'rgba(51,65,85,0.3)' },
        },
        y: {
            ticks: { color: '#64748b' },
            grid: { color: 'rgba(51,65,85,0.3)' },
        },
    },
};

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom' as const,
            labels: { color: '#94a3b8', font: { size: 11 }, padding: 12 },
        },
    },
};

const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: { color: '#94a3b8', font: { size: 11 } },
        },
    },
    scales: {
        r: {
            ticks: { color: '#64748b', backdropColor: 'transparent' },
            grid: { color: 'rgba(51,65,85,0.4)' },
            pointLabels: { color: '#94a3b8', font: { size: 11 } },
            min: 0,
            max: 100,
        },
    },
};

export default function RecruiterPage() {
    const router = useRouter();
    const [candidates, setCandidates] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeView, setActiveView] = useState<'candidates' | 'analytics'>('candidates');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [candData, analyticsData] = await Promise.all([
                getCandidates(),
                getAnalytics(),
            ]);
            setCandidates(candData.candidates || []);
            setAnalytics(analyticsData);
        } catch (e: any) {
            setError(e.message || 'Failed to load data. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const scoreDistData = analytics?.score_distribution ? {
        labels: analytics.score_distribution.labels,
        datasets: [{
            label: 'Candidates',
            data: analytics.score_distribution.data,
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: '#3b82f6',
            borderWidth: 1,
            borderRadius: 6,
        }],
    } : null;

    const decisionData = analytics?.decision_breakdown ? {
        labels: analytics.decision_breakdown.labels,
        datasets: [{
            data: analytics.decision_breakdown.data,
            backgroundColor: ['rgba(16,185,129,0.7)', 'rgba(239,68,68,0.7)', 'rgba(245,158,11,0.7)'],
            borderColor: ['#10b981', '#ef4444', '#f59e0b'],
            borderWidth: 2,
        }],
    } : null;

    const radarData = analytics?.score_radar ? {
        labels: analytics.score_radar.labels,
        datasets: [{
            label: 'Avg. Scores',
            data: analytics.score_radar.data,
            backgroundColor: 'rgba(99,102,241,0.2)',
            borderColor: '#6366f1',
            borderWidth: 2,
            pointBackgroundColor: '#6366f1',
            pointRadius: 4,
        }],
    } : null;

    const timelineData = analytics?.timeline ? {
        labels: analytics.timeline.labels,
        datasets: [
            {
                label: 'Interviews',
                data: analytics.timeline.interviews,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
            },
            {
                label: 'Selected',
                data: analytics.timeline.selected,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16,185,129,0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
            },
        ],
    } : null;

    const skillHeatmapData = analytics?.skill_heatmap ? {
        labels: analytics.skill_heatmap.labels,
        datasets: [{
            label: 'Candidates with skill',
            data: analytics.skill_heatmap.data,
            backgroundColor: 'rgba(6,182,212,0.6)',
            borderColor: '#06b6d4',
            borderWidth: 1,
            borderRadius: 4,
        }],
    } : null;

    return (
        <main className="min-h-screen bg-mesh-blue py-8 px-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-100">Recruiter Dashboard</h1>
                                <p className="text-xs text-slate-500">AI Interview Analytics & Candidate Intelligence</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => router.push('/')} className="btn-secondary flex items-center gap-2 text-sm">
                            <Home className="w-4 h-4" /> Home
                        </button>
                        <button onClick={fetchData} className="btn-secondary flex items-center gap-2 text-sm">
                            <RefreshCw className="w-4 h-4" /> Refresh
                        </button>
                    </div>
                </div>

                {/* View Switcher */}
                <div className="flex gap-1 glass-card p-1 max-w-xs">
                    {[
                        { id: 'candidates', label: 'Candidates', icon: Users2 },
                        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                    ].map(v => (
                        <button
                            key={v.id}
                            onClick={() => setActiveView(v.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${activeView === v.id
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <v.icon className="w-4 h-4" />
                            {v.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center space-y-4">
                            <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto" />
                            <p className="text-slate-400">Loading dashboard data...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="glass-card p-8 text-center space-y-4 border border-red-500/20 bg-red-500/5">
                        <p className="text-red-300 font-medium">{error}</p>
                        <button onClick={fetchData} className="btn-primary mx-auto flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" /> Retry
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Candidates View */}
                        {activeView === 'candidates' && (
                            <RecruiterDashboard
                                candidates={candidates}
                                analytics={analytics}
                                onViewReport={(sid) => router.push(`/results?session=${sid}`)}
                            />
                        )}

                        {/* Analytics View */}
                        {activeView === 'analytics' && analytics && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Charts Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {/* Score Distribution */}
                                    {scoreDistData && (
                                        <div className="glass-card p-5 space-y-3">
                                            <p className="text-sm font-semibold text-slate-200">Score Distribution</p>
                                            <p className="text-xs text-slate-500">Compatibility scores across all candidates</p>
                                            <div className="h-48">
                                                <Bar data={scoreDistData} options={chartOptions} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Decision Breakdown */}
                                    {decisionData && (
                                        <div className="glass-card p-5 space-y-3">
                                            <p className="text-sm font-semibold text-slate-200">Decision Breakdown</p>
                                            <p className="text-xs text-slate-500">Selected vs Rejected vs Pending</p>
                                            <div className="h-48">
                                                <Doughnut data={decisionData} options={doughnutOptions} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Skill Heatmap */}
                                    {skillHeatmapData && (
                                        <div className="glass-card p-5 space-y-3">
                                            <p className="text-sm font-semibold text-slate-200">Top Skills in Pool</p>
                                            <p className="text-xs text-slate-500">Most common skills across candidates</p>
                                            <div className="h-48">
                                                <Bar
                                                    data={skillHeatmapData}
                                                    options={{
                                                        ...chartOptions,
                                                        indexAxis: 'y' as const,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Radar Chart */}
                                    {radarData && (
                                        <div className="glass-card p-5 space-y-3">
                                            <p className="text-sm font-semibold text-slate-200">Average Score Radar</p>
                                            <p className="text-xs text-slate-500">Multi-dimensional performance overview</p>
                                            <div className="h-52">
                                                <Radar data={radarData} options={radarOptions} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    {timelineData && (
                                        <div className="glass-card p-5 space-y-3 md:col-span-2">
                                            <p className="text-sm font-semibold text-slate-200">Interview Activity (Last 7 Days)</p>
                                            <p className="text-xs text-slate-500">Interviews conducted and selection rate</p>
                                            <div className="h-48">
                                                <Line data={timelineData} options={{
                                                    ...chartOptions,
                                                    plugins: { ...chartOptions.plugins, legend: { labels: { color: '#94a3b8', font: { size: 11 } } } }
                                                }} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Summary Stats */}
                                {analytics.summary && (
                                    <div className="glass-card p-6">
                                        <p className="section-header mb-4">Platform Summary</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center">
                                                <p className="text-3xl font-black text-blue-400">{analytics.summary.total_candidates}</p>
                                                <p className="text-xs text-slate-500 mt-1">Total Candidates</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-3xl font-black text-indigo-400">{analytics.summary.total_interviews}</p>
                                                <p className="text-xs text-slate-500 mt-1">Interviews Done</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-3xl font-black text-emerald-400">{analytics.summary.selected}</p>
                                                <p className="text-xs text-slate-500 mt-1">Selected</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-3xl font-black text-purple-400">{analytics.summary.selection_rate}%</p>
                                                <p className="text-xs text-slate-500 mt-1">Selection Rate</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
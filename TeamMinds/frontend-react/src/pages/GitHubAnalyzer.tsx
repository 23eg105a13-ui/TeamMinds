import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Search, AlertTriangle, Shield, CheckCircle, ExternalLink, RefreshCw, Lightbulb, Zap, Code } from 'lucide-react';
import { Button, GlassCard } from '../components/ui/Core';
import axios from 'axios';

const API_BASE = "http://127.0.0.1:8000/api";

const GitHubAnalyzer = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!url.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_BASE}/github/analyze`, { repo_url: url });
            setStats(res.data);
        } catch (err: any) {
            setError(err?.response?.data?.detail || "Failed to analyze repository. Make sure the URL is public and valid.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-10 custom-scrollbar overflow-y-auto">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Github className="w-10 h-10" /> Repository Analyzer
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">Scale your code quality analysis across entire GitHub projects.</p>
                </header>

                <GlassCard className="mb-12 border-indigo-100 shadow-indigo-500/5">
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="https://github.com/organization/repository"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 font-semibold text-slate-700 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <Button onClick={handleAnalyze} disabled={loading} className="px-10 h-auto">
                                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Start Deep Analysis"}
                            </Button>
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm font-bold flex items-center gap-2 px-2">
                                <AlertTriangle className="w-4 h-4" /> {error}
                            </div>
                        )}
                    </div>
                </GlassCard>

                {stats && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        {/* Summary Score */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <GlassCard className="col-span-1 md:col-span-2 flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Project Health Score</div>
                                    <div className="text-6xl font-black text-indigo-600 tracking-tighter">{stats.health}%</div>
                                </div>
                                <div className="w-24 h-24 rounded-full border-[8px] border-indigo-50 border-t-indigo-600 rotate-45" />
                            </GlassCard>

                            <StatBox label="Active Issues" val={stats.issues} icon={AlertTriangle} color="highlight" />
                            <StatBox label="Total Files" val={stats.files?.length || 0} icon={Shield} color="success" />
                        </div>

                        {/* Category Scores */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <CategoryBar label="Security Compliance" val={stats.categories.security} color="indigo" />
                            <CategoryBar label="Runtime Performance" val={stats.categories.performance} color="accent" />
                            <CategoryBar label="Maintainability Index" val={stats.categories.maintainability} color="primary" />
                        </div>

                        {/* Technical Analysis */}
                        <GlassCard className="bg-white border-indigo-100">
                            <h3 className="text-xl font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                                <Code className="w-6 h-6 text-indigo-600" /> Technical Analysis
                            </h3>
                            <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                                {stats.code_analysis}
                            </p>
                        </GlassCard>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Project Suggestions */}
                            <GlassCard className="bg-indigo-50/50 border-indigo-100">
                                <h3 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-indigo-600" /> Structural Suggestions
                                </h3>
                                <ul className="space-y-3">
                                    {(stats.project_suggestions || []).map((s: string, i: number) => (
                                        <li key={i} className="flex gap-3 items-start p-3 bg-white rounded-xl border border-indigo-100 shadow-sm">
                                            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                            <span className="text-sm font-semibold text-slate-700">{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </GlassCard>

                            {/* Feature Ideas */}
                            <GlassCard className="bg-amber-50/50 border-amber-100">
                                <h3 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5 text-amber-600" /> Roadmap & Feature Ideas
                                </h3>
                                <ul className="space-y-3">
                                    {(stats.feature_ideas || []).map((s: string, i: number) => (
                                        <li key={i} className="flex gap-3 items-start p-3 bg-white rounded-xl border border-amber-100 shadow-sm">
                                            <SparklesIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                            <span className="text-sm font-semibold text-slate-700">{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </GlassCard>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const SparklesIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
);

const StatBox = ({ label, val, icon: Icon, color }: any) => (
    <GlassCard className="text-center">
        <div className="text-4xl font-black text-slate-800 tracking-tighter">{val}</div>
        <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">{label}</div>
        <Icon className={`w-5 h-5 mx-auto text-[var(--${color})]`} />
    </GlassCard>
);

const CategoryBar = ({ label, val, color }: any) => (
    <GlassCard className="bg-white border-slate-100">
        <div className="flex justify-between items-end mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            <span className="text-lg font-black text-slate-800">{val}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${val}%`, backgroundColor: `var(--${color})` }} />
        </div>
    </GlassCard>
);

export default GitHubAnalyzer;

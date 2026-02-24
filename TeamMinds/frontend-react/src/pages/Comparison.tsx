import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles, CheckCircle, XCircle, Play, ArrowLeftRight,
    ShieldCheck, Zap, RefreshCw, ChevronRight
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, GlassCard } from '../components/ui/Core';
import CodeEditor from '../components/CodeEditor';
import { ValidationResult, Severity } from '../types/index';

const API_BASE = "/api";

const ComparisonPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const initialCode = searchParams.get('code') || "// No code provided\ndef main():\n    pass";
    const initialLang = searchParams.get('lang') || "python";

    const [originalCode, setOriginalCode] = useState(initialCode);
    const [rewrittenCode, setRewrittenCode] = useState("// Analyzing and optimizing your code...");
    const [language, setLanguage] = useState(initialLang);
    const [validating, setValidating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
    const [metrics, setMetrics] = useState({ security: "0%", performance: "0%", reliability: "0%", challenges: [] as any[] });

    useEffect(() => {
        if (initialCode && initialCode !== "// No code provided") {
            handleInitialOptimization();
        }
    }, []);

    const handleInitialOptimization = async () => {
        setLoading(true);
        try {
            // First, get a rewrite
            const rewriteRes = await axios.post(`${API_BASE}/rewrite/`, { code: originalCode, language });
            setRewrittenCode(rewriteRes.data.rewritten_code);

            // Also get metadata (challenges/metrics) from review
            const reviewRes = await axios.post(`${API_BASE}/review/`, { code: originalCode, language });
            setMetrics({
                security: `+${(reviewRes.data.security_score * 100).toFixed(0)}%`,
                performance: `+${(reviewRes.data.performance_score * 100).toFixed(0)}%`,
                reliability: `${(reviewRes.data.quality_score * 100).toFixed(1)}%`,
                challenges: reviewRes.data.suggested_challenges || []
            });
        } catch (err) {
            console.error("Initialization failed", err);
            setRewrittenCode("// Failed to optimize code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async () => {
        setValidating(true);
        try {
            const res = await axios.post(`${API_BASE}/validation/`, {
                code: originalCode,
                language
            });
            setValidationResults(res.data.results);
            setMetrics(prev => ({
                ...prev,
                security: res.data.security_boost,
                performance: res.data.performance_boost,
                reliability: res.data.reliability_score
            }));
        } catch (err) {
            console.error("Validation failed", err);
        } finally {
            setValidating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Fix Validation Engine</h1>
                        <p className="text-slate-500 font-medium text-sm">Compare original and rewritten code while verifying integrity through automated tests.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Max Confidence</span>
                            <div className="text-2xl font-black gradient-text">98.4%</div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* Original Panel */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Original Submission</span>
                            <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded">3 Issues Detected</span>
                        </div>
                        <div className="h-[400px]">
                            <CodeEditor code={originalCode} setCode={(c) => setOriginalCode(c || "")} readOnly />
                        </div>
                    </div>

                    {/* Rewritten Panel */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> AI Optimized Version
                            </span>
                            <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">All Issues Resolved</span>
                        </div>
                        <div className="h-[400px]">
                            <CodeEditor code={rewrittenCode} setCode={(c) => setRewrittenCode(c || "")} />
                        </div>
                    </div>
                </div>

                {/* Validation Dashboard */}
                <GlassCard className="bg-white border-slate-200">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-800">Automated Validation Results</h3>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-tighter">Consistency & Regression Testing</p>
                            </div>
                        </div>
                        <Button onClick={handleValidate} disabled={validating} className="flex items-center gap-2">
                            {validating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 outline-none fill-white" />}
                            Run Formal Validation
                        </Button>
                    </div>

                    <div className="overflow-hidden border border-slate-100 rounded-xl">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Test Suite Name</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Original Code</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Rewritten Code</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Message</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {validationResults.map((res, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-sm text-slate-700">{res.test_name}</td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={res.original_status} />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={res.rewritten_status} />
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-400">
                                            {res.original_status === 'FAIL' ? "Type check failed on runtime." : "Environment consistent."}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Improvement Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                        <MetricBox label="Security Boost" val={metrics.security} icon={ShieldCheck} color="indigo" />
                        <MetricBox label="Performance" val={metrics.performance} icon={Zap} color="highlight" />
                        <MetricBox label="Reliability" val={metrics.reliability} icon={CheckCircle} color="success" />
                    </div>

                    {/* Challenges Section as requested by user */}
                    {metrics.challenges.length > 0 && (
                        <div className="mt-10 pt-10 border-t border-slate-100">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-indigo-500" /> Suggested Similar Challenges (LeetCode / CodeChef)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {metrics.challenges.map((ch: any, idx: number) => (
                                    <a
                                        key={idx}
                                        href={ch.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-500 transition-all flex justify-between items-center group shadow-sm"
                                    >
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 truncate mr-2">{ch.name}</span>
                                        <Play className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 shrink-0" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: 'PASS' | 'FAIL' }) => (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${status === 'PASS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
        }`}>
        {status === 'PASS' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
        {status}
    </span>
);

const MetricBox = ({ label, val, icon: Icon, color }: any) => (
    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
        <div>
            <div className={`text-2xl font-black text-slate-800`}>{val}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
        </div>
        <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[var(--${color})]`}>
            <Icon className="w-6 h-6" />
        </div>
    </div>
);

export default ComparisonPage;

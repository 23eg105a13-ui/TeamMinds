import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bug, Play, Sparkles, RefreshCw, Layout, History,
    Github, Settings, ChevronRight, AlertCircle, Info, CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button, GlassCard } from '../components/ui/Core';
import CodeEditor from '../components/CodeEditor';
import Terminal, { LogEntry } from '../components/Terminal';
import { ReviewResponse, Severity } from '../types/index';

// Use relative path for single-origin deployment, or environment variable for flexibility
const API_BASE = (import.meta as any).env?.VITE_API_URL || "/api";

const LANGUAGE_TEMPLATES: Record<string, string> = {
    python: "def main():\n    print('Hello, CodeWorks!')\n\nif __name__ == '__main__':\n    main()",
    javascript: "function main() {\n    console.log('Hello, CodeWorks!');\n}\n\nmain();",
    java: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, CodeWorks!\");\n    }\n}",
    cpp: "#include <iostream>\n\nint main() {\n    std::cout << \"Hello, CodeWorks!\" << std::endl;\n    return 0;\n}",
    csharp: "using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine(\"Hello, CodeWorks!\");\n    }\n}",
    go: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello, CodeWorks!\")\n}",
    rust: "fn main() {\n    println!(\"Hello, CodeWorks!\");\n}",
    php: "<?php\necho \"Hello, CodeWorks!\";\n?>",
    ruby: "def main\n  puts 'Hello, CodeWorks!'\nend\n\nmain"
};

const Dashboard = () => {
    const { logout } = useAuth();
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState<string>(LANGUAGE_TEMPLATES['python']!);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [results, setResults] = useState<ReviewResponse | null>(null);
    const [translating, setTranslating] = useState(false);

    const addLog = (text: string, type: LogEntry['type'] = 'info') => {
        setLogs(prev => [...prev, { text, type }]);
    };

    useEffect(() => {
        // Recognition of BOTH new and old placeholders/templates
        const legacyPlaceholders = ["# Paste your code here", "CodeWorks Ready", "Hello, CodeWorks"];
        const isPlaceholder = legacyPlaceholders.some(p => code.includes(p)) ||
            Object.values(LANGUAGE_TEMPLATES).some(t => code.trim() === t.trim());

        if (isPlaceholder || !code.trim()) {
            setCode(LANGUAGE_TEMPLATES[language] || "");
            addLog(`Switched to ${language} template.`, 'info');
        } else if (!loading && !translating) {
            handleTranslate();
        }
    }, [language]);

    const handleTranslate = async () => {
        if (!code.trim()) return;
        setTranslating(true);
        addLog(`Translating logic to ${language}...`, 'info');
        try {
            const res = await axios.post(`${API_BASE}/translate`, {
                code,
                from_lang: "auto",
                to_lang: language
            });
            if (res.data.translated_code) {
                setCode(res.data.translated_code);
                addLog("Code translated successfully.", 'success');
            }
        } catch (err: any) {
            addLog("Translation failed. Keeping original code.", 'error');
        } finally {
            setTranslating(false);
        }
    };

    const handleReview = async () => {
        setLoading(true);
        addLog(`Analyzing ${language} code...`, 'info');
        try {
            const res = await axios.post(`${API_BASE}/review`, { code, language });
            setResults(res.data);
            addLog("AI Review completed. Found issues mapped to severity.", 'success');
        } catch (err: any) {
            addLog(`Error: ${err?.response?.data?.detail || err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRun = async () => {
        addLog("> Starting execution process...", 'info');
        try {
            // Use 127.0.0.1 for more reliability in some environments
            const res = await axios.post(`${API_BASE}/execute`, { code, language });
            if (res.data.output) addLog(res.data.output, 'default');
            if (res.data.error) addLog(res.data.error, 'error');
            addLog(`Exited with status: ${res.data.status}`, res.data.status === 'success' ? 'success' : 'error');
        } catch (err: any) {
            addLog(`Execution failed: ${err.message}`, 'error');
        }
    };

    return (
        <div className="h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="h-16 bg-white border-b border-[var(--border)] flex items-center justify-between px-8 shrink-0 z-10">
                <div className="flex items-center space-x-4">
                    <span className="text-xl font-bold gradient-text">Dashboard</span>
                    <div className="h-4 w-px bg-slate-200"></div>
                    <div className="flex items-center gap-2">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-slate-100 border-none text-sm font-semibold rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="python">Python</option>
                            <option value="javascript">JavaScript</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                            <option value="csharp">C#</option>
                            <option value="go">Go</option>
                            <option value="rust">Rust</option>
                            <option value="php">PHP</option>
                            <option value="ruby">Ruby</option>
                        </select>
                        {translating && <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />}
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <Button variant="secondary" onClick={handleRun} className="flex items-center gap-2">
                        <Play className="w-4 h-4" /> Run
                    </Button>
                    <Button onClick={handleReview} disabled={loading || translating} className="flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Analyze Code
                    </Button>
                    <Button
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                        onClick={() => window.location.href = `/comparison?code=${encodeURIComponent(code)}&lang=${language}`}
                    >
                        Optimize with AI
                    </Button>
                    <div className="h-6 w-px bg-slate-200 mx-1"></div>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            logout();
                            window.location.href = '/login';
                        }}
                        className="text-slate-500 hover:text-red-500 hover:bg-red-50 hover:border-red-100"
                    >
                        Logout
                    </Button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Left Panel: Editor & Terminal */}
                <div className="flex-1 flex flex-col min-w-0 border-r border-[var(--border)]">
                    <div className="flex-1 bg-white p-4">
                        <CodeEditor code={code} setCode={(c) => setCode(c || "")} language={language} />
                    </div>
                    <div className="h-[250px] shrink-0 flex">
                        <Terminal logs={logs} />
                    </div>
                </div>

                {/* Right Panel: Analysis Results */}
                <div className="w-[450px] bg-slate-50 flex flex-col overflow-y-auto p-6 custom-scrollbar">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-indigo-600" /> Analysis Results
                    </h2>

                    {!results ? (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-center px-10">
                            <Bug className="w-16 h-16 mb-4 text-slate-400" />
                            <p className="text-sm font-medium">Ready for deep analysis. Click "Analyze Code" to generate issues.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Score Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <ScoreCard label="Confidence" val={results.confidence_score * 100} color="indigo" />
                                <ScoreCard label="Quality" val={results.quality_score * 100} color="emerald" />
                            </div>

                            {/* Complexity Metrics (New 3.1) */}
                            <div className="grid grid-cols-2 gap-4">
                                <MetricBox small label="Time" val={results.time_complexity || "O(N)"} icon={Play} color="indigo" />
                                <MetricBox small label="Space" val={results.space_complexity || "O(1)"} icon={Layout} color="accent" />
                            </div>

                            {/* Resource Impact (New 3.1) */}
                            <GlassCard className="bg-slate-900 border-slate-800 text-white py-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Resource impact</span>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-400">{results.resource_impact || "Low Consumption"}</span>
                                </div>
                            </GlassCard>

                            {/* Improvement Summary */}
                            <GlassCard className="bg-white/80 border-indigo-100">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">Summary</h4>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">{results.improvement_summary}</p>
                            </GlassCard>

                            {/* Similar Challenges (New 3.1) */}
                            {results.suggested_challenges && results.suggested_challenges.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 px-1">
                                        <Settings className="w-3 h-3" /> Practice Similar Problems
                                    </h4>
                                    {results.suggested_challenges.map((ch, idx) => (
                                        <a
                                            key={idx}
                                            href={ch.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 transition-colors group"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{ch.name}</span>
                                                    {ch.platform && (
                                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md self-start border border-slate-100 uppercase tracking-tighter">
                                                            {ch.platform}
                                                        </span>
                                                    )}
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            )}

                            {/* Issues List */}
                            <div className="space-y-3">
                                {results.critical_issues.map((i: string, k: number) => <IssueCard key={k} issue={i} severity="critical" />)}
                                {results.high_issues.map((i: string, k: number) => <IssueCard key={k} issue={i} severity="high" />)}
                                {results.medium_issues.map((i: string, k: number) => <IssueCard key={k} issue={i} severity="medium" />)}
                                {results.low_issues.map((i: string, k: number) => <IssueCard key={k} issue={i} severity="low" />)}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

// Internal Components
const ScoreCard = ({ label, val, color }: { label: string, val: number, color: string }) => (
    <GlassCard className="bg-white border-slate-200 py-4 text-center">
        <div className="text-2xl font-extrabold text-slate-800">{val.toFixed(0)}%</div>
        <div className={`text-[10px] uppercase font-bold text-${color}-500`}>{label}</div>
    </GlassCard>
);

const MetricBox = ({ label, val, icon: Icon, color, small = false }: any) => (
    <div className={`rounded-xl bg-white border border-slate-100 flex items-center justify-between ${small ? 'p-3' : 'p-5'}`}>
        <div>
            <div className={`${small ? 'text-lg' : 'text-2xl'} font-black text-slate-800 tracking-tighter`}>{val}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
        </div>
        <div className={`w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[var(--${color})]`}>
            <Icon className="w-4 h-4" />
        </div>
    </div>
);

const IssueCard = ({ issue, severity }: { issue: string, severity: Severity }) => {
    const config: Record<Severity, any> = {
        critical: { icon: AlertCircle, color: 'var(--highlight)', bg: 'rgba(249,115,22,0.05)' },
        high: { icon: Info, color: 'var(--accent)', bg: 'rgba(59,130,246,0.05)' },
        medium: { icon: Bug, color: 'var(--primary)', bg: 'rgba(79,70,229,0.05)' },
        low: { icon: CheckCircle2, color: 'var(--text-muted)', bg: 'rgba(148,163,184,0.05)' }
    };
    const { icon: Icon, color, bg } = config[severity];

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="p-4 rounded-xl flex gap-4 items-start border border-slate-200 bg-white hover:border-[var(--primary)] transition-colors shadow-sm">
                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center" style={{ backgroundColor: bg }}>
                    <Icon className="w-4 h-4" style={{ color: color }} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: color }}>{severity}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{issue}</p>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;

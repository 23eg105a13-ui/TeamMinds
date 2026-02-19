import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, CheckCircle, Code, BarChart3, Database, Globe } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, GlassCard } from '../components/ui/Core';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen relative overflow-hidden bg-white selection:bg-indigo-100 selection:text-indigo-900">

            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.05),transparent),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.05),transparent)]" />

            {/* Navbar */}
            <nav className="flex items-center justify-between px-10 py-6 sticky top-0 bg-white/50 backdrop-blur-md z-50 border-b border-[var(--border)]">
                <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Code className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold text-[var(--text-main)] tracking-tight">
                        Code<span className="gradient-text">Works</span>
                    </span>
                </div>
                <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-[var(--text-muted)]">
                    <a href="#features" className="hover:text-[var(--primary)] transition-colors text-slate-600">Features</a>

                    {isAuthenticated ? (
                        <>
                            <Link to="/history" className="hover:text-[var(--primary)] transition-colors text-slate-600">History</Link>
                            <Link to="/github" className="hover:text-[var(--primary)] transition-colors text-slate-600">Analyzer</Link>
                            <Link to="/dashboard">
                                <Button className="shadow-md shadow-indigo-500/10">Go to Dashboard</Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <a href="#stats" className="hover:text-[var(--primary)] transition-colors text-slate-600">Statistics</a>
                            <Link to="/login">
                                <Button variant="secondary" className="border-indigo-100 text-indigo-600">Log In</Button>
                            </Link>
                            <Link to="/dashboard">
                                <Button>Launch App</Button>
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="container mx-auto px-6 pt-32 pb-24 text-center relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-block px-4 py-1.5 mb-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider"
                >
                    v3.0 is now live • 10x faster validation
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-6xl md:text-8xl font-extrabold text-[var(--text-main)] mb-8 tracking-tight leading-[1.1]"
                >
                    Review. Fix. <br />
                    <span className="gradient-text">Validate.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    The first autonomous code analysis platform that doesn't just find bugs—it provides verified, production-ready fixes backed by simulated unit tests.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex flex-col sm:flex-row justify-center gap-4 mb-20"
                >
                    <Link to="/dashboard">
                        <Button className="px-10 py-5 text-lg shadow-xl shadow-indigo-500/30 font-bold">
                            Start Reviewing <ArrowRight className="ml-2 w-5 h-5 inline" />
                        </Button>
                    </Link>
                    <Link to="/github">
                        <Button variant="secondary" className="px-10 py-5 text-lg font-bold">
                            Analyze Repository
                        </Button>
                    </Link>
                </motion.div>

                {/* Feature Grid */}
                <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto">
                    {[
                        { icon: Zap, title: "AI Review Engine", desc: "Real-time vulnerability detection using Llama 3.3 70B.", color: "primary" },
                        { icon: Shield, title: "Secure Rewrite", desc: "Automated refactoring focused on security and performance.", color: "accent" },
                        { icon: CheckCircle, title: "Fix Validation", desc: "Simulated test execution to verify every fix's integrity.", color: "success" },
                        { icon: BarChart3, title: "Confidence Scoring", desc: "Quantified security and quality improvements for every fix.", color: "highlight" },
                        { icon: Globe, title: "GitHub Sync", desc: "Direct repository analysis and project health scoring.", color: "primary" },
                        { icon: Database, title: "History Storage", desc: "Immutable records of your project's quality evolution.", color: "accent" }
                    ].map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <GlassCard hover className="text-left group">
                                <div className={`w-12 h-12 rounded-xl mb-6 bg-[${`var(--${f.color})`}]/10 flex items-center justify-center transition-transform group-hover:scale-110`}>
                                    <f.icon className={`w-6 h-6 text-[var(--${f.color})]`} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{f.desc}</p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Stats Section */}
            <section id="stats" className="bg-slate-50 border-y border-[var(--border)] py-20 px-6">
                <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { label: "Lines Analyzed", val: "2.4M+" },
                        { label: "Bugs Prevented", val: "85K" },
                        { label: "AI Confidence", val: "99.2%" },
                        { label: "SaaS Enterprise", val: "Active" }
                    ].map((s, i) => (
                        <div key={i}>
                            <div className="text-4xl font-extrabold gradient-text mb-2 tracking-tighter">{s.val}</div>
                            <div className="text-sm font-semibold text-[var(--text-muted)] uppercase">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-[var(--border)] text-center text-[var(--text-muted)] text-xs font-medium">
                © 2026 CodeWorks Corporation. Powered by Advanced AI Engine.
            </footer>
        </div>
    );
};

export default LandingPage;

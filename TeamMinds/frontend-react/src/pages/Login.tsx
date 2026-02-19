import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, RefreshCw, Github, Sparkles } from 'lucide-react';
import { Button, GlassCard } from '../components/ui/Core';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            navigate("/", { replace: true });
        } catch (err) {
            console.error("Login failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 mb-4 rotate-3 hover:rotate-0 transition-transform duration-300">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">CodeWorks Login</h1>
                    <p className="text-slate-500 font-medium mt-2">Welcome back! Please enter your details.</p>
                </div>

                <GlassCard className="border-indigo-100 shadow-xl shadow-indigo-500/5 p-8 bg-white/80">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 font-semibold text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 font-semibold text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                                <span className="text-sm font-semibold text-slate-600">Remember me</span>
                            </label>
                            <a href="#" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Forgot?</a>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full h-14 text-base shadow-lg shadow-indigo-500/20">
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : (
                                <span className="flex items-center justify-center gap-2">
                                    <LogIn className="w-5 h-5" /> Sign In
                                </span>
                            )}
                        </Button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                                <span className="bg-white px-4 text-slate-300">Or continue with</span>
                            </div>
                        </div>

                        <Button variant="secondary" type="button" className="w-full h-14 bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-2">
                            <Github className="w-5 h-5" /> GitHub
                        </Button>
                    </form>
                </GlassCard>

                <p className="text-center mt-8 text-slate-500 text-sm font-medium">
                    Don't have an account? <a href="#" className="text-indigo-600 font-bold hover:underline">Sign up for free</a>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;

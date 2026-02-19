import React from 'react';
import { motion } from 'framer-motion';
import { Clock, FileCode, Search, Filter, ArrowRight, Star } from 'lucide-react';
import { GlassCard } from '../components/ui/Core';

const HistoryPage = () => {
    const history = [
        { id: 1, file: "main.py", date: "2 mins ago", issues: 4, score: "+22%", type: "Review" },
        { id: 2, file: "utils.js", date: "1 hour ago", issues: 1, score: "+85%", type: "Rewrite" },
        { id: 3, file: "server.go", date: "Yesterday", issues: 12, score: "+45%", type: "Validation" },
        { id: 4, file: "api_handler.ts", date: "Feb 15", issues: 0, score: "100%", type: "Review" }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-12">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 italic">Analysis History</h1>
                        <p className="text-slate-500 font-semibold uppercase text-xs tracking-widest">A permanent record of your project quality</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input placeholder="Search files..." className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm font-medium outline-none focus:border-indigo-500" />
                        </div>
                        <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
                            <Filter className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {history.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <GlassCard hover className="bg-white border-slate-200/60 p-0 overflow-hidden flex flex-col group">
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                                <FileCode className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg">{item.file}</h3>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                                    <Clock className="w-3 h-3" /> {item.date}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-black text-indigo-600 tracking-tighter">{item.score}</span>
                                            <span className="text-[10px] font-bold text-slate-300 uppercase">Improvement</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mt-auto">
                                        <div className="px-3 py-1 bg-slate-50 rounded-full border border-slate-100">{item.type}</div>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            <span>{item.issues} Issues Tracked</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full py-3 bg-slate-50 border-t border-slate-100 text-indigo-600 text-xs font-bold font-sans tracking-widest uppercase hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                    View Full report <ArrowRight className="w-4 h-4" />
                                </button>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;

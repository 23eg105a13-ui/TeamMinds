import React from 'react';
import { Terminal as TerminalIcon, ChevronRight } from 'lucide-react';

export interface LogEntry {
    text: string;
    type: 'info' | 'error' | 'success' | 'default';
}

interface TerminalProps {
    logs: LogEntry[];
}

const Terminal: React.FC<TerminalProps> = ({ logs }) => {
    return (
        <div className="flex-1 flex flex-col bg-slate-900 text-slate-300 font-mono text-sm overflow-hidden border-t border-slate-700">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
                <TerminalIcon className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Terminal Output</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {logs.length === 0 && <div className="text-slate-600 italic">No output yet... waiting for project initialization.</div>}
                {logs.map((log, i) => (
                    <div key={i} className="mb-1 flex gap-2">
                        <span className="text-slate-600 shrink-0"><ChevronRight className="w-4 h-4 inline" /></span>
                        <span className={
                            log.type === 'error' ? 'text-rose-400' :
                                log.type === 'success' ? 'text-emerald-400' :
                                    log.type === 'info' ? 'text-indigo-400' : 'text-slate-300'
                        }>
                            {log.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Terminal;

import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
    code: string;
    setCode: (code: string | undefined) => void;
    language?: string;
    readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, language = 'python', readOnly = false }) => {
    return (
        <div className="h-full w-full border border-[var(--border)] rounded-lg overflow-hidden shadow-inner bg-white">
            <Editor
                height="100%"
                language={language}
                theme="light"
                value={code}
                onChange={setCode}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', monospace",
                    lineNumbers: 'on',
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    readOnly: readOnly,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    cursorSmoothCaretAnimation: 'on',
                    smoothScrolling: true,
                    quickSuggestions: { other: true, comments: true, strings: true },
                    parameterHints: { enabled: true },
                    suggestOnTriggerCharacters: true,
                    acceptSuggestionOnEnter: 'on',
                    snippetSuggestions: 'top',
                    wordBasedSuggestions: 'allDocuments',
                }}
            />
        </div>
    );
};

export default CodeEditor;

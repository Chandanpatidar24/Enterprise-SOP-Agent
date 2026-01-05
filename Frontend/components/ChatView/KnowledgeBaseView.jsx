import React from 'react';
import { Plus, FileCheck, Trash2, Eye, ArrowLeft } from 'lucide-react';

const KnowledgeBaseView = ({
    documents,
    deleteDoc,
    handlePlusClick,
    currentUserRole,
    theme,
    t,
    onBack
}) => {
    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-12 md:pt-20 pt-32">
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
                    <div>
                        <button
                            onClick={onBack}
                            className={`mb-4 flex items-center gap-2 text-sm font-medium transition-colors relative z-50 cursor-pointer ${theme === 'light' ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <ArrowLeft size={16} />
                            Back to Chat
                        </button>
                        <h1 className="text-3xl font-bold mb-2">{t.knowledgeBase}</h1>
                        <p className="text-zinc-500">{t.kbSubtitle}</p>
                    </div>
                    {currentUserRole === 'admin' && (
                        <button onClick={handlePlusClick} className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 transition flex items-center gap-2">
                            <Plus size={18} /> {t.uploadSop}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border group relative overflow-hidden transition-all hover:border-blue-500/50 ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-[#171717] border-white/5'}`}>
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                {currentUserRole === 'admin' ? (
                                    <button onClick={() => deleteDoc(doc.filename)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white"><Trash2 size={16} /></button>
                                ) : (
                                    <div className="p-2 bg-white/5 text-zinc-500 rounded-lg cursor-not-allowed" title="ReadOnly"><Eye size={16} /></div>
                                )}
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 mb-4">
                                <FileCheck size={20} />
                            </div>
                            <h3 className="font-medium truncate mb-1" title={doc.filename}>{doc.filename}</h3>
                            <div className="flex items-center gap-4 text-xs text-zinc-500">
                                <span>{doc.chunkCount} vectors</span>
                                <span>{new Date(doc.lastUpdated).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KnowledgeBaseView;

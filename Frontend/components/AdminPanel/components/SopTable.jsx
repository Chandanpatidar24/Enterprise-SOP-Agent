import React from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';

const SopTable = ({ 
    theme, 
    sopDocuments, 
    toggleSOPAccess, 
    handleDeleteSOP, 
    setShowUploadSOPModal,
    getCategoryColor 
}) => {
    return (
        <section className={`rounded-xl border ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-[#121212] border-white/5'} overflow-hidden shadow-2xl`}>
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl shadow-inner"><FileText size={24} /></div>
                    <div>
                        <h3 className="text-xl font-bold tracking-tight">SOP Access Control</h3>
                        <p className="text-sm text-zinc-500 font-medium">Control which roles can access each document</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowUploadSOPModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-all font-bold text-sm uppercase tracking-wider shadow-lg"
                >
                    <Plus size={18} />
                    Upload SOP
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className={`border-b ${theme === 'light' ? 'bg-zinc-50 text-zinc-500' : 'bg-[#1a1a1a] text-zinc-400'}`}>
                            <th className="py-3 px-6 font-bold uppercase tracking-wider text-[11px]">SOP Document</th>
                            <th className="py-3 px-6 font-bold uppercase tracking-wider text-[11px]">Category</th>
                            <th className="py-3 px-6 font-bold uppercase tracking-wider text-[11px]">Version</th>
                            <th className="py-3 px-6 font-bold uppercase tracking-wider text-[11px] text-center">Employee</th>
                            <th className="py-3 px-6 font-bold uppercase tracking-wider text-[11px] text-center">Manager</th>
                            <th className="py-3 px-6 font-bold uppercase tracking-wider text-[11px] text-center">Admin</th>
                            <th className="py-3 px-6 font-bold uppercase tracking-wider text-[11px] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'light' ? 'divide-zinc-100' : 'divide-white/5'}`}>
                        {sopDocuments.map((sop) => (
                            <tr key={sop.id} className={`group transition-colors ${theme === 'light' ? 'hover:bg-zinc-50' : 'hover:bg-white/[0.02]'}`}>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/5 rounded-lg">
                                            <FileText size={16} className="text-zinc-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm transition-colors group-hover:text-amber-400">{sop.name}</div>
                                            <div className="text-[10px] text-zinc-500">Effective: {sop.effectiveDate}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-[0.1em] border ${getCategoryColor(sop.category)}`}>
                                        {sop.category}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-zinc-500 font-medium">v{sop.version}</td>
                                <td className="py-4 px-6 text-center">
                                    <button
                                        onClick={() => toggleSOPAccess(sop, 'employee')}
                                        className={`w-8 h-8 rounded-lg transition-all mx-auto flex items-center justify-center hover:scale-110 ${sop.access.employee
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-red-500/10 text-red-400/50 border border-red-500/20'
                                            }`}
                                    >
                                        {sop.access.employee ? '✓' : '✕'}
                                    </button>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <button
                                        onClick={() => toggleSOPAccess(sop, 'manager')}
                                        className={`w-8 h-8 rounded-lg transition-all mx-auto flex items-center justify-center hover:scale-110 ${sop.access.manager
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-red-500/10 text-red-400/50 border border-red-500/20'
                                            }`}
                                    >
                                        {sop.access.manager ? '✓' : '✕'}
                                    </button>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <button
                                        onClick={() => toggleSOPAccess(sop, 'admin')}
                                        className={`w-8 h-8 rounded-lg transition-all mx-auto flex items-center justify-center cursor-default ${sop.access.admin
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-red-500/10 text-red-400/50 border border-red-500/20'
                                            }`}
                                    >
                                        {sop.access.admin ? '✓' : '✕'}
                                    </button>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <button
                                        onClick={() => handleDeleteSOP(sop.filename || sop.id)}
                                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                        title="Delete Document"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5"><div className="flex items-center gap-6 text-[11px] text-zinc-500"><span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</span>Has Access</span><span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-red-500/10 text-red-400/50 flex items-center justify-center text-[10px]">✕</span>No Access</span></div></div>
        </section>
    );
};

export default SopTable;

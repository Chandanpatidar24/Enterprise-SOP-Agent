
import React, { useState, useRef, useEffect } from 'react';
import { Users, Cpu, Database, LogOut, Plus, X, Shield, FileText, Info, Eye, Calendar, Tag, Layers, ChevronDown, Check, Upload, Trash2 } from 'lucide-react';

// CustomDropdown component (inline)
const CustomDropdown = ({ options, value, onChange, theme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel = options.find(o => o.value === value)?.label || value;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all text-sm font-medium ${theme === 'light'
                    ? 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:border-zinc-600'
                    }`}
            >
                {selectedLabel}
                <ChevronDown size={14} className={`opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className={`absolute left-0 mt-2 min-w-[160px] w-max p-1.5 rounded-xl border shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100 ${theme === 'light'
                    ? 'bg-white border-zinc-100 shadow-zinc-200/50'
                    : 'bg-[#1f1f1f] border-zinc-700 shadow-black/50'
                    }`}>
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-all mb-0.5 last:mb-0 ${value === opt.value
                                ? (theme === 'light' ? 'bg-zinc-100 text-zinc-900 font-medium' : 'bg-white/10 text-white font-medium')
                                : (theme === 'light' ? 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200')
                                }`}
                        >
                            {opt.label}
                            {value === opt.value && <Check size={14} className={theme === 'light' ? 'text-black' : 'text-white'} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const AdminPanel = ({ theme, usersList, setUsersList, modelsList, setModelsList, setView, token }) => {
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showUploadSOPModal, setShowUploadSOPModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });
    const [explainSourcesEnabled, setExplainSourcesEnabled] = useState(false);

    // SOP Documents State
    const [sopDocuments, setSopDocuments] = useState([]);

    // Fetch documents on mount
    useEffect(() => {
        const fetchDocs = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/documents`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    const mapped = data.documents.map(doc => ({
                        id: doc.filename,
                        name: doc.sopName || doc.filename,
                        filename: doc.filename,
                        category: doc.category || 'General',
                        version: doc.version || '1.0',
                        effectiveDate: doc.effectiveDate || '-',
                        accessLevel: doc.accessLevel, // Save raw level
                        access: {
                            employee: doc.accessLevel === 'employee',
                            manager: doc.accessLevel === 'employee' || doc.accessLevel === 'manager',
                            admin: true
                        }
                    }));
                    setSopDocuments(mapped);
                }
            } catch (err) {
                console.error("Failed to fetch admin docs:", err);
            }
        };
        fetchDocs();
    }, [token]);

    // New SOP form state
    const [newSOP, setNewSOP] = useState({
        name: '',
        category: 'HR',
        accessLevel: 'employee',
        version: '1.0',
        effectiveDate: ''
    });

    // File State
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleAddUser = (e) => {
        e.preventDefault();
        setNewUser({ name: '', email: '', role: 'user' });
        setShowAddUserModal(false);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            if (!newSOP.name) {
                setNewSOP(prev => ({ ...prev, name: file.name }));
            }
        }
    };

    const handleUploadSOP = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert("Please select a valid PDF file.");
            return;
        }
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('sopName', newSOP.name || selectedFile.name);
            formData.append('category', newSOP.category);
            formData.append('accessLevel', newSOP.accessLevel);
            formData.append('version', newSOP.version);
            formData.append('effectiveDate', newSOP.effectiveDate || new Date().toISOString().split('T')[0]);

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                // Refresh list with new doc
                const accessConfig = {
                    employee: newSOP.accessLevel === 'employee',
                    manager: newSOP.accessLevel === 'employee' || newSOP.accessLevel === 'manager',
                    admin: true
                };
                const newDoc = {
                    id: data.data.filename,
                    name: newSOP.name || selectedFile.name,
                    filename: data.data.filename,
                    category: newSOP.category,
                    version: newSOP.version,
                    effectiveDate: newSOP.effectiveDate,
                    accessLevel: newSOP.accessLevel,
                    access: accessConfig
                };
                setSopDocuments(prev => [...prev, newDoc]);

                setNewSOP({ name: '', category: 'HR', accessLevel: 'employee', version: '1.0', effectiveDate: '' });
                setSelectedFile(null);
                setShowUploadSOPModal(false);
                alert("SOP Uploaded Successfully!");
            } else {
                alert(data.message || "Upload failed");
            }
        } catch (err) {
            console.error("Upload Error:", err);
            alert("Upload failed due to server error");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteSOP = async (filename) => {
        if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/documents/${encodeURIComponent(filename)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setSopDocuments(prev => prev.filter(d => d.filename !== filename));
            } else {
                const data = await res.json();
                alert(`Failed to delete: ${data.message}`);
            }
        } catch (err) {
            console.error("Delete Error:", err);
            alert("Error deleting document.");
        }
    };

    const toggleSOPAccess = async (doc, columnRole) => {
        let newLevel = doc.accessLevel;

        if (columnRole === 'employee') {
            if (doc.access.employee) {
                // Revoke employee -> Access becomes Manager+
                newLevel = 'manager';
            } else {
                // Grant employee -> Access becomes Employee+
                newLevel = 'employee';
            }
        } else if (columnRole === 'manager') {
            if (doc.access.manager) {
                // Revoke manager -> Access becomes Admin Only
                newLevel = 'admin';
            } else {
                // Grant manager -> Access becomes Manager+
                newLevel = 'manager';
            }
        } else if (columnRole === 'admin') {
            return; // Admin always has access
        }

        if (newLevel === doc.accessLevel) return;

        // Optimistic Update
        const accessConfig = {
            employee: newLevel === 'employee',
            manager: newLevel === 'employee' || newLevel === 'manager',
            admin: true
        };

        setSopDocuments(prev => prev.map(d =>
            d.filename === doc.filename
                ? { ...d, access: accessConfig, accessLevel: newLevel }
                : d
        ));

        // API Call
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/admin/documents/${encodeURIComponent(doc.filename)}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ accessLevel: newLevel })
            });
        } catch (e) {
            console.error("Update failed", e);
            // Revert state if needed (omitted for brevity)
        }
    };

    const handleLogout = () => {
        setView('chat');
        window.history.pushState({}, '', '/');
    };

    const getCategoryColor = (category) => {
        const colors = {
            'HR': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
            'Finance': 'bg-green-500/10 text-green-400 border-green-500/20',
            'IT': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'Legal': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            'Operations': 'bg-purple-500/10 text-purple-400 border-purple-500/20'
        };
        return colors[category] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-12 relative">
            {/* Top Bar with Logout */}
            <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center bg-[#121212] p-4 rounded-xl border border-white/5 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Shield size={20} /></div>
                    <h1 className="text-xl font-bold tracking-tight">System Admin</h1>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all font-bold text-sm uppercase tracking-wider"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>

            <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid gap-6">
                    {/* User Management */}
                    <section className={`rounded-xl border ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-[#121212] border-white/5'} overflow-hidden shadow-2xl`}>
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl shadow-inner"><Users size={24} /></div>
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight">User Management</h3>
                                    <p className="text-sm text-zinc-500 font-medium">Control user roles and access</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddUserModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-all font-bold text-sm uppercase tracking-wider shadow-lg"
                            >
                                <Plus size={18} />
                                Add User
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className={`border-b ${theme === 'light' ? 'bg-zinc-50 text-zinc-500' : 'bg-[#1a1a1a] text-zinc-400'}`}>
                                        <th className="py-3 px-6 font-bold uppercase tracking-wider text-[11px]">User</th>
                                        <th className="py-3 px-6 font-bold uppercase tracking-wider text-[11px]">Email</th>
                                        <th className="py-3 px-6 font-bold uppercase tracking-wider text-[11px]">Role</th>
                                        <th className="py-3 px-6 font-bold uppercase tracking-wider text-[11px] text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${theme === 'light' ? 'divide-zinc-100' : 'divide-white/5'}`}>
                                    {usersList.map((user) => (
                                        <tr key={user.id} className={`group transition-colors ${theme === 'light' ? 'hover:bg-zinc-50' : 'hover:bg-white/[0.02]'}`}>
                                            <td className="py-5 px-6 font-bold text-base transition-colors group-hover:text-blue-400">{user.name}</td>
                                            <td className="py-5 px-6 text-zinc-500 font-medium">{user.email}</td>
                                            <td className="py-5 px-6">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-[0.1em] shadow-sm ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                    user.role === 'manager' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                        'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6 text-right">
                                                <CustomDropdown
                                                    theme={theme}
                                                    value={user.role}
                                                    onChange={(newRole) => {
                                                        setUsersList(usersList.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                                                    }}
                                                    options={[
                                                        { value: 'admin', label: 'Admin' },
                                                        { value: 'manager', label: 'Manager' },
                                                        { value: 'user', label: 'User' }
                                                    ]}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Models Section ... */}
                    <section className={`rounded-xl border ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-[#121212] border-white/5'} overflow-hidden shadow-2xl`}>
                        <div className="p-6 border-b border-white/5"><div className="flex items-center gap-4"><div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl shadow-inner"><Cpu size={24} /></div><div><h3 className="text-xl font-bold tracking-tight">AI Model Permissions</h3><p className="text-sm text-zinc-500 font-medium">Restrict model usage by role</p></div></div></div>
                        <div className={`divide-y ${theme === 'light' ? 'divide-zinc-100' : 'divide-white/5'}`}>{modelsList.map(model => (<div key={model.id} className={`flex items-center justify-between p-6 transition-colors ${theme === 'light' ? 'hover:bg-zinc-50' : 'hover:bg-white/[0.02]'}`}><div className="flex items-center gap-5"><div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shadow-inner"><Database size={20} /></div><div><div className="font-bold text-lg leading-tight mb-1">{model.name}</div><div className="text-[10px] text-zinc-500 flex gap-3 font-bold uppercase tracking-[0.15em]">{model.access.map(r => (<span key={r} className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-zinc-600"></div>{r}</span>))}</div></div></div><div className="flex items-center gap-1.5 p-1 bg-black/20 rounded-lg border border-white/5">{['admin', 'manager', 'user'].map(role => (<button key={role} onClick={() => { const newAccess = model.access.includes(role) ? model.access.filter(r => r !== role) : [...model.access, role]; setModelsList(modelsList.map(m => m.id === model.id ? { ...m, access: newAccess } : m)); }} className={`px-4 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-md transition-all duration-300 ${model.access.includes(role) ? 'bg-white text-black shadow-lg scale-105' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>{role}</button>))}</div></div>))}</div>
                        <div className="px-6 py-4 bg-blue-500/5 border-t border-blue-500/10"><div className="flex items-start gap-3"><Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" /><p className="text-xs text-blue-400/80 leading-relaxed"><span className="font-semibold">Model permissions control AI capability.</span> Document access is enforced separately at the SOP level.</p></div></div>
                    </section>

                    {/* SOP Access Control */}
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

                    {/* Admin Tools ... same */}
                    <section className={`rounded-xl border ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-[#121212] border-white/5'} overflow-hidden shadow-2xl`}>
                        <div className="p-6 border-b border-white/5"><div className="flex items-center gap-4"><div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl shadow-inner"><Eye size={24} /></div><div><h3 className="text-xl font-bold tracking-tight">Admin Tools</h3><p className="text-sm text-zinc-500 font-medium">Advanced options for administrators</p></div></div></div>
                        <div className="p-6"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="p-2 bg-white/5 rounded-lg"><Eye size={18} className="text-cyan-400" /></div><div><div className="font-bold text-base">Explain Answer Sources</div><p className="text-xs text-zinc-500 mt-0.5">View which documents were used, page numbers, and access restrictions</p></div></div><button onClick={() => setExplainSourcesEnabled(!explainSourcesEnabled)} className={`relative w-14 h-7 rounded-full transition-all duration-300 ${explainSourcesEnabled ? 'bg-cyan-500' : 'bg-white/10'}`}><div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-300 ${explainSourcesEnabled ? 'left-8' : 'left-1'}`} /></button></div>{explainSourcesEnabled && (<div className="mt-4 p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/20"><p className="text-xs text-cyan-400/80"><span className="font-semibold">Audit Mode Enabled:</span> AI responses will now include detailed source information including document names, page numbers, sections used, and any documents that were excluded due to role-based access restrictions.</p></div>)}</div>
                    </section>
                </div>
            </div>

            {/* Modals... keep identical */}
            {showAddUserModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md p-8 rounded-2xl border bg-[#121212] border-white/10 shadow-2xl scale-100">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold tracking-tight">Add New User</h3>
                            <button onClick={() => setShowAddUserModal(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleAddUser} className="space-y-6">
                            <div><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2">Full Name</label><input autoFocus placeholder="e.g. Michael Scott" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="w-full px-4 py-4 rounded-xl bg-[#1a1a1a] border border-white/5 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold placeholder:text-zinc-700 placeholder:font-medium" /></div>
                            <div><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2">Email Address</label><input placeholder="e.g. michael@dundermifflin.com" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full px-4 py-4 rounded-xl bg-[#1a1a1a] border border-white/5 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold placeholder:text-zinc-700 placeholder:font-medium" /></div>
                            <div><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2">Assign Role</label><div className="grid grid-cols-3 gap-2 p-1 bg-[#1a1a1a] rounded-xl border border-white/5">{['admin', 'manager', 'user'].map((r) => (<button key={r} type="button" onClick={() => setNewUser({ ...newUser, role: r })} className={`py-3 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${newUser.role === r ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>{r}</button>))}</div></div>
                            <button type="submit" className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.98] mt-4">Register User</button>
                        </form>
                    </div>
                </div>
            )}

            {showUploadSOPModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-lg p-8 rounded-2xl border bg-[#121212] border-white/10 shadow-2xl scale-100">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold tracking-tight">Upload SOP Document</h3>
                            <button onClick={() => setShowUploadSOPModal(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleUploadSOP} className="space-y-5">
                            <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${selectedFile ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="application/pdf" />
                                {selectedFile ? (<div className="flex items-center justify-center gap-2 text-amber-500"><FileText size={24} /><span className="font-bold text-sm truncate max-w-[200px]">{selectedFile.name}</span><button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="p-1 hover:bg-amber-500/20 rounded-full"><X size={14} /></button></div>) : (<div className="text-zinc-500 flex flex-col items-center gap-2"><div className="p-3 bg-white/5 rounded-full"><Upload size={20} /></div><div className="text-xs font-bold uppercase tracking-wider">Click to select PDF</div></div>)}
                            </div>
                            <div><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2 flex items-center gap-2"><FileText size={12} />Document Name</label><input autoFocus placeholder="e.g. Employee Leave Policy.pdf" value={newSOP.name} onChange={(e) => setNewSOP({ ...newSOP, name: e.target.value })} className="w-full px-4 py-4 rounded-xl bg-[#1a1a1a] border border-white/5 text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-bold placeholder:text-zinc-700 placeholder:font-medium" /></div>
                            <div><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2 flex items-center gap-2"><Tag size={12} />SOP Category</label><div className="grid grid-cols-5 gap-2 p-1 bg-[#1a1a1a] rounded-xl border border-white/5">{['HR', 'Finance', 'IT', 'Legal', 'Operations'].map((cat) => (<button key={cat} type="button" onClick={() => setNewSOP({ ...newSOP, category: cat })} className={`py-2.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${newSOP.category === cat ? 'bg-amber-500 text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>{cat}</button>))}</div></div>
                            <div><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2 flex items-center gap-2"><Shield size={12} />Access Level</label><div className="grid grid-cols-3 gap-2 p-1 bg-[#1a1a1a] rounded-xl border border-white/5">{[{ value: 'employee', label: 'All Roles', desc: 'Employee+' }, { value: 'manager', label: 'Manager+', desc: 'Manager & Admin' }, { value: 'admin', label: 'Admin Only', desc: 'Restricted' }].map((level) => (<button key={level.value} type="button" onClick={() => setNewSOP({ ...newSOP, accessLevel: level.value })} className={`py-3 text-center rounded-lg transition-all ${newSOP.accessLevel === level.value ? 'bg-amber-500 text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}><div className="text-[10px] font-black uppercase tracking-wider">{level.label}</div><div className={`text-[8px] mt-0.5 ${newSOP.accessLevel === level.value ? 'text-black/60' : 'text-zinc-600'}`}>{level.desc}</div></button>))}</div></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2 flex items-center gap-2"><Layers size={12} />Version</label><input placeholder="e.g. 1.0" value={newSOP.version} onChange={(e) => setNewSOP({ ...newSOP, version: e.target.value })} className="w-full px-4 py-4 rounded-xl bg-[#1a1a1a] border border-white/5 text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-bold placeholder:text-zinc-700 placeholder:font-medium" /></div>
                                <div><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2 flex items-center gap-2"><Calendar size={12} />Effective Date</label><input type="date" value={newSOP.effectiveDate} onChange={(e) => setNewSOP({ ...newSOP, effectiveDate: e.target.value })} className="w-full px-4 py-4 rounded-xl bg-[#1a1a1a] border border-white/5 text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-bold" /></div>
                            </div>
                            <button type="submit" disabled={uploading || !selectedFile} className={`w-full py-4 font-black uppercase tracking-widest rounded-xl transition-all shadow-xl active:scale-[0.98] mt-2 ${uploading || !selectedFile ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-amber-500 text-black hover:bg-amber-400'}`}>{uploading ? 'Uploading...' : 'Upload Document'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;

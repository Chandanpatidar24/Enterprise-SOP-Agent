
import React, { useState, useRef, useEffect } from 'react';
import { Users, Cpu, Database, LogOut, Plus, X, Shield, FileText, Info, Eye, Calendar, Tag, Layers, ChevronDown, Check, Upload, Trash2 } from 'lucide-react';
import UserTable from './components/UserTable';
import SopTable from './components/SopTable';
import CustomDropdown from './components/CustomDropdown';

// CustomDropdown removed from here and moved to separate file


const AdminPanel = ({ theme, modelsList, setModelsList, setView, token, onLogout }) => {
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showUploadSOPModal, setShowUploadSOPModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'employee', password: '', useManualPassword: false });
    const [explainSourcesEnabled, setExplainSourcesEnabled] = useState(false);

    // Users State - managed locally
    const [usersList, setUsersList] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    // SOP Documents State
    const [sopDocuments, setSopDocuments] = useState([]);

    // Fetch users on mount
    useEffect(() => {
        const fetchUsers = async () => {
            if (!token) return;
            setUsersLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setUsersList(data.users);
                }
            } catch (err) {
                console.error("Failed to fetch users:", err);
            } finally {
                setUsersLoading(false);
            }
        };
        fetchUsers();
    }, [token]);

    // Handle role change
    const handleRoleChange = async (userId, newRole) => {
        // Store old role for potential revert
        const oldUser = usersList.find(u => u.id === userId);
        const oldRole = oldUser?.role;

        // Optimistic update
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });
            const data = await res.json();

            if (data.success) {
                console.log("Role updated successfully:", data);
            } else {
                console.error("Failed to update role:", data.message);
                alert(`Failed to update role: ${data.message}`);
                // Revert on failure
                setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: oldRole } : u));
            }
        } catch (err) {
            console.error("Error updating role:", err);
            alert(`Error updating role: ${err.message}`);
            // Revert on error
            setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: oldRole } : u));
        }
    };

    // Handle organization type change
    const handleOrgTypeChange = async (userId, newOrgType) => {
        const oldUser = usersList.find(u => u.id === userId);
        const oldOrgType = oldUser?.orgType;

        // Optimistic update
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, orgType: newOrgType } : u));

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/org-type`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orgType: newOrgType })
            });
            const data = await res.json();

            if (data.success) {
                console.log("Org type updated successfully:", data);
            } else {
                console.error("Failed to update org type:", data.message);
                alert(`Failed to update organization type: ${data.message}`);
                setUsersList(prev => prev.map(u => u.id === userId ? { ...u, orgType: oldOrgType } : u));
            }
        } catch (err) {
            console.error("Error updating org type:", err);
            alert(`Error updating organization type: ${err.message}`);
            setUsersList(prev => prev.map(u => u.id === userId ? { ...u, orgType: oldOrgType } : u));
        }
    };

    // Handle delete user
    const handleDeleteUser = async (userId, userName) => {
        if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();

            if (data.success) {
                // Remove user from list
                setUsersList(prev => prev.filter(u => u.id !== userId));
                alert(data.message);
            } else {
                alert(`Failed to delete user: ${data.message}`);
            }
        } catch (err) {
            console.error("Error deleting user:", err);
            alert(`Error deleting user: ${err.message}`);
        }
    };

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
    const [addingUser, setAddingUser] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState(null);

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!newUser.email) {
            alert('Email is required');
            return;
        }

        setAddingUser(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    password: newUser.useManualPassword ? newUser.password : undefined
                })
            });
            const data = await res.json();

            if (data.success) {
                // Add user to list
                setUsersList(prev => [data.user, ...prev]);

                // Show Success Modal instead of Alert
                setCreatedCredentials({
                    email: data.user.email,
                    password: data.tempPassword
                });

                setNewUser({ name: '', email: '', role: 'employee', password: '', useManualPassword: false });
                setShowAddUserModal(false);
            } else {
                alert(data.message || 'Failed to create user');
            }
        } catch (err) {
            console.error('Create user error:', err);
            alert('Failed to create user');
        } finally {
            setAddingUser(false);
        }
    };

    const [uploading, setUploading] = useState(false);

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
            formData.append('pdf', selectedFile);
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
        if (onLogout) onLogout();
        setView('landing');
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
            {/* Top Bar with Exit */}
            <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center bg-[#121212] p-4 rounded-xl border border-white/5 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Shield size={20} /></div>
                    <h1 className="text-xl font-bold tracking-tight">System Admin</h1>
                </div>
                <button
                    onClick={() => setView('chat')}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 text-zinc-300 rounded-lg hover:bg-white/20 hover:text-white transition-all font-bold text-sm uppercase tracking-wider"
                >
                    <LogOut size={18} />
                    Exit
                </button>
            </div>

            <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid gap-6">
                    {/* User Management */}
                    <UserTable
                        theme={theme}
                        usersList={usersList}
                        usersLoading={usersLoading}
                        handleOrgTypeChange={handleOrgTypeChange}
                        handleRoleChange={handleRoleChange}
                        handleDeleteUser={handleDeleteUser}
                        setShowAddUserModal={setShowAddUserModal}
                    />


                    {/* Models Section ... */}
                    <section className={`rounded-xl border ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-[#121212] border-white/5'} overflow-hidden shadow-2xl`}>
                        <div className="p-6 border-b border-white/5"><div className="flex items-center gap-4"><div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl shadow-inner"><Cpu size={24} /></div><div><h3 className="text-xl font-bold tracking-tight">AI Model Permissions</h3><p className="text-sm text-zinc-500 font-medium">Restrict model usage by role</p></div></div></div>
                        <div className={`divide-y ${theme === 'light' ? 'divide-zinc-100' : 'divide-white/5'}`}>{modelsList.map(model => (<div key={model.id} className={`flex items-center justify-between p-6 transition-colors ${theme === 'light' ? 'hover:bg-zinc-50' : 'hover:bg-white/[0.02]'}`}><div className="flex items-center gap-5"><div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shadow-inner"><Database size={20} /></div><div><div className="font-bold text-lg leading-tight mb-1">{model.name}</div><div className="text-[10px] text-zinc-500 flex gap-3 font-bold uppercase tracking-[0.15em]">{model.access.map(r => (<span key={r} className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-zinc-600"></div>{r}</span>))}</div></div></div><div className="flex items-center gap-1.5 p-1 bg-black/20 rounded-lg border border-white/5">{['admin', 'manager', 'user'].map(role => (<button key={role} onClick={() => { const newAccess = model.access.includes(role) ? model.access.filter(r => r !== role) : [...model.access, role]; setModelsList(modelsList.map(m => m.id === model.id ? { ...m, access: newAccess } : m)); }} className={`px-4 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-md transition-all duration-300 ${model.access.includes(role) ? 'bg-white text-black shadow-lg scale-105' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>{role}</button>))}</div></div>))}</div>
                        <div className="px-6 py-4 bg-blue-500/5 border-t border-blue-500/10"><div className="flex items-start gap-3"><Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" /><p className="text-xs text-blue-400/80 leading-relaxed"><span className="font-semibold">Model permissions control AI capability.</span> Document access is enforced separately at the SOP level.</p></div></div>
                    </section>

                    {/* SOP Access Control */}
                    <SopTable
                        theme={theme}
                        sopDocuments={sopDocuments}
                        toggleSOPAccess={toggleSOPAccess}
                        handleDeleteSOP={handleDeleteSOP}
                        setShowUploadSOPModal={setShowUploadSOPModal}
                        getCategoryColor={getCategoryColor}
                    />


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
                            <div><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2">Assign Role</label><div className="grid grid-cols-3 gap-2 p-1 bg-[#1a1a1a] rounded-xl border border-white/5">{['admin', 'manager', 'employee'].map((r) => (<button key={r} type="button" onClick={() => setNewUser({ ...newUser, role: r })} className={`py-3 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${newUser.role === r ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>{r}</button>))}</div></div>

                            <div className="pt-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={newUser.useManualPassword}
                                            onChange={(e) => setNewUser({ ...newUser, useManualPassword: e.target.checked })}
                                        />
                                        <div className={`w-10 h-5 rounded-full transition-colors ${newUser.useManualPassword ? 'bg-blue-500' : 'bg-white/10'}`}></div>
                                        <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${newUser.useManualPassword ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                    <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors uppercase tracking-widest">Set Password Manually</span>
                                </label>
                            </div>

                            {newUser.useManualPassword && (
                                <div className="animate-in slide-in-from-top-2 duration-200">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2">Manual Password</label>
                                    <input
                                        type="text"
                                        placeholder="Min. 8 characters"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full px-4 py-4 rounded-xl bg-[#1a1a1a] border border-white/5 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold placeholder:text-zinc-700 placeholder:font-medium"
                                    />
                                    <p className="text-[10px] text-zinc-600 mt-2 italic font-medium">Leave blank for auto-generation</p>
                                </div>
                            )}

                            <button type="submit" disabled={addingUser} className={`w-full py-4 font-black uppercase tracking-widest rounded-xl transition-all shadow-xl active:scale-[0.98] mt-4 ${addingUser ? 'bg-zinc-700 text-zinc-400 cursor-wait' : 'bg-white text-black hover:bg-zinc-200'}`}>{addingUser ? 'Creating...' : 'Register User'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Modal for New User */}
            {createdCredentials && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md p-8 rounded-2xl border bg-[#121212] border-white/10 shadow-2xl scale-100">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={32} />
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight text-white">User Created!</h3>
                            <p className="text-zinc-400 mt-2">Share these credentials with the user.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-1">Email</label>
                                <div className="text-white font-mono">{createdCredentials.email}</div>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-1">Temporary Password</label>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="text-emerald-400 font-mono text-lg font-bold tracking-wider">{createdCredentials.password}</div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(createdCredentials.password);
                                            alert('Password copied to clipboard!');
                                        }}
                                        className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                        title="Copy Password"
                                    >
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase">
                                            <span>Copy</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={() => setCreatedCredentials(null)}
                                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.98]"
                            >
                                Done
                            </button>
                        </div>
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

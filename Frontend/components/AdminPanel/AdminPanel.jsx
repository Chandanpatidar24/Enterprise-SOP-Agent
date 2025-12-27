
import React from 'react';
import { Users, Cpu, Database, LogOut } from 'lucide-react';
import CustomDropdown from '../CustomDropdown';

const AdminPanel = ({ theme, usersList, setUsersList, modelsList, setModelsList, setView }) => {
    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-12 md:pt-32 pt-24">
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 border-b border-white/10 pb-6 flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
                        <p className="text-zinc-500">Manage users, roles, and AI model permissions.</p>
                    </div>
                    <button
                        onClick={() => setView('settings')}
                        className={`p-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${theme === 'light' ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200' : 'bg-white/10 text-zinc-300 hover:bg-white/20'}`}
                        title="Log Out"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Log Out</span>
                    </button>
                </div>

                <div className="grid gap-8">
                    {/* User Management */}
                    <section className={`p - 6 rounded - xl border ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-[#171717] border-white/5'} `}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Users size={20} /></div>
                            <div>
                                <h3 className="text-lg font-semibold">User Management</h3>
                                <p className="text-sm text-zinc-500">Control user roles and access</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className={`border - b ${theme === 'light' ? 'border-zinc-100' : 'border-white/5'} `}>
                                    <tr>
                                        <th className="pb-3 pl-2 font-medium text-zinc-500">User</th>
                                        <th className="pb-3 font-medium text-zinc-500">Email</th>
                                        <th className="pb-3 font-medium text-zinc-500">Role</th>
                                        <th className="pb-3 pr-2 font-medium text-zinc-500 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {usersList.map(user => (
                                        <tr key={user.id} className="group">
                                            <td className="py-3 pl-2 font-medium">{user.name}</td>
                                            <td className="py-3 text-zinc-500">{user.email}</td>
                                            <td className="py-3">
                                                <span className={`inline - flex items - center px - 2 py - 1 rounded - md text - xs font - medium ring - 1 ring - inset ${user.role === 'admin' ? 'bg-purple-400/10 text-purple-400 ring-purple-400/20' :
                                                    user.role === 'manager' ? 'bg-blue-400/10 text-blue-400 ring-blue-400/20' :
                                                        'bg-zinc-400/10 text-zinc-400 ring-zinc-400/20'
                                                    } `}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-2 text-right">
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

                    {/* AI Model Management */}
                    <section className={`p - 6 rounded - xl border ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-[#171717] border-white/5'} `}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><Cpu size={20} /></div>
                            <div>
                                <h3 className="text-lg font-semibold">AI Model Permissions</h3>
                                <p className="text-sm text-zinc-500">Restrict model usage by role</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {modelsList.map(model => (
                                <div key={model.id} className={`flex items - center justify - between p - 4 rounded - lg border ${theme === 'light' ? 'bg-zinc-50 border-zinc-100' : 'bg-zinc-900/50 border-white/5'} `}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-400/20 flex items-center justify-center text-emerald-400">
                                            <Database size={16} />
                                        </div>
                                        <div>
                                            <div className="font-medium">{model.name}</div>
                                            <div className="text-xs text-zinc-500 flex gap-2 mt-1">
                                                {model.access.map(r => (
                                                    <span key={r} className="uppercase">{r}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {['admin', 'manager', 'user'].map(role => (
                                            <button
                                                key={role}
                                                onClick={() => {
                                                    const newAccess = model.access.includes(role)
                                                        ? model.access.filter(r => r !== role)
                                                        : [...model.access, role];
                                                    setModelsList(modelsList.map(m => m.id === model.id ? { ...m, access: newAccess } : m));
                                                }}
                                                className={`px - 3 py - 1 text - xs rounded - md border transition - colors ${model.access.includes(role)
                                                    ? (theme === 'light' ? 'bg-black text-white border-black' : 'bg-white text-black border-white')
                                                    : (theme === 'light' ? 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300' : 'bg-transparent text-zinc-500 border-zinc-700 hover:border-zinc-500')
                                                    } `}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;

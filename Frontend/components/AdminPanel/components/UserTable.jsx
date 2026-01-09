import React from 'react';
import { Users, Trash2, Plus } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

const UserTable = ({
    theme,
    usersList,
    usersLoading,
    handleOrgTypeChange,
    handleRoleChange,
    handleDeleteUser,
    setShowAddUserModal
}) => {
    return (
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
                            <th className="py-3 px-6 font-bold uppercase tracking-wider text-[11px]">Organization</th>
                            <th className="py-3 px-6 font-bold uppercase tracking-wider text-[11px]">Action</th>
                            <th className="py-3 px-6 font-bold uppercase tracking-wider text-[11px] text-right">Delete</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'light' ? 'divide-zinc-100' : 'divide-white/5'}`}>
                        {usersLoading ? (
                            <tr>
                                <td colSpan="6" className="py-8 text-center text-zinc-500">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                                        Loading users...
                                    </div>
                                </td>
                            </tr>
                        ) : usersList.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-8 text-center text-zinc-500">
                                    No users found in your organization.
                                </td>
                            </tr>
                        ) : usersList.map((user) => (
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
                                <td className="py-5 px-6">
                                    <CustomDropdown
                                        theme={theme}
                                        value={user.orgType || 'personal'}
                                        onChange={(newType) => handleOrgTypeChange(user.id, newType)}
                                        options={[
                                            { value: 'personal', label: 'Personal' },
                                            { value: 'enterprise', label: 'Enterprise' }
                                        ]}
                                    />
                                </td>
                                <td className="py-5 px-6">
                                    <CustomDropdown
                                        theme={theme}
                                        value={user.role}
                                        onChange={(newRole) => handleRoleChange(user.id, newRole)}
                                        options={[
                                            { value: 'admin', label: 'Admin' },
                                            { value: 'manager', label: 'Manager' },
                                            { value: 'employee', label: 'Employee' }
                                        ]}
                                    />
                                </td>
                                <td className="py-5 px-6 text-right">
                                    <button
                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                        className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                                        title="Delete User"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default UserTable;

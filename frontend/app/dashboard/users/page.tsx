'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, usersAPI } from '@/lib/api';

const ROLE_OPTIONS = [
    { value: 'admin', label: 'Admin', color: 'bg-red-500/20 text-red-300 border border-red-500/40' },
    { value: 'dispatcher', label: 'Диспетчер', color: 'bg-blue-500/20 text-blue-300 border border-blue-500/40' },
    { value: 'viewer', label: 'Просмотр', color: 'bg-slate-500/20 text-slate-300 border border-slate-500/40' },
];

function getRoleStyle(role: string) {
    return ROLE_OPTIONS.find(r => r.value === role)?.color || 'bg-slate-500/20 text-slate-300 border border-slate-500/40';
}

function getRoleLabel(role: string) {
    return ROLE_OPTIONS.find(r => r.value === role)?.label || role;
}

interface User {
    id: number;
    username: string;
    role: string;
}

export default function UsersPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Create form state
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('viewer');
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // Edit form state
    const [editRole, setEditRole] = useState('');
    const [editPassword, setEditPassword] = useState('');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await authAPI.checkAuth();
            if (!response.data.authenticated) {
                router.push('/login');
                return;
            }
            if (response.data.user.role !== 'admin') {
                router.push('/dashboard');
                return;
            }
            setCurrentUser(response.data.user);
            loadUsers();
        } catch {
            router.push('/login');
        }
    };

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await usersAPI.getAll();
            setUsers(res.data);
        } catch (e) {
            console.error('Ошибка загрузки пользователей:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormLoading(true);
        try {
            await usersAPI.create({ username: newUsername, password: newPassword, role: newRole });
            setNewUsername('');
            setNewPassword('');
            setNewRole('viewer');
            setShowCreateForm(false);
            await loadUsers();
        } catch (err: any) {
            setFormError(err.response?.data?.error || 'Ошибка создания пользователя');
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setFormError('');
        setFormLoading(true);
        try {
            const payload: { role?: string; password?: string } = { role: editRole };
            if (editPassword.trim()) payload.password = editPassword;
            await usersAPI.update(editingUser.id, payload);
            setEditingUser(null);
            setEditPassword('');
            await loadUsers();
        } catch (err: any) {
            setFormError(err.response?.data?.error || 'Ошибка обновления пользователя');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteUser = async (user: User) => {
        if (!confirm(`Удалить пользователя «${user.username}»?`)) return;
        try {
            await usersAPI.delete(user.id);
            await loadUsers();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Ошибка удаления пользователя');
        }
    };

    const openEdit = (user: User) => {
        setEditingUser(user);
        setEditRole(user.role);
        setEditPassword('');
        setFormError('');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            ← Назад
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Пользователи</h1>
                            <p className="text-sm text-slate-400">Управление учётными записями</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-slate-300 text-sm">{currentUser?.username}</span>
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-500/20 text-red-300 border border-red-500/40">
                            Admin
                        </span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-3xl">
                {/* Action bar */}
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Список пользователей ({users.length})</h2>
                    <button
                        onClick={() => { setShowCreateForm(true); setFormError(''); }}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg"
                    >
                        + Добавить пользователя
                    </button>
                </div>

                {/* Users list */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg overflow-hidden shadow-xl mb-6">
                    <table className="w-full">
                        <thead className="bg-slate-900/50">
                            <tr className="text-left text-sm text-slate-300">
                                <th className="px-5 py-3 font-medium">Логин</th>
                                <th className="px-5 py-3 font-medium">Роль</th>
                                <th className="px-5 py-3 font-medium text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {users.map(user => (
                                <tr key={user.id} className="text-slate-200 hover:bg-slate-700/30 transition-colors">
                                    <td className="px-5 py-3 font-medium">
                                        {user.username}
                                        {user.id === currentUser?.id && (
                                            <span className="ml-2 text-xs text-slate-500">(вы)</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleStyle(user.role)}`}>
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => openEdit(user)}
                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                                            >
                                                Изменить
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user)}
                                                disabled={user.id === currentUser?.id}
                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Create user modal */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold text-gray-900 mb-5">Новый пользователь</h3>
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={e => setNewUsername(e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                                        placeholder="username"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
                                    <select
                                        value={newRole}
                                        onChange={e => setNewRole(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                                    >
                                        {ROLE_OPTIONS.map(r => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                </div>
                                {formError && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{formError}</div>
                                )}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="flex-1 px-4 py-2.5 bg-[#ff6c00] hover:bg-[#a64600] disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                                    >
                                        {formLoading ? 'Создание...' : 'Создать'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit user modal */}
                {editingUser && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Изменить пользователя</h3>
                            <p className="text-gray-500 text-sm mb-5">@{editingUser.username}</p>
                            <form onSubmit={handleEditUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
                                    <select
                                        value={editRole}
                                        onChange={e => setEditRole(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                                    >
                                        {ROLE_OPTIONS.map(r => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Новый пароль <span className="text-gray-400 font-normal">(необязательно)</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={editPassword}
                                        onChange={e => setEditPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                                        placeholder="Оставьте пустым, чтобы не менять"
                                    />
                                </div>
                                {formError && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{formError}</div>
                                )}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingUser(null)}
                                        className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="flex-1 px-4 py-2.5 bg-[#ff6c00] hover:bg-[#a64600] disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                                    >
                                        {formLoading ? 'Сохранение...' : 'Сохранить'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

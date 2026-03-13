'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, driversAPI, executorsAPI } from '@/lib/api';
import { Executor } from '@/lib/types';

export default function NewDriverPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [executors, setExecutors] = useState<Executor[]>([]);
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        executor_id: 0,
        full_name: '',
        phone: '',
        date_of_birth: '',
        license_series: '',
        license_number: '',
        license_issue_date: '',
        license_expiry_date: '',
        passport_series: '',
        passport_number: '',
        passport_issue_date: '',
        passport_issued_by: '',
        snils_number: '',
        tachograph_number: '',
        tachograph_issue_date: '',
        tachograph_expiry_date: '',
    });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await authAPI.checkAuth();
            if (response.data.authenticated) {
                setUser(response.data.user);
                loadData();
            } else {
                router.push('/login');
            }
        } catch (error) {
            router.push('/login');
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const executorsRes = await executorsAPI.getAll();
            setExecutors(executorsRes.data);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await driversAPI.create(formData);
            alert('Водитель добавлен');
            router.push('/dashboard/references');
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка сохранения');
        }
    };

    const handleCancel = () => {
        router.push('/dashboard/references');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-gray-900 text-xl">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-[#faf9f6]">
            {/* Header */}
            <header className="bg-[#fffef9] border-b border-gray-200 shadow-sm sticky top-0 z-10">
                <div className="px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleCancel}
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                ← Назад к справочникам
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2 bg-[#ff6c00] hover:bg-[#a64600] text-white rounded-lg transition-colors"
                            >
                                Добавить водителя
                            </button>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h1 className="text-3xl font-bold text-gray-900">Новый водитель</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Добавление нового водителя в систему
                        </p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-6xl mx-auto p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Основная информация</h2>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Исполнитель <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.executor_id}
                                    onChange={(e) => setFormData({ ...formData, executor_id: Number(e.target.value) })}
                                    className="w-full px-4 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent focus:outline-none"
                                >
                                    <option value={0}>Выберите исполнителя</option>
                                    {executors.map((executor) => (
                                        <option key={executor.id} value={executor.id}>
                                            {executor.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Полное имя <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Телефон <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Дата рождения
                                </label>
                                <input
                                    type="date"
                                    value={formData.date_of_birth}
                                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Driver's License */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Водительское удостоверение</h2>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Серия
                                </label>
                                <input
                                    type="text"
                                    value={formData.license_series}
                                    onChange={(e) => setFormData({ ...formData, license_series: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Номер
                                </label>
                                <input
                                    type="text"
                                    value={formData.license_number}
                                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Дата выдачи
                                </label>
                                <input
                                    type="date"
                                    value={formData.license_issue_date}
                                    onChange={(e) => setFormData({ ...formData, license_issue_date: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Дата окончания
                                </label>
                                <input
                                    type="date"
                                    value={formData.license_expiry_date}
                                    onChange={(e) => setFormData({ ...formData, license_expiry_date: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Passport */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Паспорт</h2>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Серия
                                </label>
                                <input
                                    type="text"
                                    value={formData.passport_series}
                                    onChange={(e) => setFormData({ ...formData, passport_series: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Номер
                                </label>
                                <input
                                    type="text"
                                    value={formData.passport_number}
                                    onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Дата выдачи
                                </label>
                                <input
                                    type="date"
                                    value={formData.passport_issue_date}
                                    onChange={(e) => setFormData({ ...formData, passport_issue_date: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent focus:outline-none"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Кем выдан
                                </label>
                                <input
                                    type="text"
                                    value={formData.passport_issued_by}
                                    onChange={(e) => setFormData({ ...formData, passport_issued_by: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SNILS */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">СНИЛС</h2>
                        </div>
                        <div className="p-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Номер
                                </label>
                                <input
                                    type="text"
                                    value={formData.snils_number}
                                    onChange={(e) => setFormData({ ...formData, snils_number: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent focus:outline-none"
                                    placeholder="123-456-789 00"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tachograph */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Тахограф</h2>
                        </div>
                        <div className="p-6 grid grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Номер
                                </label>
                                <input
                                    type="text"
                                    value={formData.tachograph_number}
                                    onChange={(e) => setFormData({ ...formData, tachograph_number: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Дата выдачи
                                </label>
                                <input
                                    type="date"
                                    value={formData.tachograph_issue_date}
                                    onChange={(e) => setFormData({ ...formData, tachograph_issue_date: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Дата окончания
                                </label>
                                <input
                                    type="date"
                                    value={formData.tachograph_expiry_date}
                                    onChange={(e) => setFormData({ ...formData, tachograph_expiry_date: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

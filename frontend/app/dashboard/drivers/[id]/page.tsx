'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authAPI, driversAPI, executorsAPI } from '@/lib/api';
import { Driver, Executor } from '@/lib/types';

export default function DriverDetailPage() {
    const router = useRouter();
    const params = useParams();
    const driverId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [driver, setDriver] = useState<Driver | null>(null);
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

    useEffect(() => {
        if (driver) {
            setFormData({
                executor_id: driver.executor_id || 0,
                full_name: driver.full_name || '',
                phone: driver.phone || '',
                date_of_birth: driver.date_of_birth || '',
                license_series: driver.license_series || '',
                license_number: driver.license_number || '',
                license_issue_date: driver.license_issue_date || '',
                license_expiry_date: driver.license_expiry_date || '',
                passport_series: driver.passport_series || '',
                passport_number: driver.passport_number || '',
                passport_issue_date: driver.passport_issue_date || '',
                passport_issued_by: driver.passport_issued_by || '',
                snils_number: driver.snils_number || '',
                tachograph_number: driver.tachograph_number || '',
                tachograph_issue_date: driver.tachograph_issue_date || '',
                tachograph_expiry_date: driver.tachograph_expiry_date || '',
            });
        }
    }, [driver]);

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
            const [driverRes, executorsRes] = await Promise.all([
                driversAPI.getById(Number(driverId)),
                executorsAPI.getAll(),
            ]);
            setDriver(driverRes.data);
            setExecutors(executorsRes.data);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            alert('Ошибка загрузки данных водителя');
            router.push('/dashboard/references');
        } finally {
            setLoading(false);
        }
    };

    const checkDocumentExpiry = (dateString?: string): boolean => {
        if (!dateString) return false;
        const today = new Date();
        const expiryDate = new Date(dateString);
        const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30;
    };

    const getExpiryWarning = (): string | null => {
        const warnings: string[] = [];

        if (checkDocumentExpiry(driver?.license_expiry_date)) {
            warnings.push('ВУ');
        }
        if (checkDocumentExpiry(driver?.tachograph_expiry_date)) {
            warnings.push('Тахограф');
        }

        return warnings.length > 0 ? warnings.join(', ') : null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await driversAPI.update(Number(driverId), formData);
            alert('Водитель обновлен');
            loadData();
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

    if (!driver) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-gray-900 text-xl">Водитель не найден</div>
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
                                Сохранить изменения
                            </button>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-900">{driver.full_name}</h1>
                            {getExpiryWarning() && (
                                <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full flex items-center gap-1">
                                    ⚠️ Истекает: {getExpiryWarning()}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            {driver.executor_name} • {driver.phone}
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
                                    {checkDocumentExpiry(formData.license_expiry_date) && (
                                        <span className="ml-2 text-red-500 text-xs">⚠️ Истекает</span>
                                    )}
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
                                    {checkDocumentExpiry(formData.tachograph_expiry_date) && (
                                        <span className="ml-2 text-red-500 text-xs">⚠️ Истекает</span>
                                    )}
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

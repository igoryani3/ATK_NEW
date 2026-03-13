'use client';

import { useState } from 'react';
import { Driver, Executor } from '@/lib/types';

interface DriverFormProps {
    driver?: Driver;
    executors: Executor[];
    onSubmit: (data: Partial<Driver>) => void;
    onCancel: () => void;
}

export default function DriverForm({ driver, executors, onSubmit, onCancel }: DriverFormProps) {
    const [formData, setFormData] = useState({
        executor_id: driver?.executor_id || 0,
        full_name: driver?.full_name || '',
        phone: driver?.phone || '',
        date_of_birth: driver?.date_of_birth || '',
        license_series: driver?.license_series || '',
        license_number: driver?.license_number || '',
        license_issue_date: driver?.license_issue_date || '',
        license_expiry_date: driver?.license_expiry_date || '',
        passport_series: driver?.passport_series || '',
        passport_number: driver?.passport_number || '',
        passport_issue_date: driver?.passport_issue_date || '',
        passport_issued_by: driver?.passport_issued_by || '',
        snils_number: driver?.snils_number || '',
        tachograph_number: driver?.tachograph_number || '',
        tachograph_issue_date: driver?.tachograph_issue_date || '',
        tachograph_expiry_date: driver?.tachograph_expiry_date || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl border border-gray-200 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
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

                    {/* Driver's License Section */}
                    <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Водительское удостоверение</h3>
                        <div className="grid grid-cols-2 gap-4">
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

                    {/* Passport Section */}
                    <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Паспорт</h3>
                        <div className="grid grid-cols-2 gap-4">
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

                    {/* SNILS Section */}
                    <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">СНИЛС</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Номер
                            </label>
                            <input
                                type="text"
                                value={formData.snils_number}
                                onChange={(e) => setFormData({ ...formData, snils_number: e.target.value })}
                                className="w-full px-4 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Tachograph Section */}
                    <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Тахограф</h3>
                        <div className="grid grid-cols-3 gap-4">
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

                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-[#ff6c00] hover:bg-[#a64600] text-white rounded-lg transition-colors"
                        >
                            {driver ? 'Сохранить' : 'Добавить'}
                        </button>
                    </div>
                </form>
        </div>
    );
}

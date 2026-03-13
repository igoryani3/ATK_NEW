'use client';

import { useState } from 'react';
import { Executor } from '@/lib/types';

interface ExecutorFormProps {
    executor?: Executor;
    onSubmit: (data: Partial<Executor>) => void;
    onCancel: () => void;
}

export default function ExecutorForm({ executor, onSubmit, onCancel }: ExecutorFormProps) {
    const [formData, setFormData] = useState({
        name: executor?.name || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {executor ? 'Редактировать исполнителя' : 'Добавить исполнителя'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Executor Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Название исполнителя <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent focus:outline-none"
                            placeholder="ИП Иванов Иван"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
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
                            {executor ? 'Сохранить' : 'Добавить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

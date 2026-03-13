'use client';

import { useState } from 'react';
import { Vehicle, Executor } from '@/lib/types';

interface VehicleFormProps {
    vehicle?: Vehicle;
    executors: Executor[];
    onSubmit: (data: Partial<Vehicle>) => void;
    onCancel: () => void;
}

export default function VehicleForm({ vehicle, executors, onSubmit, onCancel }: VehicleFormProps) {
    const [formData, setFormData] = useState({
        executor_id: vehicle?.executor_id || 0,
        license_plate: vehicle?.license_plate || '',
        capacity: vehicle?.capacity?.toString() || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            executor_id: formData.executor_id,
            license_plate: formData.license_plate,
            capacity: formData.capacity ? Number(formData.capacity) : undefined,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {vehicle ? 'Редактировать автомобиль' : 'Добавить автомобиль'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                            Гос. номер <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.license_plate}
                            onChange={(e) => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
                            className="w-full px-4 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 font-mono focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent focus:outline-none"
                            placeholder="А123БВ777"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Вместимость (пассажиров)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            className="w-full px-4 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent focus:outline-none"
                            placeholder="Например: 8"
                        />
                    </div>

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
                            {vehicle ? 'Сохранить' : 'Добавить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

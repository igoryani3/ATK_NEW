'use client';

import { useRouter } from 'next/navigation';

export default function Calculator() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#faf9f6] p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Калькулятор рейсов</h1>
                    <button
                        onClick={() => router.push('/dashboard/schedule')}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900"
                    >
                        ← Назад
                    </button>
                </div>

                <div className="bg-[#fffef9] rounded-lg shadow-sm p-12 text-center border border-gray-200">
                    <div className="text-6xl mb-4">🚧</div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Раздел в разработке
                    </h2>
                    <p className="text-gray-600">
                        Калькулятор рейсов скоро будет доступен
                    </p>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to schedule as default dashboard page
        router.replace('/dashboard/schedule');
    }, [router]);

    return (
        <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
            <div className="text-gray-600">Загрузка...</div>
        </div>
    );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard/schedule', label: 'Расписание', icon: '📅' },
        { href: '/dashboard/routes', label: 'Маршруты', icon: '🗺️' },
        { href: '/dashboard/references', label: 'Справочники', icon: '📚' },
        { href: '/dashboard/calculator', label: 'Калькулятор', icon: '🧮' },
        { href: '/dashboard/report', label: 'Отчет', icon: '📊' },
        { href: '/dashboard/sync', label: 'Синхронизация', icon: '🔄' },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname?.startsWith(href);
    };

    return (
        <div className="w-64 bg-[#fffef9] border-r border-gray-200 flex flex-col shadow-sm">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-[#00675c]">ATK Transit</h1>
                <p className="text-sm text-gray-600 mt-1">CRM System</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-lg
                            transition-all duration-200
                            ${isActive(item.href)
                                ? 'bg-[#00675c] text-white shadow-lg shadow-[#00675c]/30'
                                : 'text-gray-700 hover:bg-[#00675c]/10 hover:text-[#00675c]'
                            }
                        `}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 text-center">
                    © 2026 ATK Transit
                </div>
            </div>
        </div>
    );
}

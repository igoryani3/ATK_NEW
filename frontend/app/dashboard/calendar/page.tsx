'use client';

import { useEffect, useState } from 'react';
import { authAPI, tripsAPI, driversAPI, vehiclesAPI, customersAPI, executorsAPI, contractsAPI, regionsAPI, tripTypesAPI } from '@/lib/api';
import { Trip, Driver, Vehicle, Customer, Executor, Contract, Region, TripType } from '@/lib/types';
import { useRouter } from 'next/navigation';

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

export default function CalendarPage() {
    const router = useRouter();
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [monthSummary, setMonthSummary] = useState<Record<string, number>>({});
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [dayTrips, setDayTrips] = useState<Trip[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [executors, setExecutors] = useState<Executor[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
    const [user, setUser] = useState<any>(null);
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [highlightedDates, setHighlightedDates] = useState<Set<string>>(new Set());

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await authAPI.checkAuth();
            if (response.data.authenticated) {
                setUser(response.data.user);
                loadReferenceData();
            } else {
                router.push('/login');
            }
        } catch (error) {
            router.push('/login');
        }
    };

    const loadReferenceData = async () => {
        try {
            const [driversRes, vehiclesRes, customersRes, executorsRes, contractsRes] = await Promise.all([
                driversAPI.getAll(),
                vehiclesAPI.getAll(),
                customersAPI.getAll(),
                executorsAPI.getAll(),
                contractsAPI.getAll(),
            ]);

            setDrivers(driversRes.data);
            setVehicles(vehiclesRes.data);
            setCustomers(customersRes.data);
            setExecutors(executorsRes.data);
            setContracts(contractsRes.data);
        } catch (error) {
            console.error('Ошибка загрузки справочников:', error);
        }
    };

    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            try {
                const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
                const res = await tripsAPI.getMonthSummary(monthStr);
                setMonthSummary(res.data);
            } catch (e) {
                console.error('Failed to load month summary', e);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
        // Clear selection when month changes
        setSelectedTrip(null);
        setHighlightedDates(new Set());
    }, [year, month]);

    useEffect(() => {
        if (!selectedDate) {
            setDayTrips([]);
            return;
        }
        const fetchDay = async () => {
            setLoading(true);
            try {
                const res = await tripsAPI.getByDate(selectedDate);
                setDayTrips(res.data);
            } catch (e) {
                console.error('Failed to load trips for date', e);
            } finally {
                setLoading(false);
            }
        };
        fetchDay();
    }, [selectedDate]);

    const handleAddTrip = () => {
        setEditingTrip(null);
        setShowForm(true);
    };

    const handleEditTrip = (trip: Trip) => {
        setEditingTrip(trip);
        setSelectedDate(trip.trip_date || selectedDate);
        setShowForm(true);
    };

    const handleDeleteTrip = async (id: number) => {
        if (!confirm('Вы уверены, что хотите удалить этот рейс?')) return;

        try {
            await tripsAPI.delete(id);
            // Reload both summary and day trips
            const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
            const [summaryRes, dayRes] = await Promise.all([
                tripsAPI.getMonthSummary(monthStr),
                selectedDate ? tripsAPI.getByDate(selectedDate) : Promise.resolve({ data: [] })
            ]);
            setMonthSummary(summaryRes.data);
            setDayTrips(dayRes.data);
        } catch (error) {
            console.error('Ошибка удаления рейса:', error);
            alert('Ошибка удаления рейса');
        }
    };

    const handleFormSubmit = async () => {
        setShowForm(false);
        setEditingTrip(null);
        // Reload data
        const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
        const [summaryRes, dayRes] = await Promise.all([
            tripsAPI.getMonthSummary(monthStr),
            selectedDate ? tripsAPI.getByDate(selectedDate) : Promise.resolve({ data: [] })
        ]);
        setMonthSummary(summaryRes.data);
        setDayTrips(dayRes.data);
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingTrip(null);
    };

    const handleTripSelect = async (trip: Trip) => {
        if (selectedTrip?.id === trip.id) {
            // Deselect if clicking the same trip
            setSelectedTrip(null);
            setHighlightedDates(new Set());
            return;
        }

        setSelectedTrip(trip);

        // Find all trips with matching route characteristics
        try {
            const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
            const response = await tripsAPI.getMonthSummary(monthStr);

            // Get all trips for the month
            const allTripsResponse = await tripsAPI.getAll();
            const allTrips = allTripsResponse.data;

            // Filter trips that match the selected trip's route
            const matchingDates = new Set<string>();
            allTrips.forEach((t: Trip) => {
                if (
                    t.route_start === trip.route_start &&
                    t.route_end === trip.route_end &&
                    t.dispatch_time === trip.dispatch_time &&
                    t.trip_date
                ) {
                    const tripDate = new Date(t.trip_date);
                    if (tripDate.getFullYear() === year && tripDate.getMonth() === month) {
                        matchingDates.add(t.trip_date);
                    }
                }
            });

            setHighlightedDates(matchingDates);
        } catch (error) {
            console.error('Ошибка поиска совпадающих рейсов:', error);
        }
    };

    const daysInMonth = getDaysInMonth(year, month);
    const firstDayWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

    const handlePrevMonth = () => {
        if (month === 0) {
            setYear(year - 1);
            setMonth(11);
        } else {
            setMonth(month - 1);
        }
    };

    const handleNextMonth = () => {
        if (month === 11) {
            setYear(year + 1);
            setMonth(0);
        } else {
            setMonth(month + 1);
        }
    };

    const canEdit = user?.role === 'admin' || user?.role === 'dispatcher';

    return (
        <div className="min-h-screen bg-[#faf9f6] p-6 text-gray-900">
            <h1 className="text-3xl font-bold mb-4">Календарь рейсов</h1>
            <div className="flex items-center justify-center mb-4 space-x-4">
                <button onClick={handlePrevMonth} className="px-3 py-1 bg-[#fffef9] hover:bg-[#faf9f6] border border-gray-200 rounded shadow-sm">
                    ← Пред.
                </button>
                <span className="text-xl font-medium">
                    {new Date(year, month).toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={handleNextMonth} className="px-3 py-1 bg-[#fffef9] hover:bg-[#faf9f6] border border-gray-200 rounded shadow-sm">
                    След. →
                </button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
                    <div key={d} className="font-semibold text-gray-700">{d}</div>
                ))}
                {Array.from({ length: firstDayWeekday }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const count = monthSummary[dateStr] ?? 0;
                    const isToday = dateStr === today.toISOString().slice(0, 10);
                    const isSelected = dateStr === selectedDate;
                    const isHighlighted = highlightedDates.has(dateStr);

                    let className = 'p-2 rounded transition-colors ';
                    if (isSelected) {
                        className += 'bg-[#00675c] hover:bg-[#004d45] text-white shadow-md';
                    } else if (isHighlighted) {
                        className += 'bg-purple-100 hover:bg-purple-200 ring-2 ring-purple-300';
                    } else if (isToday) {
                        className += 'bg-[#fffef9] outline outline-2 outline-[#00675c] outline-offset-2 hover:bg-[#faf9f6] border border-gray-200';
                    } else {
                        className += 'bg-[#fffef9] hover:bg-[#faf9f6] border border-gray-200';
                    }

                    return (
                        <button
                            key={dateStr}
                            onClick={() => setSelectedDate(dateStr)}
                            className={className}
                        >
                            <div className="flex justify-between items-center">
                                <span>{day}</span>
                                {count > 0 && (
                                    <span className="text-xs bg-green-600 rounded-full px-1">{count}</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
            {selectedDate && (
                <div className="mt-6">
                    <div className="mb-4 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Рейсы на {selectedDate} ({dayTrips.length})
                        </h2>
                        {canEdit && (
                            <button
                                onClick={handleAddTrip}
                                className="px-6 py-3 bg-[#ff6c00] hover:bg-[#a64600] text-white rounded-lg font-medium transition-colors shadow-lg"
                            >
                                + Добавить рейс
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="bg-[#fffef9] border border-gray-200 rounded-lg p-8 text-center text-gray-600 shadow-sm">
                            Загрузка...
                        </div>
                    ) : (
                        <div className="bg-[#fffef9] border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#faf9f6]">
                                        <tr className="text-left text-sm text-gray-700">
                                            <th className="px-4 py-3 font-medium">Название</th>
                                            <th className="px-4 py-3 font-medium">Начало</th>
                                            <th className="px-4 py-3 font-medium">Конец</th>
                                            <th className="px-4 py-3 font-medium">Подача</th>
                                            <th className="px-4 py-3 font-medium">Цена</th>
                                            {canEdit && <th className="px-4 py-3 font-medium">Действия</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {dayTrips.length === 0 ? (
                                            <tr>
                                                <td colSpan={canEdit ? 6 : 5} className="px-4 py-8 text-center text-gray-500">
                                                    Нет рейсов в этот день. {canEdit ? 'Добавьте первый рейс.' : ''}
                                                </td>
                                            </tr>
                                        ) : (
                                            dayTrips.map((trip) => (
                                                <tr
                                                    key={trip.id}
                                                    onClick={() => handleTripSelect(trip)}
                                                    className={`text-gray-700 transition-colors cursor-pointer ${
                                                        selectedTrip?.id === trip.id
                                                            ? 'bg-purple-50 hover:bg-purple-100'
                                                            : 'hover:bg-[#faf9f6]'
                                                    }`}
                                                >
                                                    <td className="px-4 py-3">{trip.route_start || '-'}</td>
                                                    <td className="px-4 py-3">{trip.route_end || '-'}</td>
                                                    <td className="px-4 py-3">{trip.dispatch_time || '-'}</td>
                                                    <td className="px-4 py-3">{trip.price_no_vat ? `${trip.price_no_vat} ₽` : '-'}</td>
                                                    {canEdit && (
                                                        <td className="px-4 py-3">
                                                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    onClick={() => handleEditTrip(trip)}
                                                                    className="px-3 py-1 bg-[#00675c] hover:bg-[#004d45] text-white text-sm rounded transition-colors"
                                                                >
                                                                    Изменить
                                                                </button>
                                                                <button
                                                                    onClick={() => trip.id && handleDeleteTrip(trip.id)}
                                                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                                                                >
                                                                    Удалить
                                                                </button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Trip Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingTrip ? 'Редактировать рейс' : 'Добавить рейс'}
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Форма редактирования рейсов будет реализована позже
                        </p>
                        <button
                            onClick={handleFormCancel}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

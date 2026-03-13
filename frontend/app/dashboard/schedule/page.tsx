'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import { authAPI, tripsAPI, contractsAPI, customersAPI, regionsAPI, tripTypesAPI, executorsAPI, driversAPI, vehiclesAPI } from '@/lib/api';
import { Trip, Contract, Customer, Region, TripType, Executor, Driver, Vehicle } from '@/lib/types';

export default function SchedulePage() {
    const router = useRouter();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [user, setUser] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

    // Reference data
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [tripTypes, setTripTypes] = useState<TripType[]>([]);
    const [executors, setExecutors] = useState<Executor[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [tripsRes, contractsRes, customersRes, regionsRes, tripTypesRes, executorsRes, driversRes, vehiclesRes] = await Promise.all([
                tripsAPI.getAll(),
                contractsAPI.getAll(),
                customersAPI.getAll(),
                regionsAPI.getAll(),
                tripTypesAPI.getAll(),
                executorsAPI.getAll(),
                driversAPI.getAll(),
                vehiclesAPI.getAll(),
            ]);
            setTrips(tripsRes.data);
            setContracts(contractsRes.data);
            setCustomers(customersRes.data);
            setRegions(regionsRes.data);
            setTripTypes(tripTypesRes.data);
            setExecutors(executorsRes.data);
            setDrivers(driversRes.data);
            setVehicles(vehiclesRes.data);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkAuth = useCallback(async () => {
        try {
            const response = await authAPI.checkAuth();
            if (response.data.authenticated) {
                setUser(response.data.user);
                loadData();
            } else {
                router.push('/login');
            }
        } catch {
            router.push('/login');
        }
    }, [router]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return isSameDay(date, today);
    };

    const previousDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    const nextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(newDate);
    };

    const goToToday = () => {
        setSelectedDate(new Date());
    };

    // Get yesterday, today, tomorrow relative to selected date
    const yesterday = new Date(selectedDate);
    yesterday.setDate(yesterday.getDate() - 1);

    const tomorrow = new Date(selectedDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const filteredTrips = trips.filter(trip => {
        const tripDate = trip.trip_date ? new Date(trip.trip_date) : null;
        return tripDate && isSameDay(tripDate, selectedDate);
    });

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить рейс?')) return;
        try {
            await tripsAPI.delete(id);
            loadData();
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Ошибка удаления');
        }
    };

    const handleCreate = () => {
        setEditingTrip(null);
        setShowModal(true);
    };

    const handleEdit = (trip: Trip) => {
        setEditingTrip(trip);
        setShowModal(true);
    };

    const canEdit = user?.role === 'admin' || user?.role === 'dispatcher';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-gray-900 text-xl">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <header className="bg-[#fffef9] border-b border-gray-200 px-6 py-4 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Расписание рейсов</h1>
                    {canEdit && (
                        <button
                            onClick={handleCreate}
                            className="px-4 py-2 bg-[#ff6c00] hover:bg-[#a64600] text-white rounded-lg transition-colors"
                        >
                            + Создать рейс
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-auto">
                {/* Date Navigation */}
                <div className="flex items-center justify-center gap-3 mb-12">
                    <button
                        onClick={previousDay}
                        className="p-1.5 text-gray-600 hover:text-[#00675c] hover:bg-[#faf9f6] rounded-lg transition-colors"
                        title="Предыдущий день"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Three Day Cards */}
                    <div className="flex gap-2.5 relative">
                        {/* Yesterday */}
                        <button
                            onClick={() => setSelectedDate(yesterday)}
                            className="px-5 py-3 bg-[#fffef9] border border-gray-200 rounded-lg hover:border-[#00675c] hover:bg-[#faf9f6] transition-all min-w-[126px]"
                        >
                            <div className="text-[11px] text-gray-500 mb-1">
                                {yesterday.toLocaleDateString('ru-RU', { weekday: 'short' })}
                            </div>
                            <div className="text-base font-semibold text-gray-700">
                                {yesterday.getDate()}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">
                                {yesterday.toLocaleDateString('ru-RU', { month: 'short' })}
                            </div>
                        </button>

                        {/* Today (Selected) */}
                        <button
                            onClick={goToToday}
                            className="px-5 py-3 bg-[#00675c] border-2 border-[#00675c] rounded-lg shadow-lg transition-all min-w-[126px]"
                        >
                            <div className="text-[11px] text-white/80 mb-1">
                                {selectedDate.toLocaleDateString('ru-RU', { weekday: 'short' })}
                            </div>
                            <div className="text-xl font-bold text-white">
                                {selectedDate.getDate()}
                            </div>
                            <div className="text-[11px] text-white/80 mt-1">
                                {selectedDate.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })}
                            </div>
                            {isToday(selectedDate) && (
                                <div className="text-[11px] text-white/90 mt-1.5 font-medium">
                                    Сегодня
                                </div>
                            )}
                        </button>

                        {/* Return to Today Button */}
                        {!isToday(selectedDate) && (
                            <button
                                onClick={goToToday}
                                className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-white border border-gray-300 rounded-full text-[11px] text-gray-600 hover:text-[#00675c] hover:border-[#00675c] transition-all shadow-sm whitespace-nowrap"
                            >
                                Вернуться к текущей дате
                            </button>
                        )}

                        {/* Tomorrow */}
                        <button
                            onClick={() => setSelectedDate(tomorrow)}
                            className="px-5 py-3 bg-[#fffef9] border border-gray-200 rounded-lg hover:border-[#00675c] hover:bg-[#faf9f6] transition-all min-w-[126px]"
                        >
                            <div className="text-[11px] text-gray-500 mb-1">
                                {tomorrow.toLocaleDateString('ru-RU', { weekday: 'short' })}
                            </div>
                            <div className="text-base font-semibold text-gray-700">
                                {tomorrow.getDate()}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">
                                {tomorrow.toLocaleDateString('ru-RU', { month: 'short' })}
                            </div>
                        </button>
                    </div>

                    <button
                        onClick={nextDay}
                        className="p-1.5 text-gray-600 hover:text-[#00675c] hover:bg-[#faf9f6] rounded-lg transition-colors"
                        title="Следующий день"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Trips Section */}
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">
                            Рейсы ({filteredTrips.length})
                        </h3>
                    </div>

                    <div className="bg-[#fffef9] rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full">
                            <thead className="bg-[#faf9f6]">
                                <tr className="text-left text-xs text-gray-700">
                                    <th className="px-3 py-3 font-medium">Название/Маршрут</th>
                                    <th className="px-3 py-3 font-medium">Заказчик</th>
                                    <th className="px-3 py-3 font-medium">Исполнитель</th>
                                    <th className="px-3 py-3 font-medium">Транспорт</th>
                                    <th className="px-3 py-3 font-medium">Время</th>
                                    <th className="px-3 py-3 font-medium">Регион/Тип</th>
                                    <th className="px-3 py-3 font-medium">Цены</th>
                                    {canEdit && <th className="px-3 py-3 font-medium">Действия</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTrips.length === 0 ? (
                                    <tr>
                                        <td colSpan={canEdit ? 8 : 7} className="px-4 py-12 text-center text-gray-500 text-sm">
                                            Нет рейсов в этот день.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTrips.map((trip) => (
                                        <tr key={trip.id} className="text-gray-700 text-xs border-t border-gray-100 hover:bg-[#faf9f6] transition-colors">
                                            <td className="px-3 py-2">
                                                {trip.name && (
                                                    <div className="font-medium">{trip.name}</div>
                                                )}
                                                <div className={trip.name ? "text-gray-500 mt-1" : "font-medium"}>
                                                    {trip.route_start && trip.route_end
                                                        ? `${trip.route_start} → ${trip.route_end}`
                                                        : '-'}
                                                </div>
                                                {trip.movement_type && (
                                                    <div className="text-gray-500 mt-1 text-[10px]">{trip.movement_type}</div>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <div>{trip.customer_name || '-'}</div>
                                                {trip.contract_name && (
                                                    <div className="text-gray-500 mt-1 text-[10px]">{trip.contract_name}</div>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <div>{trip.executor_name || '-'}</div>
                                                {trip.driver_name && (
                                                    <div className="text-gray-500 mt-1">{trip.driver_name}</div>
                                                )}
                                                {trip.driver_phone && (
                                                    <div className="text-gray-500 text-[10px]">{trip.driver_phone}</div>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <div>{trip.vehicle_plate || '-'}</div>
                                                {trip.passengers_count && (
                                                    <div className="text-gray-500 mt-1">{trip.passengers_count} чел.</div>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                {trip.time_of_day && (
                                                    <div className="font-medium">{trip.time_of_day}</div>
                                                )}
                                                {trip.dispatch_time && (
                                                    <div className="text-gray-500 mt-1">Подача: {trip.dispatch_time}</div>
                                                )}
                                                {trip.departure_time && (
                                                    <div className="text-gray-500">Выезд: {trip.departure_time}</div>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <div>{trip.region_name || '-'}</div>
                                                {trip.trip_type_name && (
                                                    <div className="text-gray-500 mt-1">{trip.trip_type_name}</div>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                {trip.price_no_vat && (
                                                    <div>Без НДС: {trip.price_no_vat} ₽</div>
                                                )}
                                                {trip.price_with_vat && (
                                                    <div className="text-gray-500 mt-1">С НДС: {trip.price_with_vat} ₽</div>
                                                )}
                                            </td>
                                            {canEdit && (
                                                <td className="px-3 py-2">
                                                    <div className="flex flex-col gap-1">
                                                        <button
                                                            onClick={() => handleEdit(trip)}
                                                            className="text-[#ff6c00] hover:text-[#a64600] text-left"
                                                        >
                                                            Изменить
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(trip.id!)}
                                                            className="text-red-400 hover:text-red-300 text-left"
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
            </main>

            {showModal && (
                <TripModal
                    trip={editingTrip}
                    selectedDate={selectedDate}
                    contracts={contracts}
                    customers={customers}
                    regions={regions}
                    tripTypes={tripTypes}
                    executors={executors}
                    drivers={drivers}
                    vehicles={vehicles}
                    onClose={() => setShowModal(false)}
                    onSave={loadData}
                />
            )}
        </div>
    );
}

// Trip Modal Component
function TripModal({
    trip,
    selectedDate,
    contracts,
    customers,
    regions,
    tripTypes,
    executors,
    drivers,
    vehicles,
    onClose,
    onSave,
}: {
    trip: Trip | null;
    selectedDate: Date;
    contracts: Contract[];
    customers: Customer[];
    regions: Region[];
    tripTypes: TripType[];
    executors: Executor[];
    drivers: Driver[];
    vehicles: Vehicle[];
    onClose: () => void;
    onSave: () => void;
}) {
    const [formData, setFormData] = useState({
        name: trip?.name || '',
        trip_date: trip?.trip_date || selectedDate.toISOString().split('T')[0],
        contract_id: trip?.contract_id?.toString() || '',
        customer_id: trip?.customer_id?.toString() || '',
        customer_name: trip?.customer_name || '',
        region_id: trip?.region_id?.toString() || '',
        trip_type_id: trip?.trip_type_id?.toString() || '',
        executor_id: trip?.executor_id?.toString() || '',
        driver_id: trip?.driver_id?.toString() || '',
        driver_name: trip?.driver_name || '',
        driver_phone: trip?.driver_phone || '',
        vehicle_id: trip?.vehicle_id?.toString() || '',
        movement_type: trip?.movement_type || '',
        passengers_count: trip?.passengers_count?.toString() || '',
        time_of_day: trip?.time_of_day || '',
        dispatch_time: trip?.dispatch_time ? trip.dispatch_time.slice(11, 16) : '',
        departure_time: trip?.departure_time ? trip.departure_time.slice(11, 16) : '',
        route_start: trip?.route_start || '',
        route_end: trip?.route_end || '',
        price_no_vat: trip?.price_no_vat?.toString() || '',
        price_with_vat: trip?.price_with_vat?.toString() || '',
    });

    const [useCustomerDropdown, setUseCustomerDropdown] = useState(!!trip?.customer_id);
    const [useDriverDropdown, setUseDriverDropdown] = useState(!!trip?.driver_id);

    const addMinutes = (time: string, minutes: number): string => {
        if (!time) return '';
        const [hours, mins] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, mins + minutes, 0, 0);
        return date.toTimeString().slice(0, 5);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                name: formData.name.trim() || null,
                trip_date: formData.trip_date,
                contract_id: formData.contract_id ? parseInt(formData.contract_id) : null,
                customer_id: useCustomerDropdown && formData.customer_id ? parseInt(formData.customer_id) : null,
                customer_name: !useCustomerDropdown && formData.customer_name ? formData.customer_name.trim() : null,
                region_id: formData.region_id ? parseInt(formData.region_id) : null,
                trip_type_id: formData.trip_type_id ? parseInt(formData.trip_type_id) : null,
                executor_id: formData.executor_id ? parseInt(formData.executor_id) : null,
                driver_id: useDriverDropdown && formData.driver_id ? parseInt(formData.driver_id) : null,
                driver_name: !useDriverDropdown && formData.driver_name ? formData.driver_name.trim() : null,
                driver_phone: formData.driver_phone.trim() || null,
                vehicle_id: formData.vehicle_id ? parseInt(formData.vehicle_id) : null,
                movement_type: formData.movement_type.trim() || null,
                passengers_count: formData.passengers_count ? parseInt(formData.passengers_count) : null,
                time_of_day: formData.time_of_day.trim() || null,
                dispatch_time: formData.dispatch_time.trim() || null,
                departure_time: formData.departure_time.trim() || null,
                route_start: formData.route_start.trim() || null,
                route_end: formData.route_end.trim() || null,
                price_no_vat: formData.price_no_vat ? parseFloat(formData.price_no_vat) : null,
                price_with_vat: formData.price_with_vat ? parseFloat(formData.price_with_vat) : null,
            };

            if (trip?.id) {
                await tripsAPI.update(trip.id, payload);
            } else {
                await tripsAPI.create(payload);
            }

            alert('Рейс сохранен!');
            onSave();
            onClose();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка сохранения рейса');
        }
    };

    // Custom styles for react-select
    const customSelectStyles = {
        control: (base: any, state: any) => ({
            ...base,
            backgroundColor: '#fffef9',
            borderColor: state.isFocused ? '#ff6c00' : '#d1d5db',
            boxShadow: state.isFocused ? '0 0 0 2px #ff6c00' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? '#ff6c00' : '#d1d5db',
            },
            minHeight: '42px',
            borderRadius: '0.5rem',
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isSelected ? '#ff6c00' : state.isFocused ? '#fff3e0' : '#fffef9',
            color: state.isSelected ? '#ffffff' : '#111827',
            '&:active': {
                backgroundColor: '#ff6c00',
            },
        }),
        menu: (base: any) => ({
            ...base,
            backgroundColor: '#fffef9',
            borderRadius: '0.5rem',
            border: '1px solid #d1d5db',
        }),
        singleValue: (base: any) => ({
            ...base,
            color: '#111827',
        }),
        placeholder: (base: any) => ({
            ...base,
            color: '#9ca3af',
        }),
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl border border-gray-200 shadow-xl my-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {trip ? 'Редактировать рейс' : 'Создать рейс'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="max-h-[70vh] overflow-y-auto px-2">
                        {/* Основная информация */}
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                Основная информация
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Trip Name */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Название рейса
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                                        placeholder="Например: &quot;Ozon Большевиков&quot;"
                                    />
                                </div>

                                {/* Trip Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Дата рейса *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.trip_date}
                                        onChange={(e) => setFormData({ ...formData, trip_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Region */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Регион
                                    </label>
                                    <Select
                                        value={regions.find(r => r.id === parseInt(formData.region_id)) ? { value: formData.region_id, label: regions.find(r => r.id === parseInt(formData.region_id))!.name } : null}
                                        onChange={(option) => setFormData({ ...formData, region_id: option?.value || '' })}
                                        options={regions.map(r => ({ value: r.id.toString(), label: r.name }))}
                                        styles={customSelectStyles}
                                        placeholder="Не выбрано"
                                        isClearable
                                        isSearchable
                                    />
                                </div>

                                {/* Contract */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Договор
                                    </label>
                                    <Select
                                        value={contracts.find(c => c.id === parseInt(formData.contract_id)) ? { value: formData.contract_id, label: contracts.find(c => c.id === parseInt(formData.contract_id))!.name } : null}
                                        onChange={(option) => setFormData({ ...formData, contract_id: option?.value || '' })}
                                        options={contracts.map(c => ({ value: c.id.toString(), label: c.name }))}
                                        styles={customSelectStyles}
                                        placeholder="Не выбрано"
                                        isClearable
                                        isSearchable
                                    />
                                </div>

                                {/* Time of Day */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Время суток
                                    </label>
                                    <Select
                                        value={formData.time_of_day ? { value: formData.time_of_day, label: formData.time_of_day } : null}
                                        onChange={(option) => setFormData({ ...formData, time_of_day: option?.value || '' })}
                                        options={[
                                            { value: 'Утро', label: 'Утро' },
                                            { value: 'Вечер', label: 'Вечер' }
                                        ]}
                                        styles={customSelectStyles}
                                        placeholder="Не выбрано"
                                        isClearable
                                        isSearchable
                                    />
                                </div>

                                {/* Customer - with toggle */}
                                <div className="col-span-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Заказчик
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUseCustomerDropdown(!useCustomerDropdown);
                                                setFormData({ ...formData, customer_id: '', customer_name: '' });
                                            }}
                                            className="text-xs text-[#ff6c00] hover:text-[#a64600]"
                                        >
                                            {useCustomerDropdown ? 'Ввести вручную' : 'Выбрать из справочника'}
                                        </button>
                                    </div>
                                    {useCustomerDropdown ? (
                                        <Select
                                            value={customers.find(c => c.id === parseInt(formData.customer_id)) ? { value: formData.customer_id, label: customers.find(c => c.id === parseInt(formData.customer_id))!.name } : null}
                                            onChange={(option) => setFormData({ ...formData, customer_id: option?.value || '' })}
                                            options={customers.map(c => ({ value: c.id.toString(), label: c.name }))}
                                            styles={customSelectStyles}
                                            placeholder="Не выбрано"
                                            isClearable
                                            isSearchable
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={formData.customer_name}
                                            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                                            placeholder="Введите название заказчика"
                                        />
                                    )}
                                </div>

                                {/* Trip Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Тип заказа
                                    </label>
                                    <Select
                                        value={tripTypes.find(t => t.id === parseInt(formData.trip_type_id)) ? { value: formData.trip_type_id, label: tripTypes.find(t => t.id === parseInt(formData.trip_type_id))!.name } : null}
                                        onChange={(option) => setFormData({ ...formData, trip_type_id: option?.value || '' })}
                                        options={tripTypes.map(t => ({ value: t.id.toString(), label: t.name }))}
                                        styles={customSelectStyles}
                                        placeholder="Не выбрано"
                                        isClearable
                                        isSearchable
                                    />
                                </div>

                                {/* Passengers Count */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Количество человек
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.passengers_count}
                                        onChange={(e) => setFormData({ ...formData, passengers_count: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Маршрут */}
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                Маршрут
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Route Start */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Начало маршрута
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.route_start}
                                        onChange={(e) => setFormData({ ...formData, route_start: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                                    />
                                </div>

                                {/* Route End */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Конец маршрута
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.route_end}
                                        onChange={(e) => setFormData({ ...formData, route_end: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                                    />
                                </div>

                                {/* Dispatch Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Подача
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.dispatch_time}
                                        onChange={(e) => {
                                            const newDispatchTime = e.target.value;
                                            setFormData({
                                                ...formData,
                                                dispatch_time: newDispatchTime,
                                                departure_time: newDispatchTime ? addMinutes(newDispatchTime, 10) : ''
                                            });
                                        }}
                                        className="w-full px-3 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                                    />
                                </div>

                                {/* Departure Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Выезд
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.departure_time}
                                        onChange={(e) => {
                                            const newDepartureTime = e.target.value;
                                            setFormData({
                                                ...formData,
                                                departure_time: newDepartureTime,
                                                dispatch_time: newDepartureTime ? addMinutes(newDepartureTime, -10) : ''
                                            });
                                        }}
                                        className="w-full px-3 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                                    />
                                </div>

                                {/* Movement Type */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Тип рейса
                                    </label>
                                    <Select
                                        value={formData.movement_type ? { value: formData.movement_type, label: formData.movement_type } : null}
                                        onChange={(option) => setFormData({ ...formData, movement_type: option?.value || '' })}
                                        options={[
                                            { value: 'Прямой', label: 'Прямой' },
                                            { value: 'Круг', label: 'Круг' },
                                            { value: '1/2 Круга', label: '1/2 Круга' }
                                        ]}
                                        styles={customSelectStyles}
                                        placeholder="Не выбрано"
                                        isClearable
                                        isSearchable
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Исполнение */}
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                Исполнение
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Executor */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Исполнитель
                                    </label>
                                    <Select
                                        value={executors.find(e => e.id === parseInt(formData.executor_id)) ? { value: formData.executor_id, label: executors.find(e => e.id === parseInt(formData.executor_id))!.name } : null}
                                        onChange={(option) => setFormData({
                                            ...formData,
                                            executor_id: option?.value || '',
                                            driver_id: '',
                                            driver_name: '',
                                            driver_phone: '',
                                            vehicle_id: ''
                                        })}
                                        options={executors.map(e => ({ value: e.id.toString(), label: e.name }))}
                                        styles={customSelectStyles}
                                        placeholder="Не выбрано"
                                        isClearable
                                        isSearchable
                                    />
                                </div>

                                {/* Vehicle */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Транспорт
                                    </label>
                                    <Select
                                        value={vehicles.find(v => v.id === parseInt(formData.vehicle_id)) ? { value: formData.vehicle_id, label: vehicles.find(v => v.id === parseInt(formData.vehicle_id))!.license_plate } : null}
                                        onChange={(option) => setFormData({ ...formData, vehicle_id: option?.value || '' })}
                                        options={vehicles
                                            .filter(v => !formData.executor_id || v.executor_id === parseInt(formData.executor_id))
                                            .map(v => ({ value: v.id.toString(), label: v.license_plate }))}
                                        styles={customSelectStyles}
                                        placeholder="Не выбрано"
                                        isClearable
                                        isSearchable
                                        isDisabled={!formData.executor_id}
                                    />
                                </div>

                                {/* Driver - with toggle */}
                                <div className="col-span-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Водитель
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUseDriverDropdown(!useDriverDropdown);
                                                setFormData({ ...formData, driver_id: '', driver_name: '', driver_phone: '' });
                                            }}
                                            className="text-xs text-[#ff6c00] hover:text-[#a64600]"
                                        >
                                            {useDriverDropdown ? 'Ввести вручную' : 'Выбрать из справочника'}
                                        </button>
                                    </div>
                                    {useDriverDropdown ? (
                                        <Select
                                            value={drivers.find(d => d.id === parseInt(formData.driver_id)) ? { value: formData.driver_id, label: drivers.find(d => d.id === parseInt(formData.driver_id))!.full_name } : null}
                                            onChange={(option) => {
                                                const selectedDriver = drivers.find(d => d.id === parseInt(option?.value || ''));
                                                setFormData({
                                                    ...formData,
                                                    driver_id: option?.value || '',
                                                    driver_phone: selectedDriver?.phone || ''
                                                });
                                            }}
                                            options={drivers
                                                .filter(d => !formData.executor_id || d.executor_id === parseInt(formData.executor_id))
                                                .map(d => ({ value: d.id.toString(), label: d.full_name }))}
                                            styles={customSelectStyles}
                                            placeholder="Не выбрано"
                                            isClearable
                                            isSearchable
                                            isDisabled={!formData.executor_id}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={formData.driver_name}
                                            onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                                            placeholder="Введите ФИО водителя"
                                        />
                                    )}
                                </div>

                                {/* Driver Phone */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Номер водителя
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.driver_phone}
                                        onChange={(e) => setFormData({ ...formData, driver_phone: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                                        placeholder="Введите номер телефона"
                                        readOnly={useDriverDropdown && !!formData.driver_id}
                                    />
                                </div>

                                {/* Price No VAT */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Цена без НДС
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price_no_vat}
                                        onChange={(e) => setFormData({ ...formData, price_no_vat: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                                    />
                                </div>

                                {/* Price With VAT */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Цена с НДС
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price_with_vat}
                                        onChange={(e) => setFormData({ ...formData, price_with_vat: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#ff6c00] hover:bg-[#a64600] text-white rounded-lg transition-colors"
                        >
                            {trip ? 'Сохранить' : 'Создать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

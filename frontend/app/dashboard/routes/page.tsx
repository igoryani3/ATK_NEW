'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import { authAPI, routeTemplatesAPI, contractsAPI, customersAPI, regionsAPI, tripTypesAPI, executorsAPI, driversAPI, vehiclesAPI } from '@/lib/api';
import { RouteTemplate, Contract, Customer, Region, TripType, Executor, Driver, Vehicle } from '@/lib/types';

export default function RoutesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [templates, setTemplates] = useState<RouteTemplate[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<RouteTemplate | null>(null);

    // Reference data
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [tripTypes, setTripTypes] = useState<TripType[]>([]);
    const [executors, setExecutors] = useState<Executor[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

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
            const [templatesRes, contractsRes, customersRes, regionsRes, tripTypesRes, executorsRes, driversRes, vehiclesRes] = await Promise.all([
                routeTemplatesAPI.getAll(),
                contractsAPI.getAll(),
                customersAPI.getAll(),
                regionsAPI.getAll(),
                tripTypesAPI.getAll(),
                executorsAPI.getAll(),
                driversAPI.getAll(),
                vehiclesAPI.getAll(),
            ]);

            setTemplates(templatesRes.data);
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

    const handleCreate = () => {
        setEditingTemplate(null);
        setShowModal(true);
    };

    const handleEdit = (template: RouteTemplate) => {
        setEditingTemplate(template);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить шаблон маршрута?')) return;
        try {
            await routeTemplatesAPI.delete(id);
            loadData();
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Ошибка удаления');
        }
    };

    const handleSync = async (id: number) => {
        try {
            const response = await routeTemplatesAPI.generateTrips(id);
            const tripsCreated = response.data.trips_created;
            if (tripsCreated > 0) {
                alert(`Синхронизация завершена! Создано рейсов: ${tripsCreated}`);
            } else {
                alert('Синхронизация завершена. Новые рейсы не созданы (возможно, они уже существуют или не заданы дни недели/дата окончания)');
            }
            loadData();
        } catch (error) {
            console.error('Ошибка синхронизации:', error);
            alert('Ошибка синхронизации');
        }
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
        <div className="h-full">
            {/* Header */}
            <header className="bg-[#fffef9] border-b border-gray-200 shadow-sm">
                <div className="px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Шаблоны маршрутов</h1>
                            <p className="text-sm text-gray-600">Управление шаблонами для быстрого создания рейсов</p>
                        </div>
                        {canEdit && (
                            <button
                                onClick={handleCreate}
                                className="px-4 py-2 bg-[#ff6c00] hover:bg-[#a64600] text-white rounded-lg transition-colors"
                            >
                                + Создать шаблон
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="p-6">
                <div className="bg-[#fffef9] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <table className="w-full">
                        <thead className="bg-[#faf9f6]">
                            <tr className="text-left text-xs text-gray-700">
                                <th className="px-3 py-3 font-medium">Название/Маршрут</th>
                                <th className="px-3 py-3 font-medium">Заказчик</th>
                                <th className="px-3 py-3 font-medium">Исполнитель</th>
                                <th className="px-3 py-3 font-medium">Транспорт</th>
                                <th className="px-3 py-3 font-medium">Расписание</th>
                                <th className="px-3 py-3 font-medium">Регион/Тип</th>
                                <th className="px-3 py-3 font-medium">Цены</th>
                                {canEdit && <th className="px-3 py-3 font-medium">Действия</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {templates.map((template) => (
                                <tr key={template.id} className="text-gray-700 text-xs border-t border-gray-100 hover:bg-[#faf9f6] transition-colors">
                                    <td className="px-3 py-2">
                                        <div className="font-medium">{template.name}</div>
                                        <div className="text-gray-500 mt-1">
                                            {template.route_start && template.route_end
                                                ? `${template.route_start} → ${template.route_end}`
                                                : '-'}
                                        </div>
                                        {template.movement_type && (
                                            <div className="text-gray-500 text-[10px]">{template.movement_type}</div>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div>{template.customer_name || '-'}</div>
                                        {template.contract_name && (
                                            <div className="text-gray-500 mt-1 text-[10px]">{template.contract_name}</div>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div>{template.executor_name || '-'}</div>
                                        {template.driver_name && (
                                            <div className="text-gray-500 mt-1">{template.driver_name}</div>
                                        )}
                                        {template.driver_phone && (
                                            <div className="text-gray-500 text-[10px]">{template.driver_phone}</div>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div>{template.vehicle_plate || '-'}</div>
                                        {template.passengers_count && (
                                            <div className="text-gray-500 mt-1">{template.passengers_count} чел.</div>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        {template.time_of_day && (
                                            <div className="font-medium">{template.time_of_day}</div>
                                        )}
                                        {template.dispatch_time && (
                                            <div className="text-gray-500 mt-1">Подача: {template.dispatch_time}</div>
                                        )}
                                        {template.departure_time && (
                                            <div className="text-gray-500">Выезд: {template.departure_time}</div>
                                        )}
                                        {template.days_of_week && (
                                            <div className="text-gray-500 mt-1">{template.days_of_week}</div>
                                        )}
                                        {template.end_date && (
                                            <div className="text-gray-500 text-[10px]">До: {template.end_date}</div>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div>{template.region_name || '-'}</div>
                                        {template.trip_type_name && (
                                            <div className="text-gray-500 mt-1">{template.trip_type_name}</div>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        {template.price_no_vat && (
                                            <div>Без НДС: {template.price_no_vat} ₽</div>
                                        )}
                                        {template.price_with_vat && (
                                            <div className="text-gray-500 mt-1">С НДС: {template.price_with_vat} ₽</div>
                                        )}
                                    </td>
                                    {canEdit && (
                                        <td className="px-3 py-2">
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => handleSync(template.id!)}
                                                    className="text-blue-600 hover:text-blue-800 text-left"
                                                    title="Синхронизировать рейсы"
                                                >
                                                    Синхронизация
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(template)}
                                                    className="text-[#ff6c00] hover:text-[#a64600] text-left"
                                                >
                                                    Изменить
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(template.id!)}
                                                    className="text-red-400 hover:text-red-300 text-left"
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <RouteTemplateModal
                    template={editingTemplate}
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

// Route Template Modal Component
function RouteTemplateModal({
    template,
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
    template: RouteTemplate | null;
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
        name: template?.name || '',
        contract_id: template?.contract_id?.toString() || '',
        customer_id: template?.customer_id?.toString() || '',
        region_id: template?.region_id?.toString() || '',
        trip_type_id: template?.trip_type_id?.toString() || '',
        executor_id: template?.executor_id?.toString() || '',
        driver_id: template?.driver_id?.toString() || '',
        driver_phone: template?.driver_phone || '',
        vehicle_id: template?.vehicle_id?.toString() || '',
        movement_type: template?.movement_type || '',
        passengers_count: template?.passengers_count?.toString() || '',
        time_of_day: template?.time_of_day || '',
        dispatch_time: template?.dispatch_time || '',
        departure_time: template?.departure_time || '',
        route_start: template?.route_start || '',
        route_end: template?.route_end || '',
        price_no_vat: template?.price_no_vat?.toString() || '',
        price_with_vat: template?.price_with_vat?.toString() || '',
        days_of_week: template?.days_of_week || '',
        end_date: template?.end_date || '',
    });

    const addMinutes = (time: string, minutes: number): string => {
        if (!time) return '';
        const [hours, mins] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, mins + minutes, 0, 0);
        return date.toTimeString().slice(0, 5);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('Введите название маршрута');
            return;
        }

        try {
            const payload = {
                name: formData.name.trim(),
                contract_id: formData.contract_id ? parseInt(formData.contract_id) : null,
                customer_id: formData.customer_id ? parseInt(formData.customer_id) : null,
                region_id: formData.region_id ? parseInt(formData.region_id) : null,
                trip_type_id: formData.trip_type_id ? parseInt(formData.trip_type_id) : null,
                executor_id: formData.executor_id ? parseInt(formData.executor_id) : null,
                driver_id: formData.driver_id ? parseInt(formData.driver_id) : null,
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
                days_of_week: formData.days_of_week.trim() || null,
                end_date: formData.end_date.trim() || null,
            };

            if (template?.id) {
                await routeTemplatesAPI.update(template.id, payload);
            } else {
                await routeTemplatesAPI.create(payload);
            }

            alert('Шаблон сохранен!');
            onSave();
            onClose();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка сохранения шаблона');
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
                    {template ? 'Редактировать шаблон' : 'Создать шаблон'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="max-h-[70vh] overflow-y-auto px-2">
                        {/* Основная информация */}
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                Основная информация
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Template Name */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Название маршрута *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                                        placeholder="Например: &quot;Ozon Большевиков&quot;"
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

                                {/* Customer */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Заказчик
                                    </label>
                                    <Select
                                        value={customers.find(c => c.id === parseInt(formData.customer_id)) ? { value: formData.customer_id, label: customers.find(c => c.id === parseInt(formData.customer_id))!.name } : null}
                                        onChange={(option) => setFormData({ ...formData, customer_id: option?.value || '' })}
                                        options={customers.map(c => ({ value: c.id.toString(), label: c.name }))}
                                        styles={customSelectStyles}
                                        placeholder="Не выбрано"
                                        isClearable
                                        isSearchable
                                    />
                                </div>

                                {/* Movement Type - Тип заказа */}
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

                                {/* Dispatch Time - Подача */}
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

                                {/* Departure Time - Выезд */}
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

                                {/* Trip Type - Тип рейса */}
                                <div>
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

                                {/* End Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Дата окончания
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                                    />
                                </div>

                                {/* Days of Week */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Дни недели
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { value: 'Пн', label: 'Пн' },
                                            { value: 'Вт', label: 'Вт' },
                                            { value: 'Ср', label: 'Ср' },
                                            { value: 'Чт', label: 'Чт' },
                                            { value: 'Пт', label: 'Пт' },
                                            { value: 'Сб', label: 'Сб' },
                                            { value: 'Вс', label: 'Вс' }
                                        ].map((day) => {
                                            const selectedDays = formData.days_of_week.split(',').filter(d => d);
                                            const isSelected = selectedDays.includes(day.value);
                                            return (
                                                <button
                                                    key={day.value}
                                                    type="button"
                                                    onClick={() => {
                                                        const days = formData.days_of_week.split(',').filter(d => d);
                                                        if (isSelected) {
                                                            const newDays = days.filter(d => d !== day.value);
                                                            setFormData({ ...formData, days_of_week: newDays.join(',') });
                                                        } else {
                                                            setFormData({ ...formData, days_of_week: [...days, day.value].join(',') });
                                                        }
                                                    }}
                                                    className={`px-4 py-2 rounded-lg border transition-colors ${
                                                        isSelected
                                                            ? 'bg-[#ff6c00] text-white border-[#ff6c00]'
                                                            : 'bg-[#fffef9] text-gray-700 border-gray-300 hover:border-[#ff6c00]'
                                                    }`}
                                                >
                                                    {day.label}
                                                </button>
                                            );
                                        })}
                                    </div>
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

                                {/* Driver */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Водитель
                                    </label>
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

                                {/* Driver Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Номер водителя
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.driver_phone}
                                        readOnly
                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 cursor-not-allowed"
                                        placeholder="Выберите водителя"
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
                            {template ? 'Сохранить' : 'Создать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

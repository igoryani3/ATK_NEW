'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, driversAPI, vehiclesAPI, customersAPI, executorsAPI, contractsAPI, regionsAPI, tripTypesAPI } from '@/lib/api';
import { Driver, Vehicle, Customer, Executor, Contract, Region, TripType } from '@/lib/types';

type Tab = 'drivers' | 'customers' | 'vehicles' | 'executors' | 'contracts';

export default function ReferencesPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('drivers');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // Data states
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [executors, setExecutors] = useState<Executor[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);

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
            console.error('Ошибка загрузки данных:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'drivers' as Tab, label: 'Водители', icon: '👥', count: drivers.length },
        { id: 'customers' as Tab, label: 'Заказчики', icon: '🏢', count: customers.length },
        { id: 'vehicles' as Tab, label: 'Автомобили', icon: '🚙', count: vehicles.length },
        { id: 'executors' as Tab, label: 'Исполнители', icon: '👔', count: executors.length },
        { id: 'contracts' as Tab, label: 'Договоры', icon: '📄', count: contracts.length },
    ];

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
                    <h1 className="text-2xl font-bold text-gray-900">Справочники</h1>
                    <p className="text-sm text-gray-600">Управление справочной информацией</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-[#fffef9] border-b border-gray-200">
                <div className="px-6 flex gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-4 py-3 border-b-2 transition-all
                                ${activeTab === tab.id
                                    ? 'border-[#00675c] text-[#00675c] bg-[#00675c]/5'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-[#faf9f6]'
                                }
                            `}
                        >
                            <span>{tab.icon}</span>
                            <span className="font-medium">{tab.label}</span>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === 'drivers' && <DriversTab drivers={drivers} onRefresh={loadData} userRole={user?.role} />}
                {activeTab === 'customers' && <CustomersTab customers={customers} onRefresh={loadData} userRole={user?.role} />}
                {activeTab === 'vehicles' && <VehiclesTab vehicles={vehicles} onRefresh={loadData} userRole={user?.role} />}
                {activeTab === 'executors' && <ExecutorsTab executors={executors} onRefresh={loadData} userRole={user?.role} />}
                {activeTab === 'contracts' && <ContractsTab contracts={contracts} onRefresh={loadData} userRole={user?.role} />}
            </div>
        </div>
    );
}

// Drivers Tab Component
function DriversTab({ drivers, onRefresh, userRole }: { drivers: Driver[]; onRefresh: () => void; userRole?: string }) {
    const router = useRouter();
    const canEdit = userRole === 'admin' || userRole === 'dispatcher';

    const checkDocumentExpiry = (driver: Driver): boolean => {
        const today = new Date();
        const warningDays = 30; // Warn 30 days before expiry

        const checkDate = (dateString?: string) => {
            if (!dateString) return false;
            const expiryDate = new Date(dateString);
            const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= warningDays;
        };

        return checkDate(driver.license_expiry_date) || checkDate(driver.tachograph_expiry_date);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить водителя?')) return;
        try {
            await driversAPI.delete(id);
            onRefresh();
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Ошибка удаления');
        }
    };

    const handleEdit = (driver: Driver) => {
        router.push(`/dashboard/drivers/${driver.id}`);
    };

    const handleAdd = () => {
        router.push('/dashboard/drivers/new');
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Водители ({drivers.length})</h2>
                {canEdit && (
                    <button
                        onClick={handleAdd}
                        className="px-4 py-2 bg-[#ff6c00] hover:bg-[#a64600] text-white rounded-lg transition-colors"
                    >
                        + Добавить водителя
                    </button>
                )}
            </div>

            <div className="bg-[#fffef9] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <table className="w-full">
                    <thead className="bg-[#faf9f6]">
                        <tr className="text-left text-sm text-gray-700">
                            <th className="px-4 py-3">Имя</th>
                            <th className="px-4 py-3">Телефон</th>
                            <th className="px-4 py-3">Исполнитель</th>
                            <th className="px-4 py-3">Номер ВУ</th>
                            {canEdit && <th className="px-4 py-3">Действия</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {drivers.map((driver) => (
                            <tr key={driver.id} className="text-gray-700 hover:bg-[#faf9f6]">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        {driver.full_name}
                                        {checkDocumentExpiry(driver) && (
                                            <span className="text-red-500" title="Документ истекает или истёк">
                                                ⚠️
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">{driver.phone}</td>
                                <td className="px-4 py-3">{driver.executor_name || '-'}</td>
                                <td className="px-4 py-3">{driver.license_number || '-'}</td>
                                {canEdit && (
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(driver)}
                                                className="text-[#ff6c00] hover:text-[#a64600]"
                                            >
                                                Изменить
                                            </button>
                                            <button
                                                onClick={() => handleDelete(driver.id)}
                                                className="text-red-400 hover:text-red-300"
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
    );
}

// Customers Tab Component
function CustomersTab({ customers, onRefresh, userRole }: { customers: Customer[]; onRefresh: () => void; userRole?: string }) {
    const canEdit = userRole === 'admin' || userRole === 'dispatcher';
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить заказчика?')) return;
        try {
            await customersAPI.delete(id);
            onRefresh();
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Ошибка удаления');
        }
    };

    const handleCreate = async (data: any) => {
        try {
            if (editingCustomer) {
                await customersAPI.update(editingCustomer.id, data);
            } else {
                await customersAPI.create(data);
            }
            setShowModal(false);
            setEditingCustomer(null);
            onRefresh();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка сохранения');
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCustomer(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Заказчики ({customers.length})</h2>
                {canEdit && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-[#ff6c00] hover:bg-[#a64600] text-white rounded-lg transition-colors"
                    >
                        + Добавить заказчика
                    </button>
                )}
            </div>

            {showModal && (
                <SimpleModal
                    title={editingCustomer ? "Редактировать заказчика" : "Добавить заказчика"}
                    fieldLabel="Название"
                    initialValue={editingCustomer?.name}
                    onClose={handleCloseModal}
                    onSubmit={handleCreate}
                />
            )}

            <div className="bg-[#fffef9] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <table className="w-full">
                    <thead className="bg-[#faf9f6]">
                        <tr className="text-left text-sm text-gray-700">
                            <th className="px-4 py-3">Название</th>
                            {canEdit && <th className="px-4 py-3">Действия</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {customers.map((customer) => (
                            <tr key={customer.id} className="text-gray-700 hover:bg-[#faf9f6]">
                                <td className="px-4 py-3 font-medium">{customer.name}</td>
                                {canEdit && (
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(customer)}
                                                className="text-[#ff6c00] hover:text-[#a64600]"
                                            >
                                                Изменить
                                            </button>
                                            <button
                                                onClick={() => handleDelete(customer.id)}
                                                className="text-red-400 hover:text-red-300"
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
    );
}

// Vehicles Tab Component
function VehiclesTab({ vehicles, onRefresh, userRole }: { vehicles: Vehicle[]; onRefresh: () => void; userRole?: string }) {
    const canEdit = userRole === 'admin' || userRole === 'dispatcher';
    const [showModal, setShowModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [executors, setExecutors] = useState<Executor[]>([]);

    useEffect(() => {
        loadExecutors();
    }, []);

    const loadExecutors = async () => {
        try {
            const res = await executorsAPI.getAll();
            setExecutors(res.data);
        } catch (error) {
            console.error('Ошибка загрузки исполнителей:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить автомобиль?')) return;
        try {
            await vehiclesAPI.delete(id);
            onRefresh();
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Ошибка удаления');
        }
    };

    const handleCreate = async (data: any) => {
        try {
            if (editingVehicle) {
                await vehiclesAPI.update(editingVehicle.id, data);
            } else {
                await vehiclesAPI.create(data);
            }
            setShowModal(false);
            setEditingVehicle(null);
            onRefresh();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка сохранения');
        }
    };

    const handleEdit = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingVehicle(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Автомобили ({vehicles.length})</h2>
                {canEdit && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-[#ff6c00] hover:bg-[#a64600] text-white rounded-lg transition-colors"
                    >
                        + Добавить автомобиль
                    </button>
                )}
            </div>

            {showModal && (
                <VehicleModal
                    vehicle={editingVehicle}
                    executors={executors}
                    onClose={handleCloseModal}
                    onSubmit={handleCreate}
                />
            )}

            <div className="bg-[#fffef9] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <table className="w-full">
                    <thead className="bg-[#faf9f6]">
                        <tr className="text-left text-sm text-gray-700">
                            <th className="px-4 py-3">Гос. номер</th>
                            <th className="px-4 py-3">Исполнитель</th>
                            <th className="px-4 py-3">Вместимость</th>
                            {canEdit && <th className="px-4 py-3">Действия</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {vehicles.map((vehicle) => (
                            <tr key={vehicle.id} className="text-gray-700 hover:bg-[#faf9f6]">
                                <td className="px-4 py-3 font-mono font-medium">{vehicle.license_plate}</td>
                                <td className="px-4 py-3">{vehicle.executor_name || '-'}</td>
                                <td className="px-4 py-3">{vehicle.capacity ? `${vehicle.capacity} чел.` : '-'}</td>
                                {canEdit && (
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(vehicle)}
                                                className="text-[#ff6c00] hover:text-[#a64600]"
                                            >
                                                Изменить
                                            </button>
                                            <button
                                                onClick={() => handleDelete(vehicle.id)}
                                                className="text-red-400 hover:text-red-300"
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
    );
}

// Executors Tab Component
function ExecutorsTab({ executors, onRefresh, userRole }: { executors: Executor[]; onRefresh: () => void; userRole?: string }) {
    const canEdit = userRole === 'admin' || userRole === 'dispatcher';
    const [showModal, setShowModal] = useState(false);
    const [editingExecutor, setEditingExecutor] = useState<Executor | null>(null);

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить исполнителя?')) return;
        try {
            await executorsAPI.delete(id);
            onRefresh();
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Ошибка удаления');
        }
    };

    const handleCreate = async (data: any) => {
        try {
            if (editingExecutor) {
                await executorsAPI.update(editingExecutor.id, data);
            } else {
                await executorsAPI.create(data);
            }
            setShowModal(false);
            setEditingExecutor(null);
            onRefresh();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка сохранения');
        }
    };

    const handleEdit = (executor: Executor) => {
        setEditingExecutor(executor);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingExecutor(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Исполнители ({executors.length})</h2>
                {canEdit && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-[#ff6c00] hover:bg-[#a64600] text-white rounded-lg transition-colors"
                    >
                        + Добавить исполнителя
                    </button>
                )}
            </div>

            {showModal && (
                <SimpleModal
                    title={editingExecutor ? "Редактировать исполнителя" : "Добавить исполнителя"}
                    fieldLabel="Название"
                    initialValue={editingExecutor?.name}
                    onClose={handleCloseModal}
                    onSubmit={handleCreate}
                />
            )}

            <div className="bg-[#fffef9] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <table className="w-full">
                    <thead className="bg-[#faf9f6]">
                        <tr className="text-left text-sm text-gray-700">
                            <th className="px-4 py-3">Название</th>
                            {canEdit && <th className="px-4 py-3">Действия</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {executors.map((executor) => (
                            <tr key={executor.id} className="text-gray-700 hover:bg-[#faf9f6]">
                                <td className="px-4 py-3">{executor.name}</td>
                                {canEdit && (
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(executor)}
                                                className="text-[#ff6c00] hover:text-[#a64600]"
                                            >
                                                Изменить
                                            </button>
                                            <button
                                                onClick={() => handleDelete(executor.id)}
                                                className="text-red-400 hover:text-red-300"
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
    );
}

// Contracts Tab Component
function ContractsTab({ contracts, onRefresh, userRole }: { contracts: Contract[]; onRefresh: () => void; userRole?: string }) {
    const canEdit = userRole === 'admin' || userRole === 'dispatcher';
    const [showModal, setShowModal] = useState(false);
    const [editingContract, setEditingContract] = useState<Contract | null>(null);

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить договор?')) return;
        try {
            await contractsAPI.delete(id);
            onRefresh();
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Ошибка удаления');
        }
    };

    const handleCreate = async (data: any) => {
        try {
            if (editingContract) {
                await contractsAPI.update(editingContract.id, data);
            } else {
                await contractsAPI.create(data);
            }
            setShowModal(false);
            setEditingContract(null);
            onRefresh();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка сохранения');
        }
    };

    const handleEdit = (contract: Contract) => {
        setEditingContract(contract);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingContract(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Договоры ({contracts.length})</h2>
                {canEdit && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-[#ff6c00] hover:bg-[#a64600] text-white rounded-lg transition-colors"
                    >
                        + Добавить договор
                    </button>
                )}
            </div>

            {showModal && (
                <SimpleModal
                    title={editingContract ? "Редактировать договор" : "Добавить договор"}
                    fieldLabel="Название"
                    initialValue={editingContract?.name}
                    onClose={handleCloseModal}
                    onSubmit={handleCreate}
                />
            )}

            <div className="bg-[#fffef9] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <table className="w-full">
                    <thead className="bg-[#faf9f6]">
                        <tr className="text-left text-sm text-gray-700">
                            <th className="px-4 py-3">Название</th>
                            {canEdit && <th className="px-4 py-3">Действия</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {contracts.map((contract) => (
                            <tr key={contract.id} className="text-gray-700 hover:bg-[#faf9f6]">
                                <td className="px-4 py-3">{contract.name}</td>
                                {canEdit && (
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(contract)}
                                                className="text-[#ff6c00] hover:text-[#a64600]"
                                            >
                                                Изменить
                                            </button>
                                            <button
                                                onClick={() => handleDelete(contract.id)}
                                                className="text-red-400 hover:text-red-300"
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
    );
}

// Modal Components

// Simple Modal for name-only entities
function SimpleModal({ title, fieldLabel, initialValue, onClose, onSubmit }: {
    title: string;
    fieldLabel: string;
    initialValue?: string;
    onClose: () => void;
    onSubmit: (data: any) => void;
}) {
    const [name, setName] = useState(initialValue || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Заполните поле');
            return;
        }
        onSubmit({ name: name.trim() });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200 shadow-xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {fieldLabel}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
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
                            Создать
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Vehicle Modal
function VehicleModal({ vehicle, executors, onClose, onSubmit }: {
    vehicle?: Vehicle | null;
    executors: Executor[];
    onClose: () => void;
    onSubmit: (data: any) => void;
}) {
    const [formData, setFormData] = useState({
        executor_id: vehicle?.executor_id?.toString() || '',
        license_plate: vehicle?.license_plate || '',
        capacity: vehicle?.capacity?.toString() || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.executor_id || !formData.license_plate) {
            alert('Заполните все поля');
            return;
        }
        onSubmit({
            executor_id: parseInt(formData.executor_id),
            license_plate: formData.license_plate.trim(),
            capacity: formData.capacity ? parseInt(formData.capacity) : null,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200 shadow-xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{vehicle ? 'Редактировать автомобиль' : 'Добавить автомобиль'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Исполнитель *
                            </label>
                            <select
                                value={formData.executor_id}
                                onChange={(e) => setFormData({ ...formData, executor_id: e.target.value })}
                                className="w-full px-3 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                            >
                                <option value="">Выберите исполнителя</option>
                                {executors.map((executor) => (
                                    <option key={executor.id} value={executor.id}>
                                        {executor.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Гос. номер *
                            </label>
                            <input
                                type="text"
                                value={formData.license_plate}
                                onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                                className="w-full px-3 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
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
                                className="w-full px-3 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                                placeholder="Например: 8"
                            />
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
                            Создать
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

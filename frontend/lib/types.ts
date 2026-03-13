// Type definitions for the application

export interface User {
    id: number;
    username: string;
    role: string;
}

// Reference Types (Справочники)

export interface Region {
    id: number;
    name: string;
}

export interface TripType {
    id: number;
    name: string;
}

export interface Contract {
    id: number;
    name: string;
}

export interface Customer {
    id: number;
    name: string;
}

export interface Executor {
    id: number;
    name: string;
}

// Resource Types (Ресурсы)

export interface Driver {
    id: number;
    executor_id: number;
    executor_name?: string;
    full_name: string;
    phone: string;
    date_of_birth?: string;
    license_series?: string;
    license_number?: string;
    license_issue_date?: string;
    license_expiry_date?: string;
    license_file_path?: string;
    passport_series?: string;
    passport_number?: string;
    passport_issue_date?: string;
    passport_issued_by?: string;
    passport_file_path?: string;
    snils_number?: string;
    tachograph_number?: string;
    tachograph_issue_date?: string;
    tachograph_expiry_date?: string;
}

export interface Vehicle {
    id: number;
    executor_id: number;
    executor_name?: string;
    license_plate: string;
    capacity?: number;
}

// Route Templates (Шаблоны маршрутов)

export interface RouteTemplate {
    id?: number;
    name: string;

    // Foreign Keys
    contract_id?: number;
    contract_name?: string;
    customer_id?: number;
    customer_name?: string;
    region_id?: number;
    region_name?: string;
    trip_type_id?: number;
    trip_type_name?: string;
    executor_id?: number;
    executor_name?: string;
    driver_id?: number;
    driver_name?: string;
    driver_phone?: string;
    vehicle_id?: number;
    vehicle_plate?: string;

    // Trip Details
    movement_type?: string;
    passengers_count?: number;
    time_of_day?: string;

    // Timing
    dispatch_time?: string;
    departure_time?: string;

    // Route
    route_start?: string;
    route_end?: string;

    // Pricing
    price_no_vat?: number;
    price_with_vat?: number;

    // Schedule
    days_of_week?: string;
    end_date?: string;

    // Timestamps
    created_at?: string;
    updated_at?: string;
}

// Main Type (Главная таблица)

export interface Trip {
    id?: number;
    trip_date?: string;
    name?: string;

    // Foreign Keys
    contract_id?: number;
    contract_name?: string;
    customer_id?: number;
    customer_name?: string;
    region_id?: number;
    region_name?: string;
    trip_type_id?: number;
    trip_type_name?: string;
    executor_id?: number;
    executor_name?: string;
    driver_id?: number;
    driver_name?: string;
    driver_phone?: string;
    vehicle_id?: number;
    vehicle_plate?: string;

    // Trip Details
    movement_type?: string;
    passengers_count?: number;
    time_of_day?: string;

    // Timing
    dispatch_time?: string;
    departure_time?: string;

    // Route
    route_start?: string;
    route_end?: string;

    // Pricing
    price_no_vat?: number;
    price_with_vat?: number;

    // Timestamps
    created_at?: string;
    updated_at?: string;
}

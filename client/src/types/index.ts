export interface Bus {
    id: number;
    name: string;
    bus_type?: string;
    from_city?: string;
    to_city?: string;
    start_time: string;
    total_seats: number;
    available_seats?: number;
    price?: number;
    bus_image?: string;
    amenities?: string;
    created_at?: string;
}

export interface Seat {
    id: number;
    bus_id: number;
    seat_number: number;
    status: 'AVAILABLE' | 'BOOKED' | 'LOCKED';
    is_women_only?: number;
    booked_by_gender?: string | null;
}

export interface BusWithSeats extends Bus {
    seats: Seat[];
}

export interface Booking {
    id: number;
    user_id: number;
    bus_id: number;
    seat_ids: number[];
    total_amount?: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    created_at: string;
}

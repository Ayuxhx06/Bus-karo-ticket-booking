import axios from 'axios';
import type { Bus, BusWithSeats, Booking } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
    // Get all buses
    getBuses: async (): Promise<Bus[]> => {
        const response = await axios.get(`${API_URL}/buses`);
        return response.data;
    },

    // Get bus details with seats
    getBusDetails: async (busId: number): Promise<BusWithSeats> => {
        const response = await axios.get(`${API_URL}/buses/${busId}`);
        return response.data;
    },

    // Create booking with passenger details
    createBooking: async (busId: number, seatIds: number[], passengerDetails?: any[]): Promise<Booking> => {
        const response = await axios.post(`${API_URL}/bookings`, {
            busId,
            seatIds,
            userId: 1, // Mock user
            passengerDetails,
        });
        return response.data;
    },

    // Admin: Create bus
    createBus: async (data: {
        name: string;
        startTime: string;
        totalSeats: number;
        bus_type: string;
        from_city: string;
        to_city: string;
        price: number;
        amenities: string;
    }) => {
        const response = await axios.post(`${API_URL}/admin/buses`, data);
        return response.data;
    },
};

const { BookingRepository } = require('../repositories/BookingRepository');

export class BookingService {
    private repository: any;

    constructor() {
        this.repository = new BookingRepository();
    }

    async createBus(data: any) {
        // Validate inputs
        if (!data.name || !data.startTime || !data.totalSeats || !data.bus_type || !data.from_city || !data.to_city) {
            throw new Error('Missing required fields');
        }

        return this.repository.createBus(
            data.name,
            data.bus_type,
            data.from_city,
            data.to_city,
            data.startTime,
            data.totalSeats,
            data.price || 1000,
            data.amenities || 'AC,WiFi'
        );
    }

    async getAllBuses() {
        return this.repository.getAllBuses();
    }

    async getBusDetails(busId: number) {
        const bus = await this.repository.getBusById(busId);
        if (!bus) throw new Error('Bus not found');
        return bus;
    }

    async createBooking(userId: number, busId: number, seatIds: number[], passengerDetails?: any[]) {
        if (!seatIds || seatIds.length === 0) {
            throw new Error('No seats selected');
        }
        return this.repository.bookSeats(userId, busId, seatIds, passengerDetails);
    }
}

const bookingService = new BookingService();
export default bookingService;

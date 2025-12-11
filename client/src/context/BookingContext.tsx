import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface BookingContextType {
    selectedSeats: number[];
    setSelectedSeats: (seats: number[]) => void;
    toggleSeat: (seatId: number) => void;
    clearSelection: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

    const toggleSeat = (seatId: number) => {
        setSelectedSeats((prev) =>
            prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
        );
    };

    const clearSelection = () => {
        setSelectedSeats([]);
    };

    return (
        <BookingContext.Provider value={{ selectedSeats, setSelectedSeats, toggleSeat, clearSelection }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBooking must be used within BookingProvider');
    }
    return context;
};

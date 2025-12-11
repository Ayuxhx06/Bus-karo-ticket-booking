import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { BusWithSeats, Seat } from '../types';
import { useBooking } from '../context/BookingContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, AlertCircle, Calendar, MapPin, User, Mail, Phone, IndianRupee, Users, Utensils } from 'lucide-react';

interface PassengerDetail {
    seatNumber: number;
    name: string;
    age: string;
    gender: 'Male' | 'Female' | '';
    meal: 'Veg' | 'Non-Veg' | 'No Meal';
}

const BookingPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { selectedSeats, toggleSeat, clearSelection } = useBooking();

    const [bus, setBus] = useState<BusWithSeats | null>(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Contact Details
    const [contactDetails, setContactDetails] = useState({
        email: user?.email || '',
        phone: '',
    });

    // Passenger Details (with gender and meal)
    const [passengers, setPassengers] = useState<PassengerDetail[]>([]);

    useEffect(() => {
        loadBusDetails();
    }, [id]);

    // Update passengers array when selected seats change
    useEffect(() => {
        if (bus) {
            const newPassengers = selectedSeats.map(seatId => {
                const seat = bus.seats.find(s => s.id === seatId);
                const existing = passengers.find(p => p.seatNumber === seat?.seat_number);
                return {
                    seatNumber: seat?.seat_number || 0,
                    name: existing?.name || '',
                    age: existing?.age || '',
                    gender: (existing?.gender || '') as 'Male' | 'Female' | '',
                    meal: existing?.meal || 'No Meal',
                };
            });
            setPassengers(newPassengers);
        }
    }, [selectedSeats, bus]);

    // Update email from auth
    useEffect(() => {
        if (user && !user.isGuest) {
            setContactDetails(prev => ({ ...prev, email: user.email }));
        }
    }, [user]);

    const loadBusDetails = async () => {
        try {
            setLoading(true);
            const data = await api.getBusDetails(Number(id));
            setBus(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        if (!bus) return 0;
        const basePrice = selectedSeats.length * (bus.price || 0);
        const mealPrice = passengers.filter(p => p.meal !== 'No Meal').length * 100; // ₹100 per meal
        return basePrice + mealPrice;
    };

    const updatePassenger = (seatNumber: number, field: keyof PassengerDetail, value: string) => {
        setPassengers(prev =>
            prev.map(p =>
                p.seatNumber === seatNumber ? { ...p, [field]: value } : p
            )
        );
    };



    const handleSeatToggle = (seat: Seat) => {
        if (seat.status !== 'AVAILABLE') return;

        // If trying to select a women-only seat
        if (seat.is_women_only && !selectedSeats.includes(seat.id)) {
            const allPassengersFemale = passengers.every(p => !p.gender || p.gender === 'Female');
            if (!allPassengersFemale && passengers.length > 0) {
                setError('Women-only seats can only be booked for female passengers. Please select female gender for all passengers.');
                return;
            }
        }

        toggleSeat(seat.id);
        setError(null);
    };

    const handleBooking = async () => {
        if (selectedSeats.length === 0) {
            setError('Please select at least one seat');
            return;
        }

        // Validate all passenger details
        const invalidPassengers = passengers.filter(p => !p.name || !p.age || !p.gender);
        if (invalidPassengers.length > 0) {
            setError('Please fill in name, age, and gender for all passengers');
            return;
        }

        // Validate women-only seats
        const womenOnlySeats = bus?.seats.filter(s => selectedSeats.includes(s.id) && s.is_women_only);
        if (womenOnlySeats && womenOnlySeats.length > 0) {
            const nonFemalePassengers = passengers.filter(p => p.gender !== 'Female');
            if (nonFemalePassengers.length > 0) {
                setError('Women-only seats can only be booked for female passengers');
                return;
            }
        }

        // Validate ages
        const invalidAges = passengers.filter(p => parseInt(p.age) < 1 || parseInt(p.age) > 120);
        if (invalidAges.length > 0) {
            setError('Please enter valid ages (1-120)');
            return;
        }

        if (!contactDetails.email || !contactDetails.phone) {
            setError('Please provide contact email and phone number');
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(contactDetails.email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (!/^\d{10}$/.test(contactDetails.phone)) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        try {
            setBooking(true);
            setError(null);
            await api.createBooking(Number(id), selectedSeats, passengers);
            setSuccess(true);
            await loadBusDetails(); // Refresh to show booked seats immediately
            clearSelection();

            setContactDetails({ email: user?.email || '', phone: '' });
            setPassengers([]);

            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err: any) {
            if (err.response?.data?.error?.includes('not available')) {
                setError('⚠️ Seats were just booked by another user. Please select different seats.');
            } else {
                setError(err.response?.data?.error || 'Booking failed');
            }
            loadBusDetails();
            clearSelection();
        } finally {
            setBooking(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600"></div>
            </div>
        );
    }

    if (!bus) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600">Bus not found</p>
            </div>
        );
    }

    const totalPrice = calculateTotal();
    const mealCount = passengers.filter(p => p.meal !== 'No Meal').length;

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={24} className="text-gray-700" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">{bus.name}</h1>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-red-600" />
                                    {bus.from_city} → {bus.to_city}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-red-600" />
                                    {new Date(bus.start_time).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
                    >
                        <CheckCircle2 className="text-green-600" />
                        <div>
                            <span className="text-green-800 font-medium">Booking confirmed!</span>
                            <p className="text-sm text-green-700 mt-1">Tickets will be sent to {contactDetails.email}</p>
                        </div>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
                    >
                        <AlertCircle className="text-red-600" />
                        <span className="text-red-800 font-medium">{error}</span>
                    </motion.div>
                )}

                {!isAuthenticated && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <User className="text-blue-600" />
                            <span className="text-blue-800">Not logged in? You can still book as a guest!</span>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                        >
                            Login
                        </button>
                    </motion.div>
                )}

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left - Seat Selection */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Your Seats</h2>

                            {/* Driver */}
                            <div className="mb-6 flex justify-end">
                                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center text-white text-xs font-semibold shadow-lg">
                                    Driver
                                </div>
                            </div>

                            {/* Seats Grid */}
                            <div className="grid grid-cols-4 gap-3 max-w-md mx-auto mb-6">
                                {bus.seats.map((seat) => (
                                    <SeatButton
                                        key={seat.id}
                                        seat={seat}
                                        isSelected={selectedSeats.includes(seat.id)}
                                        onToggle={() => handleSeatToggle(seat)}
                                    />
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="flex gap-4 justify-center flex-wrap border-t border-gray-200 pt-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-500 rounded-lg"></div>
                                    <span className="text-gray-700">Available</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-pink-500 rounded-lg"></div>
                                    <span className="text-gray-700">Women Only</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-red-600 rounded-lg"></div>
                                    <span className="text-gray-700">Selected</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-400 rounded-lg"></div>
                                    <span className="text-gray-700">Booked</span>
                                </div>
                            </div>
                        </div>

                        {/* Passenger Details */}
                        {selectedSeats.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Users size={24} className="text-red-600" />
                                    Passenger Details
                                </h2>

                                <AnimatePresence>
                                    {passengers.map((passenger) => (
                                        <motion.div
                                            key={passenger.seatNumber}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mb-4 pb-4 border-b border-gray-200 last:border-0"
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white ${bus.seats.find(s => s.seat_number === passenger.seatNumber)?.is_women_only
                                                    ? 'bg-pink-500'
                                                    : 'bg-red-600'
                                                    }`}>
                                                    {passenger.seatNumber}
                                                </div>
                                                <span className="font-semibold text-gray-700">
                                                    Seat {passenger.seatNumber}
                                                    {bus.seats.find(s => s.seat_number === passenger.seatNumber)?.is_women_only && (
                                                        <span className="ml-2 text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">Women Only</span>
                                                    )}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Passenger Name *</label>
                                                    <input
                                                        type="text"
                                                        value={passenger.name}
                                                        onChange={(e) => updatePassenger(passenger.seatNumber, 'name', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 focus:outline-none"
                                                        placeholder="John Doe"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Age *</label>
                                                    <input
                                                        type="number"
                                                        value={passenger.age}
                                                        onChange={(e) => updatePassenger(passenger.seatNumber, 'age', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 focus:outline-none"
                                                        placeholder="25"
                                                        min="1"
                                                        max="120"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Gender *</label>
                                                    <select
                                                        value={passenger.gender}
                                                        onChange={(e) => updatePassenger(passenger.seatNumber, 'gender', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 focus:outline-none"
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                        <Utensils size={12} className="inline mr-1" />
                                                        Meal (+₹100)
                                                    </label>
                                                    <select
                                                        value={passenger.meal}
                                                        onChange={(e) => updatePassenger(passenger.seatNumber, 'meal', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 focus:outline-none"
                                                    >
                                                        <option value="No Meal">No Meal</option>
                                                        <option value="Veg">Veg Meal</option>
                                                        <option value="Non-Veg">Non-Veg Meal</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Right - Contact & Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Mail size={14} className="inline mr-1" />
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={contactDetails.email}
                                        onChange={(e) => setContactDetails({ ...contactDetails, email: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 focus:outline-none"
                                        placeholder="john@example.com"
                                        disabled={!!user && !user.isGuest}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Phone size={14} className="inline mr-1" />
                                        Phone *
                                    </label>
                                    <input
                                        type="tel"
                                        value={contactDetails.phone}
                                        onChange={(e) => setContactDetails({ ...contactDetails, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 focus:outline-none"
                                        placeholder="9876543210"
                                        maxLength={10}
                                    />
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="border-t border-gray-200 pt-4 mb-6">
                                <h3 className="font-bold text-gray-900 mb-3">Booking Summary</h3>

                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Seats:</span>
                                        <span className="font-semibold">{passengers.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ticket Price:</span>
                                        <span className="font-semibold">₹{(bus.price || 0) * passengers.length}</span>
                                    </div>
                                    {mealCount > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Meals ({mealCount}):</span>
                                            <span className="font-semibold">₹{mealCount * 100}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-700">Total:</span>
                                        <div className="flex items-center gap-1">
                                            <IndianRupee size={20} className="text-red-600" />
                                            <span className="text-3xl font-bold text-red-600">{totalPrice}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={
                                    selectedSeats.length === 0 ||
                                    booking ||
                                    passengers.some(p => !p.name || !p.age || !p.gender) ||
                                    !contactDetails.email ||
                                    !contactDetails.phone
                                }
                                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg transition-all shadow-lg hover:shadow-xl"
                            >
                                {booking ? 'Processing...' : `Pay ₹${totalPrice} & Confirm`}
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-3">
                                Tickets sent to email instantly
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Seat Button Component
const SeatButton: React.FC<{
    seat: Seat;
    isSelected: boolean;
    onToggle: () => void;
}> = ({ seat, isSelected, onToggle }) => {
    const isBooked = seat.status === 'BOOKED';
    const isWomenOnly = seat.is_women_only === 1;
    const isBookedByFemale = seat.booked_by_gender === 'Female';

    return (
        <motion.button
            whileHover={!isBooked ? { scale: 1.05 } : {}}
            whileTap={!isBooked ? { scale: 0.95 } : {}}
            onClick={() => !isBooked && onToggle()}
            disabled={isBooked}
            className={`
        h-14 rounded-lg font-bold text-sm transition-all shadow-md
        ${isBooked && isBookedByFemale ? 'bg-pink-500 cursor-not-allowed text-white' : ''}
        ${isBooked && !isBookedByFemale ? 'bg-gray-400 cursor-not-allowed text-white' : ''}
        ${!isBooked && !isSelected && !isWomenOnly ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
        ${!isBooked && !isSelected && isWomenOnly ? 'bg-pink-500 hover:bg-pink-600 text-white' : ''}
        ${isSelected ? 'bg-red-600 text-white shadow-lg ring-2 ring-red-600 ring-offset-2' : ''}
      `}
        >
            {seat.seat_number}
        </motion.button>
    );
};

export default BookingPage;

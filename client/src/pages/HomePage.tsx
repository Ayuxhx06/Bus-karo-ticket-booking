import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Bus } from '../types';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowRight, Star, Shield, Clock, Wifi, Zap, Coffee, Search, Filter } from 'lucide-react';

const HomePage: React.FC = () => {
    const [buses, setBuses] = useState<Bus[]>([]);
    const [filteredBuses, setFilteredBuses] = useState<Bus[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Filter states
    const [filters, setFilters] = useState({
        fromCity: '',
        toCity: '',
        date: '',
        busType: '',
    });

    useEffect(() => {
        loadBuses();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [buses, filters]);

    const loadBuses = async () => {
        try {
            const data = await api.getBuses();
            setBuses(data);
        } catch (error) {
            console.error('Failed to load buses', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...buses];

        if (filters.fromCity) {
            result = result.filter(bus =>
                bus.from_city?.toLowerCase().includes(filters.fromCity.toLowerCase())
            );
        }

        if (filters.toCity) {
            result = result.filter(bus =>
                bus.to_city?.toLowerCase().includes(filters.toCity.toLowerCase())
            );
        }

        if (filters.date) {
            result = result.filter(bus => {
                const busDate = new Date(bus.start_time).toISOString().split('T')[0];
                return busDate === filters.date;
            });
        }

        if (filters.busType) {
            result = result.filter(bus =>
                bus.bus_type?.toLowerCase().includes(filters.busType.toLowerCase())
            );
        }

        setFilteredBuses(result);
    };

    const clearFilters = () => {
        setFilters({
            fromCity: '',
            toCity: '',
            date: '',
            busType: '',
        });
    };

    const getAmenityIcon = (amenity: string) => {
        const icons: Record<string, any> = {
            'WiFi': Wifi,
            'AC': Shield,
            'Charging': Zap,
            'Snacks': Coffee,
            'Meals': Coffee,
        };
        return icons[amenity] || Star;
    };

    // Get unique cities and bus types for filter dropdowns
    const cities = Array.from(new Set(buses.flatMap(b => [b.from_city, b.to_city]).filter(Boolean)));
    const busTypes = Array.from(new Set(buses.map(b => b.bus_type).filter(Boolean)));

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Compact Hero Section */}
            <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M30 0v60M0 30h60' stroke='%23fff' stroke-width='1' opacity='0.1'/%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }}></div>
                </div>

                <div className="container mx-auto px-6 py-12 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Journey Begins Here</h1>
                        <p className="text-lg text-red-100">Premium Bus Services Across India</p>
                    </motion.div>
                </div>
            </div>

            {/* Compact Features */}
            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[
                        { icon: Shield, title: '100% Safe', desc: 'Verified & sanitized', color: 'red' },
                        { icon: Clock, title: 'On-Time', desc: '98% punctuality', color: 'blue' },
                        { icon: Star, title: 'Top Rated', desc: '4.8★ from 50K+', color: 'yellow' },
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                            className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:border-red-200 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center`}>
                                    <feature.icon className={`text-${feature.color === 'red' ? 'red' : feature.color === 'blue' ? 'blue' : 'yellow'}-600`} size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{feature.title}</h3>
                                    <p className="text-sm text-gray-600">{feature.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Search Filter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Filter className="text-red-600" size={24} />
                        <h2 className="text-2xl font-bold text-gray-900">Search Buses</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* From City */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <MapPin size={14} className="inline mr-1" />
                                From City
                            </label>
                            <select
                                value={filters.fromCity}
                                onChange={(e) => setFilters({ ...filters, fromCity: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 focus:outline-none transition-all"
                            >
                                <option value="">All Cities</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        {/* To City */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <MapPin size={14} className="inline mr-1" />
                                To City
                            </label>
                            <select
                                value={filters.toCity}
                                onChange={(e) => setFilters({ ...filters, toCity: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 focus:outline-none transition-all"
                            >
                                <option value="">All Cities</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Calendar size={14} className="inline mr-1" />
                                Date
                            </label>
                            <input
                                type="date"
                                value={filters.date}
                                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 focus:outline-none transition-all"
                            />
                        </div>

                        {/* Bus Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Bus Type
                            </label>
                            <select
                                value={filters.busType}
                                onChange={(e) => setFilters({ ...filters, busType: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 focus:outline-none transition-all"
                            >
                                <option value="">All Types</option>
                                {busTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Button */}
                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all border border-gray-300"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="mt-4 text-sm text-gray-600">
                        <Search size={16} className="inline mr-1" />
                        Found <span className="font-bold text-red-600">{filteredBuses.length}</span> buses
                    </div>
                </motion.div>

                {/* Compact Bus Cards - 3 columns on desktop */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Available Routes</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredBuses.map((bus, index) => {
                            const amenities = bus.amenities?.split(',') || [];
                            return (
                                <motion.div
                                    key={bus.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1, duration: 0.4 }}
                                    onClick={() => navigate(`/booking/${bus.id}`)}
                                    className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:border-red-300 group"
                                >
                                    {/* Compact Image Header with Animation */}
                                    <div className="relative h-32 bg-gradient-to-br from-red-500 to-red-700 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>

                                        {/* Animated Bus Icon */}
                                        <div className="absolute inset-0 flex items-center justify-center z-5">
                                            <motion.div
                                                animate={{ x: [0, 10, 0] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                className="text-white/20 text-6xl"
                                            >
                                                🚌
                                            </motion.div>
                                        </div>

                                        {/* Compact Route Badge */}
                                        <div className="absolute top-3 left-3 z-20">
                                            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-gray-900">{bus.from_city}</span>
                                                    <ArrowRight size={12} className="text-red-600" />
                                                    <span className="font-bold text-gray-900">{bus.to_city}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rating */}
                                        <div className="absolute top-3 right-3 z-20">
                                            <div className="bg-yellow-400 rounded-lg px-2 py-1 shadow-md flex items-center gap-1">
                                                <Star size={12} fill="white" className="text-white" />
                                                <span className="font-bold text-white text-xs">4.8</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Compact Body */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">{bus.name}</h3>
                                                <div className="flex items-center gap-1.5 text-red-600 text-xs font-semibold bg-red-50 px-2 py-1 rounded-full w-fit">
                                                    <Shield size={12} />
                                                    {bus.bus_type}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">From</p>
                                                <p className="text-xl font-bold text-red-600">₹{bus.price}</p>
                                            </div>
                                        </div>

                                        {/* Mini Amenities */}
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {amenities.slice(0, 3).map((amenity, i) => {
                                                const Icon = getAmenityIcon(amenity.trim());
                                                return (
                                                    <div key={i} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">
                                                        <Icon size={10} className="text-red-600" />
                                                        <span>{amenity.trim()}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Compact Info */}
                                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-red-600" />
                                                <div>
                                                    <div className="font-semibold text-gray-900">
                                                        {new Date(bus.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </div>
                                                    <div className="text-gray-600 text-xs">
                                                        {new Date(bus.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <Users size={14} className="text-red-600" />
                                                <div>
                                                    <div className="font-bold text-green-600">{bus.available_seats || bus.total_seats}</div>
                                                    <div className="text-gray-600 text-xs">seats left</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Compact Button */}
                                        <button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2 rounded-lg transition-all text-sm flex items-center justify-center gap-2">
                                            Select Seats
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {filteredBuses.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-gray-200">
                            <Search size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500 text-xl font-semibold">No buses found</p>
                            <p className="text-gray-400 mt-2">Try adjusting your filters</p>
                            <button
                                onClick={clearFilters}
                                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;

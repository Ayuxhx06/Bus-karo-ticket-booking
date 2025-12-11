import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bus, Shield, LogIn, LogOut, User } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const { user, logout, isAuthenticated } = useAuth();

    return (
        <nav className="bg-red-600 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                        <Bus size={32} className="text-white" />
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Bus Karo</h1>
                            <p className="text-xs text-red-100">Premium Bus Booking</p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${location.pathname === '/'
                                ? 'bg-white text-red-600'
                                : 'hover:bg-red-700'
                                }`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/admin"
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${location.pathname === '/admin'
                                ? 'bg-white text-red-600'
                                : 'hover:bg-red-700'
                                }`}
                        >
                            <Shield size={18} />
                            Admin
                        </Link>

                        {/* User Section */}
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3 border-l border-red-500 pl-4 ml-2">
                                <div className="flex items-center gap-2 bg-red-700 px-3 py-2 rounded-lg">
                                    <User size={18} />
                                    <span className="font-medium text-sm">{user?.name}</span>
                                    {user?.isGuest && <span className="text-xs bg-red-800 px-2 py-0.5 rounded">Guest</span>}
                                </div>
                                <button
                                    onClick={logout}
                                    className="px-3 py-2 hover:bg-red-700 rounded-lg transition-all flex items-center gap-2"
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="px-4 py-2 bg-white text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-all flex items-center gap-2"
                            >
                                <LogIn size={18} />
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

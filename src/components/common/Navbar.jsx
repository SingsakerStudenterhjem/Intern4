import React, {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';

const Navbar = () => {
    const {user, logout} = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="bg-white shadow px-8 py-2 flex justify-between items-center">
            <div className="text-xl font-semibold">
                <Link to="/">Internsiden</Link>
            </div>
            <div className="flex items-center space-x-6">
                {user ? (
                    <>
                        <Link to="/dashboard" className="hover:text-blue-500">Dashboard</Link>

                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen(open => !open)}
                                className="hover:text-blue-500 flex items-center space-x-1"
                            >
                                <span>Regi</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M19 9l-7 7-7-7"/>
                                </svg>
                            </button>

                            {menuOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-10">
                                    <Link
                                        to="/regi"
                                        className="block px-4 py-2 hover:bg-gray-100"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Regi
                                    </Link>
                                    <Link
                                        to="/tasks"
                                        className="block px-4 py-2 hover:bg-gray-100"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Oppgaver
                                    </Link>
                                    {/* TODO: add conditional link to regisjef page if user role is regisjef */}
                                </div>
                            )}
                        </div>

                        <span className="border-l border-gray-300 h-6"/>

                        <button onClick={logout} className="hover:text-blue-500">Logg ut</button>
                    </>
                ) : (
                    <Link to="/login" className="hover:text-blue-500">Logg inn</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
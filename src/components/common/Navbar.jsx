import React, {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';
import RegiMenu from "./RegiMenu";

const Navbar = () => {
    const {user, logout} = useAuth();
    const [, setMenuOpen] = useState(false);
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

                        <RegiMenu/>

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
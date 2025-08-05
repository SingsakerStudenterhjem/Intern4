import React, {useEffect, useRef, useState} from "react";
import {Link} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth";
import {USER_ROLES} from "../../constants/userRoles";

const DropdownMenu = ({label, items}) => {
    const {user} = useAuth();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = e => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // only include items with no roles restriction or where user.role is allowed
    const visible = items.filter(item => {
        if (!item.roles) return true;
        if (!user) return false;
        return item.roles.includes(user.role) || item.roles.includes(USER_ROLES.DATA);
    });

    if (visible.length === 0) return null;

    return (
        <div className="relative" ref={ref}>
            <button
                aria-expanded={open}
                onClick={() => setOpen(o => !o)}
                className="flex items-center hover:text-blue-500"
            >
                {label}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
            </button>
            {open && (
                <ul className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-10">
                    {visible.map(({label, to}) => (
                        <li key={to}>
                            <Link
                                to={to}
                                onClick={() => setOpen(false)}
                                className="block px-4 py-2 hover:bg-gray-100"
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DropdownMenu;
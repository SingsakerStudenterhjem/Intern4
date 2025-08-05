import React, {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router-dom';

const RegiMenu = () => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onClick = e => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                aria-expanded={open}
                onClick={() => setOpen(open => !open)}
                className="flex items-center hover:text-blue-500"
            >
                Regi
                {/* TODO: Use a good icon library */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M19 9l-7 7-7-7"/>
                </svg>
            </button>
            {open && (
                <ul className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg">
                    <li><Link to="/regi" onClick={() => setOpen(false)}
                              className="block px-4 py-2 hover:bg-gray-100">Regi</Link></li>
                    <li><Link to="/tasks" onClick={() => setOpen(false)}
                              className="block px-4 py-2 hover:bg-gray-100">Oppgaver</Link></li>
                    {/* TODO: add conditional link to regisjef page if user role is regisjef */}
                </ul>
            )}
        </div>
    );
};

export default RegiMenu;
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";
import { USER_ROLES } from "../../constants/userRoles";
import DropdownMenu from "./DropdownMenu";
import { Menu, X, ChevronDown } from "lucide-react";
import { loggUt } from "../../backend/src/authentication";

const Navbar = () => {
    const user = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openSections, setOpenSections] = useState({});

    const toggleSection = key =>
        setOpenSections(s => ({ ...s, [key]: !s[key] }));

    const handleLogout = async () => {
        try {
            await loggUt();
        } catch (error) {
            console.error("Logout failed:", error);
        }
        setMobileOpen(false);
    };

    const menuItems = [
        { key: "dash", label: "Dashboard", to: ROUTES.DASHBOARD },
        {
            key: "regi",
            label: "Regi",
            children: [
                { label: "Regi", to: ROUTES.REGI },
                { label: "Oppgaver", to: ROUTES.TASKS },
                {
                    label: "Godkjenn Arbeid",
                    to: "/regisjef",
                    roles: [USER_ROLES.REGISJEF, USER_ROLES.DATA],
                },
            ],
        },
        {
            key: "admin",
            label: "Admin",
            to: ROUTES.ADMIN,
            roles: [USER_ROLES.DATA],
        },
    ];

    const visibleItems = menuItems.filter(item => {
        if (!item.roles) return true;
        if (!user) return false;
        return item.roles.includes(user.role) | item.roles.includes(USER_ROLES.DATA);
    });

    return (
        <nav className="bg-white shadow px-8 py-2 flex justify-between items-center relative">
            <div className="text-xl font-semibold">
                <Link to="/">Internsiden</Link>
            </div>

            {user && (
                <button
                    onClick={() => setMobileOpen(o => !o)}
                    className="md:hidden p-2"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            )}

            <div className="hidden md:flex items-center space-x-6">
                {user ? (
                    <>
                        <Link to={ROUTES.DASHBOARD} className="hover:text-blue-500">
                            Dashboard
                        </Link>

                        <DropdownMenu label="Regi" items={menuItems.find(i => i.key === "regi").children} />

                        <Link to={ROUTES.ADMIN} className="hover:text-blue-500">
                            Admin
                        </Link>

                        <span className="border-l border-gray-300 h-6" />

                        <button onClick={handleLogout} className="hover:text-blue-500">
                            Logg ut
                        </button>
                    </>
                ) : (
                    <Link to={ROUTES.LOGIN} className="hover:text-blue-500">
                        Logg inn
                    </Link>
                )}
            </div>

            {user && mobileOpen && (
                <div className="absolute top-full inset-x-0 bg-white shadow-md p-4 md:hidden">
                    <ul className="space-y-2">
                        {visibleItems.map(item => (
                            <li key={item.key}>
                                {item.children ? (
                                    <>
                                        <button
                                            onClick={() => toggleSection(item.key)}
                                            className="w-full flex justify-between items-center py-2"
                                        >
                                            {item.label}
                                            <ChevronDown
                                                className={`w-5 h-5 transform transition-transform ${
                                                    openSections[item.key] ? "rotate-180" : ""
                                                }`}
                                            />
                                        </button>
                                        {openSections[item.key] && (
                                            <ul className="pl-4 space-y-1">
                                                {item.children.map(child => (
                                                    <li key={child.to}>
                                                        <Link
                                                            to={child.to}
                                                            onClick={() => setMobileOpen(false)}
                                                            className="block py-1"
                                                        >
                                                            {child.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        to={item.to}
                                        onClick={() => setMobileOpen(false)}
                                        className="block py-2"
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        ))}

                        <li>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMobileOpen(false);
                                }}
                                className="w-full text-left py-2"
                            >
                                Logg ut
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
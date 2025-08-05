import React from "react";
import {Link} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth";
import {ROUTES} from "../../constants/routes";
import {USER_ROLES} from "../../constants/userRoles";
import DropdownMenu from "./DropdownMenu";

const Navbar = () => {
    const {user, logout} = useAuth();

    return (
        <nav className="bg-white shadow px-8 py-2 flex justify-between items-center">
            <div className="text-xl font-semibold">
                <Link to="/">Internsiden</Link>
            </div>
            <div className="flex items-center space-x-6">
                {user ? (
                    <>
                        <Link to={ROUTES.DASHBOARD} className="hover:text-blue-500">Dashboard</Link>

                        <DropdownMenu
                            label="Regi"
                            items={[
                                {label: "Regi", to: ROUTES.REGI},
                                {label: "Oppgaver", to: ROUTES.TASKS},
                                {
                                    label: "Godkjenn Arbeid",
                                    to: "/regisjef",
                                    roles: [USER_ROLES.REGISJEF, USER_ROLES.DATA]
                                }
                            ]}
                        />

                        <span className="border-l border-gray-300 h-6"/>

                        <button onClick={logout} className="hover:text-blue-500">Logg ut</button>
                    </>
                ) : (
                    <Link to={ROUTES.LOGIN} className="hover:text-blue-500">Logg inn</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { USER_ROLES } from '../../constants/userRoles';
import DropdownMenu from './DropdownMenu';
import { ChevronDown, Menu, X } from 'lucide-react';
import { logOut } from '../../../server/dao/authentication';

const Navbar = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (key) => setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const handleLogout = async () => {
    const result = await logOut();
    setMobileOpen(false);
  };

  const menuItems = [
    { key: 'dash', label: 'Dashboard', to: ROUTES.DASHBOARD },
    {
      key: 'regi',
      label: 'Regi',
      children: [
        { label: 'Min regi', to: ROUTES.REGI },
        { label: 'Oppgaver', to: ROUTES.TASKS },
        {
          label: 'Regisjef',
          to: ROUTES.REGISJEF,
          roles: [USER_ROLES.ADMIN, USER_ROLES.WORKMANAGER, USER_ROLES.DATA],
        },
      ],
    },
    {
      key: 'rom',
      label: 'Rom',
      roles: [USER_ROLES.ADMIN, USER_ROLES.ROOMMANAGER, USER_ROLES.DATA],
      children: [
        {
          label: 'Legg til beboer',
          to: ROUTES.LEGG_TIL_BEBOER,
          roles: [USER_ROLES.ADMIN, USER_ROLES.ROOMMANAGER, USER_ROLES.DATA],
        },
      ],
    },
    {
      key: 'admin',
      label: 'Admin',
      to: ROUTES.ADMIN,
      roles: [USER_ROLES.DATA],
    },
  ];

  const canAccess = (roles) => {
    if (!roles) return true;
    if (!user) return false;
    return roles.includes(user.role);
  };

  const visibleItems = menuItems
    .map((item) => {
      if (item.children) {
        const visibleChildren = item.children.filter((child) => canAccess(child.roles));
        if (!canAccess(item.roles) || visibleChildren.length === 0) return null;
        return { ...item, children: visibleChildren };
      }
      return canAccess(item.roles) ? item : null;
    })
    .filter(Boolean);

  return (
    <nav className="bg-white shadow px-8 py-2 flex justify-between items-center relative">
      <div className="text-xl font-semibold">
        <Link to="/">Internsiden</Link>
      </div>

      {user && (
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="md:hidden p-2"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

      <div className="hidden md:flex items-center space-x-6">
        {user ? (
          <>
            {visibleItems.map((item) =>
              item.children ? (
                <DropdownMenu key={item.key} label={item.label} items={item.children} />
              ) : (
                <Link key={item.key} to={item.to} className="hover:text-blue-500">
                  {item.label}
                </Link>
              )
            )}

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
            {visibleItems.map((item) => (
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
                          openSections[item.key] ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openSections[item.key] && (
                      <ul className="pl-4 space-y-1">
                        {item.children.map((child) => (
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
                  <Link to={item.to} onClick={() => setMobileOpen(false)} className="block py-2">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}

            <li>
              <button onClick={handleLogout} className="w-full text-left py-2">
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

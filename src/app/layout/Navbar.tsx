import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../providers/AuthContext';
import DropdownMenu from './DropdownMenu';
import { ChevronDown, Menu, UserCircle, X } from 'lucide-react';
import { logOut } from '../../server/dao/authentication';
import { appNavigation } from './navigation';
import type { FeatureNavItem } from '../../shared/types/feature';
import { APP_ROUTES } from '../constants/appRoutes';
import { AUTH_PATHS } from '../../features/auth/paths';
import { USER_PATHS } from '../../features/users/paths';

const Navbar = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const toggleSection = (key: string) =>
    setOpenSections((sections) => ({
      ...sections,
      [key]: !sections[key],
    }));

  const handleLogout = async () => {
    await logOut();
    setMobileOpen(false);
    setUserMenuOpen(false);
  };

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target;

      if (userMenuRef.current && target instanceof Node && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const canAccess = (item: Pick<FeatureNavItem, 'canAccess'>) =>
    item.canAccess ? item.canAccess({ user }) : true;

  const visibleItems = appNavigation.reduce<FeatureNavItem[]>((items, item) => {
    if (item.children) {
      const visibleChildren = item.children.filter((child) => canAccess(child));
      if (!canAccess(item) || visibleChildren.length === 0) {
        return items;
      }

      items.push({ ...item, children: visibleChildren });
      return items;
    }

    if (canAccess(item)) {
      items.push(item);
    }

    return items;
  }, []);

  return (
    <nav className="relative z-40 bg-white shadow px-8 py-2 flex justify-between items-center">
      <div className="text-xl font-semibold">
        <Link to={APP_ROUTES.HOME}>Internsiden</Link>
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

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
              >
                <div className="flex items-center gap-2 text-left">
                  <UserCircle className="w-6 h-6 text-gray-600" />
                  <div className="text-sm leading-tight">
                    <div className="font-semibold text-gray-900 truncate max-w-[140px]">
                      {user.name || 'Bruker'}
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <Link
                    to={USER_PATHS.PROFILE}
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Logg ut
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to={AUTH_PATHS.LOGIN} className="hover:text-blue-500">
            Logg inn
          </Link>
        )}
      </div>

      {user && mobileOpen && (
        <div className="absolute top-full inset-x-0 z-50 bg-white shadow-md p-4 md:hidden">
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
          <div className="border-t border-gray-200 pt-3 mt-3 text-sm text-gray-700">
            <div className="mb-2">
              <div className="font-semibold">{user.name || 'Bruker'}</div>
              <div className="text-gray-500">{user.email || ''}</div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={USER_PATHS.PROFILE}
                onClick={() => setMobileOpen(false)}
                className="text-blue-600"
              >
                Profil
              </Link>
              <button onClick={handleLogout} className="text-left text-red-600">
                Logg ut
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

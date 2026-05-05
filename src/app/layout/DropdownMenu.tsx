import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LucideChevronDown } from 'lucide-react';

type DropdownItem = {
  label: string;
  to: string;
};

type DropdownMenuProps = {
  label: string;
  items: DropdownItem[];
};

const DropdownMenu = ({ label, items }: DropdownMenuProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;

      if (ref.current && target instanceof Node && !ref.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        aria-expanded={open}
        onClick={() => setOpen((open) => !open)}
        className="flex items-center hover:text-blue-500"
      >
        {label}
        <LucideChevronDown className="w-6 h-6" strokeWidth={1.5} />
      </button>
      {open && (
        <ul className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-10">
          {items.map(({ label, to }) => (
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

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProtectedRoute from './ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('../providers/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a loading state while auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <MemoryRouter initialEntries={['/regi']}>
        <ProtectedRoute>
          <div>Beskyttet innhold</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Laster...')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/regi']}>
        <Routes>
          <Route
            path="/regi"
            element={
              <ProtectedRoute>
                <div>Beskyttet innhold</div>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });

  it('blocks access when the user lacks an allowed role', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Ola',
        role: 'Halv/Halv',
      },
      loading: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['Regisjef']}>
          <div>Beskyttet innhold</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Ingen tilgang')).toBeInTheDocument();
    expect(screen.queryByText('Beskyttet innhold')).not.toBeInTheDocument();
  });

  it('renders children when the user is authenticated and authorized', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Kari',
        role: 'Regisjef',
      },
      loading: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['Regisjef']}>
          <div>Beskyttet innhold</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Beskyttet innhold')).toBeInTheDocument();
  });
});

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { UserMinus, UserPlus } from 'lucide-react';
import { PageLayout } from '../../../shared/layouts';
import {
  deleteUser,
  getSchools,
  getStudies,
  getRoles,
  getAllUsersWithRole,
} from '../../../server/dao/userDAO';
import { BasicUserWithRole, Role } from '../../../shared/types/user';
import { LookupOption } from '../../../shared/types/lookup';
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  SearchInput,
  Select,
  Skeleton,
  StatusMessage,
} from '../../../shared/components';
import NewUserModal, { CreatedUser } from '../components/NewUserModal';
import CreatedUserDialog from '../components/CreatedUserDialog';

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

const UserStatusBadge = ({ user }: { user: BasicUserWithRole }) =>
  user.onLeave ? (
    <Badge tone="warning">Permisjon</Badge>
  ) : user.isActive ? (
    <Badge tone="success">Aktiv</Badge>
  ) : (
    <Badge>Inaktiv</Badge>
  );

const canDeactivate = (user: BasicUserWithRole) => user.role !== 'Admin' && user.isActive;

const AddUserPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [schools, setSchools] = useState<LookupOption[]>([]);
  const [studies, setStudies] = useState<LookupOption[]>([]);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [users, setUsers] = useState<BasicUserWithRole[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<BasicUserWithRole | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      setUsers(await getAllUsersWithRole());
    } catch (err) {
      console.error('Failed to load users:', err);
      setMessage({ type: 'error', text: 'Kunne ikke laste brukere.' });
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    getRoles()
      .then(setRoles)
      .catch((err) => console.error('Failed to load roles:', err))
      .finally(() => setRolesLoading(false));

    Promise.all([getSchools(), getStudies()])
      .then(([schoolOptions, studyOptions]) => {
        setSchools(schoolOptions);
        setStudies(studyOptions);
      })
      .catch((err) => console.error('Failed to load study lookups:', err))
      .finally(() => setLookupsLoading(false));

    void loadUsers();
  }, [loadUsers]);

  const availableRoles = useMemo(
    () => Array.from(new Set(users.map((u) => u.role).filter(Boolean))).sort() as string[],
    [users]
  );

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchesQuery =
        !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [users, query, roleFilter]);

  const handleCreated = (user: CreatedUser) => {
    setShowAddForm(false);
    setMessage({ type: 'success', text: `${user.name} ble lagt til.` });
    setCreatedUser(user);
    void loadUsers();
  };

  const handleDeleteUser = async (user: BasicUserWithRole) => {
    setIsDeleting(true);
    try {
      await deleteUser(user.id);
      setMessage({ type: 'success', text: `${user.name} ble deaktivert.` });
      setDeleteConfirm(null);
      await loadUsers();
    } catch (err) {
      setDeleteConfirm(null);
      setMessage({ type: 'error', text: getErrorMessage(err, 'Kunne ikke deaktivere bruker') });
    } finally {
      setIsDeleting(false);
    }
  };

  const deactivateButton = (user: BasicUserWithRole, withLabel = false) =>
    canDeactivate(user) ? (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDeleteConfirm(user)}
        aria-label={`Deaktiver ${user.name}`}
        icon={<UserMinus aria-hidden="true" className="h-4 w-4" />}
        className="text-danger hover:bg-danger-subtle hover:text-danger"
      >
        {withLabel ? 'Deaktiver' : null}
      </Button>
    ) : null;

  return (
    <PageLayout
      title="Administrer brukere"
      description="Oversikt over brukere og opprett nye."
      actions={
        <Button
          icon={<UserPlus aria-hidden="true" className="h-4 w-4" />}
          onClick={() => setShowAddForm(true)}
        >
          Ny bruker
        </Button>
      }
    >
      {message && (
        <StatusMessage
          tone={message.type === 'success' ? 'success' : 'error'}
          onDismiss={() => setMessage(null)}
        >
          {message.text}
        </StatusMessage>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Søk etter navn eller e-post..."
          label="Søk etter brukere"
          className="flex-1"
        />
        <Select
          aria-label="Filtrer på rolle"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="sm:w-56"
        >
          <option value="all">Alle roller</option>
          {availableRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </Select>
      </div>

      {usersLoading ? (
        <div aria-busy="true" className="space-y-3">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-20 rounded-2xl md:h-12" />
          ))}
        </div>
      ) : (
        <DataTable
          rows={filteredUsers}
          getRowKey={(user) => user.id}
          emptyMessage="Ingen brukere funnet."
          renderCard={(user) => (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <p className="font-semibold">{user.name}</p>
                <p className="truncate text-sm text-subtle">{user.email}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="primary">{user.role ?? 'Ingen rolle'}</Badge>
                  <UserStatusBadge user={user} />
                </div>
              </div>
              {deactivateButton(user, true)}
            </div>
          )}
          columns={[
            {
              key: 'name',
              header: 'Navn',
              className: 'font-medium',
              render: (user) => user.name,
            },
            { key: 'email', header: 'E-post', render: (user) => user.email },
            {
              key: 'role',
              header: 'Rolle',
              render: (user) => <Badge tone="primary">{user.role ?? 'Ingen rolle'}</Badge>,
            },
            { key: 'status', header: 'Status', render: (user) => <UserStatusBadge user={user} /> },
            {
              key: 'actions',
              header: <span className="sr-only">Handlinger</span>,
              render: (user) => deactivateButton(user),
            },
          ]}
        />
      )}

      {!usersLoading && (
        <p className="text-sm text-subtle">
          Viser {filteredUsers.length} av {users.length} brukere
        </p>
      )}

      <NewUserModal
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        onCreated={handleCreated}
        roles={roles}
        rolesLoading={rolesLoading}
        schools={schools}
        studies={studies}
        lookupsLoading={lookupsLoading}
      />

      <CreatedUserDialog user={createdUser} onClose={() => setCreatedUser(null)} />

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Deaktivere bruker?"
        confirmLabel="Deaktiver"
        tone="danger"
        loading={isDeleting}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && void handleDeleteUser(deleteConfirm)}
      >
        <strong className="text-fg">{deleteConfirm?.name}</strong> mister innloggingen, men
        historikken beholdes.
      </ConfirmDialog>
    </PageLayout>
  );
};

export default AddUserPage;

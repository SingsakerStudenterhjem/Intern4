export const IMPORTABLE_FIELDS = [
  'name',
  'email',
  'phone',
  'birthDate',
  'roomNumber',
  'role',
  'study',
  'studyPlace',
  'seniority',
  'onLeave',
  'isActive',
  'street',
  'postalCode',
  'city',
  'country',
] as const;

export type ImportableField = (typeof IMPORTABLE_FIELDS)[number];

export const REQUIRED_IMPORTABLE_FIELDS: ImportableField[] = ['name', 'email'];

export const IMPORTABLE_FIELD_LABELS: Record<ImportableField, string> = {
  name: 'Navn',
  email: 'E-post',
  phone: 'Telefon',
  birthDate: 'Fødselsdato',
  roomNumber: 'Romnummer',
  role: 'Rolle',
  study: 'Studieprogram',
  studyPlace: 'Studiested',
  seniority: 'Ansiennitet',
  onLeave: 'På permisjon',
  isActive: 'Aktiv',
  street: 'Gate',
  postalCode: 'Postnummer',
  city: 'By',
  country: 'Land',
};

// Best-effort auto-match from common Norwegian/English CSV header names to target fields.
export const FIELD_HEADER_ALIASES: Record<ImportableField, string[]> = {
  name: ['navn', 'name', 'fullt navn', 'fullname'],
  email: ['epost', 'e-post', 'email', 'e-mail'],
  phone: ['telefon', 'tlf', 'phone', 'mobil'],
  birthDate: ['fodselsdato', 'fødselsdato', 'birthdate', 'birth date', 'dob'],
  roomNumber: ['rom', 'romnummer', 'room', 'roomnumber', 'room number'],
  role: ['rolle', 'role'],
  study: ['studieprogram', 'studie', 'study', 'study program'],
  studyPlace: ['studiested', 'studyplace', 'study place'],
  seniority: ['ansiennitet', 'seniority'],
  onLeave: ['permisjon', 'onleave', 'on leave'],
  isActive: ['aktiv', 'active', 'isactive'],
  street: ['gate', 'street', 'adresse'],
  postalCode: ['postnummer', 'postalcode', 'postal code', 'zip'],
  city: ['by', 'city', 'poststed'],
  country: ['land', 'country'],
};

// Target field -> source CSV header name (or undefined if unmapped).
export type ColumnMapping = Partial<Record<ImportableField, string>>;

export type ImportRowResult = {
  row: number;
  status: 'success' | 'error';
  message?: string;
  userId?: string;
  email?: string;
  initialPassword?: string;
};

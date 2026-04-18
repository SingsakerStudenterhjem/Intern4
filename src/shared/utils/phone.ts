const PHONE_REGEX = /^(?:\+[1-9][0-9]{0,3})?[0-9]{8,}$/;

export const normalizePhoneNumber = (value: string): string => value.replace(/\s/g, '').trim();

export const validatePhoneNumber = (value: string): string | null => {
  const normalizedPhone = normalizePhoneNumber(value);

  if (!normalizedPhone) return null;

  return PHONE_REGEX.test(normalizedPhone) ? null : 'Ugyldig telefonnummer format';
};

export type LookupOption = {
  id: string;
  name: string;
};

export function getDefaultLookupId(options: LookupOption[]): string {
  return options.find((option) => option.name === 'Annet')?.id ?? options[0]?.id ?? '';
}

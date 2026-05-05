type PeriodOption = {
  value: string;
  label: string;
};

type PeriodSelectProps = {
  value: string;
  options: PeriodOption[];
  onChange: (value: string) => void;
};

export const PeriodSelect = ({ value, options, onChange }: PeriodSelectProps) => (
  <select
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className="rounded-md border border-gray-300 px-3 py-2 text-sm"
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

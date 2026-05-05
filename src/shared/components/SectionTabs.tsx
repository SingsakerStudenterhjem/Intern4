type SectionTab = {
  key: string;
  label: string;
};

type SectionTabsProps = {
  tabs: SectionTab[];
  activeKey: string;
  onChange: (key: string) => void;
};

export const SectionTabs = ({ tabs, activeKey, onChange }: SectionTabsProps) => (
  <div className="flex flex-wrap gap-2 border-b border-gray-200">
    {tabs.map((tab) => (
      <button
        key={tab.key}
        type="button"
        onClick={() => onChange(tab.key)}
        className={`px-3 py-2 text-sm font-medium ${
          tab.key === activeKey
            ? 'border-b-2 border-blue-600 text-blue-700'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

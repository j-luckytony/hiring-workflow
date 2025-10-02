import React from 'react';

interface ConfigFieldProps {
  label: string;
  value: any;
  icon?: React.ReactNode;
  type?: 'text' | 'array' | 'object' | 'boolean' | 'number' | 'select';
  editable?: boolean;
  onChange?: (value: any) => void;
  options?: { label: string; value: string }[]; // for select
}

export const ConfigField: React.FC<ConfigFieldProps> = ({
  label,
  value,
  icon,
  type = 'text',
  editable = false,
  onChange,
  options
}) => {
  const renderValue = () => {
    if (value === null || value === undefined) return '-';
    
    switch (type) {
      case 'array':
        return Array.isArray(value) ? value.join(', ') : String(value);
      case 'object':
        return typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'number':
        return String(value);
      default:
        return String(value);
    }
  };

  if (editable && onChange) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {icon}
          {label}
        </div>
        {type === 'boolean' ? (
          <select
            value={value ? 'true' : 'false'}
            onChange={(e) => onChange(e.target.value === 'true')}
            className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        ) : type === 'select' ? (
          <select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {(options || []).map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : type === 'number' ? (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        ) : type === 'array' ? (
          <input
            type="text"
            value={Array.isArray(value) ? value.join(', ') : value || ''}
            onChange={(e) => onChange(e.target.value.split(', ').filter(Boolean))}
            className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter comma-separated values"
          />
        ) : type === 'object' ? (
          <textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {
                // Keep the text value for now, will parse when valid
              }
            }}
            className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
            rows={4}
          />
        ) : (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {icon}
        {label}
      </div>
      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
        {type === 'object' ? (
          <pre className="text-xs overflow-x-auto">{renderValue()}</pre>
        ) : (
          renderValue()
        )}
      </div>
    </div>
  );
};

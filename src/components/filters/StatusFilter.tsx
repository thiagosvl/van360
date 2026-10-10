import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

interface StatusFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  label?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  className?: string;
}

const defaultOptions = [
  { value: "todos", label: "Todos" },
  { value: "ativo", label: "Ativo" },
  { value: "desativado", label: "Desativado" },
];

export function StatusFilter({
  value,
  onValueChange,
  id = "status-filter",
  label = "Status",
  placeholder = "Todos",
  options = defaultOptions,
  className,
}: StatusFilterProps) {
  return (
    <div className={className}>
      <div className="space-y-2">
        <Label htmlFor={id} className="text-xs font-medium text-[#0a0a0a]">
          {label}
        </Label>
        <NativeSelect
          id={id}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
        >
          {placeholder && !options.some(o => o.value === value) && (
            <option value="" disabled hidden>{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}

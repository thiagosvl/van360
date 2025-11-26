import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
        <Label htmlFor={id}>{label}</Label>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger id={id}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}


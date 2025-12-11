import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface UnifiedEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string | ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
  iconClassName?: string;
}

export function UnifiedEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  iconClassName,
}: UnifiedEmptyStateProps) {
  return (
    <Card className={`border-dashed border-gray-200 bg-gray-50/50 ${className || ""}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-4">
          <Icon className={`h-8 w-8 text-gray-400 ${iconClassName || ""}`} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <div className="text-sm text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
          {description}
        </div>

        {action && (
          <Button
            variant="outline"
            className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
            onClick={action.onClick}
          >
            {action.icon && <action.icon className="w-4 h-4 mr-2" />}
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

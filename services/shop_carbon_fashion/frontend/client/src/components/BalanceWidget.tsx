import { Cloud, Euro } from "lucide-react";
import { Badge } from "./ui/badge.tsx";

interface BalanceWidgetProps {
  euroBalance: number;
  co2Balance: number;
}

export default function BalanceWidget({ euroBalance, co2Balance }: BalanceWidgetProps) {
  return (
    <div className="flex items-center gap-3" data-testid="widget-balance">
      <Badge variant="secondary" className="gap-1.5 px-3">
        <Euro className="w-3.5 h-3.5" />
        <span className="font-semibold">{euroBalance.toFixed(2)}</span>
      </Badge>
      <Badge variant="secondary" className="gap-1.5 px-3">
        <Cloud className="w-3.5 h-3.5" />
        <span className="font-semibold">{co2Balance}</span>
      </Badge>
    </div>
  );
}

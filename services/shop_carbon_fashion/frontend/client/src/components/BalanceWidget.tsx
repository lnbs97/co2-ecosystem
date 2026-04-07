import { Cloud, Euro } from "lucide-react";
import { Badge } from "./ui/badge.tsx";

interface BalanceWidgetProps {
  euroBalance: number;
  co2Balance: number;
}

export default function BalanceWidget({ euroBalance, co2Balance }: BalanceWidgetProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num);
  };

  return (
    <div className="flex items-center gap-3" data-testid="widget-balance">
      <Badge variant="secondary" className="gap-1.5 px-3">
        <Euro className="w-3.5 h-3.5" />
        <span className="font-semibold">{formatNumber(euroBalance)} €</span>
      </Badge>
      <Badge variant="secondary" className="gap-1.5 px-3">
        <Cloud className="w-3.5 h-3.5" />
        <span className="font-semibold">{formatNumber(co2Balance)} g CO2</span>
      </Badge>
    </div>
  );
}

import { Cloud } from "lucide-react";

interface DualPriceProps {
  euroPrice: number;
  co2Price: number;
  size?: "sm" | "md" | "lg";
}

export default function DualPrice({ euroPrice, co2Price, size = "md" }: DualPriceProps) {
  const textSize = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  }[size];

  const co2Size = {
    sm: "text-xs",
    md: "text-base",
    lg: "text-lg",
  }[size];

  const fontWeight = {
    sm: "font-medium",
    md: "font-semibold",
    lg: "font-bold",
  }[size];

  return (
    <div className="flex flex-col gap-1">
      <div className={`${textSize} ${fontWeight} text-foreground`}>
        €{euroPrice.toFixed(2)}
      </div>
      <div className={`${co2Size} font-medium text-muted-foreground flex items-center gap-1`}>
        <Cloud className="w-3 h-3" />
        {co2Price} CO₂
      </div>
    </div>
  );
}

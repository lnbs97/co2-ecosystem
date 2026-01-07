import { Wallet, Leaf } from 'lucide-react';

interface WalletBalanceProps {
  eurBalance: number;
  co2Balance: number;
  isLoading?: boolean;
}

export const WalletBalance = ({ eurBalance, co2Balance, isLoading }: WalletBalanceProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        <div className="h-8 w-24 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-lg border border-border">
        <Wallet className="h-4 w-4 text-primary" />
        <span className="font-semibold text-foreground">€{eurBalance.toFixed(2)}</span>
      </div>
      <div className="flex items-center gap-2 bg-co2/10 px-3 py-1.5 rounded-lg border border-co2/30">
        <Leaf className="h-4 w-4 text-co2" />
        <span className="font-semibold text-co2-foreground">{co2Balance.toFixed(0)} CO₂</span>
      </div>
    </div>
  );
};

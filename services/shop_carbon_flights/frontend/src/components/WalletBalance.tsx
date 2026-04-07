import { Wallet, Leaf } from 'lucide-react';

interface WalletBalanceProps {
  eurBalance: number;
  co2Balance: number;
  isLoading?: boolean;
}

export const WalletBalance = ({ eurBalance, co2Balance, isLoading }: WalletBalanceProps) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num);
  };

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
        <span className="font-semibold text-foreground">{formatNumber(eurBalance)} €</span>
      </div>
      <div className="flex items-center gap-2 bg-co2/10 px-3 py-1.5 rounded-lg border border-co2/30">
        <Leaf className="h-4 w-4 text-co2" />
        <span className="font-semibold text-co2-foreground">{formatNumber(co2Balance / 1000)} CT</span>
      </div>

    </div>
  );
};

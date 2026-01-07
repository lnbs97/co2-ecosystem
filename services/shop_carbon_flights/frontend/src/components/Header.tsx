import { Plane } from 'lucide-react';
import { WalletBalance } from './WalletBalance';

interface HeaderProps {
  eurBalance: number;
  co2Balance: number;
  isLoading?: boolean;
}

export const Header = ({ eurBalance, co2Balance, isLoading }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-sky-600 p-2 rounded-lg">
            <Plane className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">SkyEco</h1>
            <p className="text-xs text-muted-foreground -mt-0.5">Fly Responsibly</p>
          </div>
        </div>
        
        <WalletBalance
          eurBalance={eurBalance}
          co2Balance={co2Balance}
          isLoading={isLoading}
        />
      </div>
    </header>
  );
};

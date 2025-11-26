import { ShoppingCart, Search, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import BalanceWidget from "./BalanceWidget.tsx";
import { Badge } from "./ui/badge.tsx";
import { useState, useEffect } from "react";
import { useBalance } from "@/lib/api";

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
}

export default function Header({ cartItemCount, onCartClick }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  // Lade Balance direkt von der API
  const { data: balance, isLoading, isError } = useBalance();

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background" data-testid="header-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              EcoFashion
            </h1>
            <nav className="hidden md:flex items-center gap-6">
              <button className="text-sm font-medium text-foreground hover-elevate px-2 py-1 rounded-md" data-testid="link-women">
                Women
              </button>
              <button className="text-sm font-medium text-foreground hover-elevate px-2 py-1 rounded-md" data-testid="link-men">
                Men
              </button>
              <button className="text-sm font-medium text-foreground hover-elevate px-2 py-1 rounded-md" data-testid="link-sale">
                Sale
              </button>
            </nav>
          </div>

          <div className="hidden lg:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for products..."
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              {isLoading ? (
                <div className="h-8 w-32 bg-muted animate-pulse rounded-md" />
              ) : isError || !balance ? (
                <BalanceWidget euroBalance={0} co2Balance={0} />
              ) : (
                <BalanceWidget euroBalance={balance.moneyBalance} co2Balance={balance.co2Balance} />
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="relative"
              onClick={onCartClick}
              data-testid="button-cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
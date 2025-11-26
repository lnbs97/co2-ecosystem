import { ShoppingCart, Search, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import BalanceWidget from "./BalanceWidget.tsx";
import { Badge } from "./ui/badge.tsx";
import { useState, useEffect } from "react";

interface HeaderProps {
  cartItemCount: number;
  euroBalance: number;
  co2Balance: number;
  onCartClick: () => void;
}

export default function Header({ cartItemCount, euroBalance, co2Balance, onCartClick }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

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
              <BalanceWidget euroBalance={euroBalance} co2Balance={co2Balance} />
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

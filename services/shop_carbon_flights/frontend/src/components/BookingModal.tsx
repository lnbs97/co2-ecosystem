import { Leaf, Plane, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Flight } from '@/data/flights';

interface BookingModalProps {
  flight: Flight | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isBooking: boolean;
  eurBalance: number;
  co2Balance: number;
}

export const BookingModal = ({
  flight,
  isOpen,
  onClose,
  onConfirm,
  isBooking,
  eurBalance,
  co2Balance,
}: BookingModalProps) => {
  if (!flight) return null;

  const hasEnoughEur = eurBalance >= flight.priceEur;
  const hasEnoughCo2 = co2Balance >= flight.priceCo2;
  const canBook = hasEnoughEur && hasEnoughCo2;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" />
            Confirm Booking
          </DialogTitle>
          <DialogDescription>
            Review your flight details before confirming
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Flight Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-foreground">{flight.flightNumber}</span>
              <span className="text-sm text-muted-foreground">{flight.duration}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium text-foreground">{flight.departure.code}</p>
                <p className="text-muted-foreground">{flight.departure.time}</p>
              </div>
              <Plane className="h-4 w-4 text-primary rotate-90" />
              <div className="text-right">
                <p className="font-medium text-foreground">{flight.arrival.code}</p>
                <p className="text-muted-foreground">{flight.arrival.time}</p>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Payment Required</h4>
            
            <div className={`flex justify-between items-center p-3 rounded-lg border ${
              hasEnoughEur ? 'border-border bg-background' : 'border-destructive/50 bg-destructive/10'
            }`}>
              <span className="text-foreground">EUR</span>
              <div className="text-right">
                <span className="font-bold text-foreground">€{flight.priceEur}</span>
                {!hasEnoughEur && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Insufficient funds
                  </p>
                )}
              </div>
            </div>

            <div className={`flex justify-between items-center p-3 rounded-lg border ${
              hasEnoughCo2 ? 'border-co2/30 bg-co2/5' : 'border-destructive/50 bg-destructive/10'
            }`}>
              <span className="flex items-center gap-2 text-foreground">
                <Leaf className="h-4 w-4 text-co2" />
                Carbon Tokens
              </span>
              <div className="text-right">
                <span className="font-bold text-co2">{flight.priceCo2 / 1000}</span>
                {!hasEnoughCo2 && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Insufficient tokens
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isBooking}>
            Cancel
          </Button>
          <Button
            variant="flight"
            onClick={onConfirm}
            disabled={!canBook || isBooking}
          >
            {isBooking ? 'Processing...' : 'Confirm Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import { Plane, Clock, Leaf, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Flight } from '@/data/flights';

interface FlightCardProps {
  flight: Flight;
  onBook: (flight: Flight) => void;
  isBooking?: boolean;
}

export const FlightCard = ({ flight, onBook, isBooking }: FlightCardProps) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-border/50">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Flight Info */}
          <div className="flex-1 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                {flight.flightNumber}
              </span>
              <span className="text-sm text-muted-foreground">{flight.airline}</span>
            </div>

            <div className="flex items-center gap-4 lg:gap-8">
              {/* Departure */}
              <div className="flex-1">
                <p className="text-2xl font-bold text-foreground">{flight.departure.time}</p>
                <p className="text-lg font-semibold text-foreground">{flight.departure.code}</p>
                <p className="text-sm text-muted-foreground">{flight.departure.city}</p>
              </div>

              {/* Flight Path */}
              <div className="flex flex-col items-center gap-1 px-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">{flight.duration}</span>
                </div>
                <div className="flex items-center w-24 lg:w-32">
                  <div className="h-px flex-1 bg-border" />
                  <Plane className="h-4 w-4 text-primary mx-2 rotate-90" />
                  <div className="h-px flex-1 bg-border" />
                </div>
                <span className="text-xs text-muted-foreground">Direct</span>
              </div>

              {/* Arrival */}
              <div className="flex-1 text-right">
                <p className="text-2xl font-bold text-foreground">{flight.arrival.time}</p>
                <p className="text-lg font-semibold text-foreground">{flight.arrival.code}</p>
                <p className="text-sm text-muted-foreground">{flight.arrival.city}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span>{formatDate(flight.departure.date)}</span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {flight.seatsAvailable} seats left
              </span>
            </div>
          </div>

          {/* Price & Book */}
          <div className="flex lg:flex-col items-center justify-between lg:justify-center gap-4 p-6 bg-muted/30 border-t lg:border-t-0 lg:border-l border-border/50 min-w-[200px]">
            <div className="flex flex-col items-center gap-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{formatNumber(flight.priceEur)} €</p>
                <p className="text-xs text-muted-foreground">per person</p>
              </div>
              <div className="flex items-center gap-1 text-co2 bg-co2/10 px-2 py-1 rounded-full">
                <Leaf className="h-3 w-3" />
                <span className="text-sm font-semibold">{formatNumber(flight.priceCo2)} g CO₂</span>
              </div>
            </div>
            <Button
              variant="flight"
              size="lg"
              onClick={() => onBook(flight)}
              disabled={isBooking}
              className="w-full lg:w-auto"
            >
              {isBooking ? 'Booking...' : 'Book Now'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

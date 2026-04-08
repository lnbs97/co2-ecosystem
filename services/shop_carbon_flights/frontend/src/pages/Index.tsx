import { useState, useEffect } from 'react';
import { Plane, Leaf, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { FlightCard } from '@/components/FlightCard';
import { BookingModal } from '@/components/BookingModal';
import { demoFlights, type Flight } from '@/data/flights';
import {flightApi, getStoredUserId, walletApi} from '@/lib/api'; // flightApi importieren

const Index = () => {
  const [eurBalance, setEurBalance] = useState(500);
  const [co2Balance, setCo2Balance] = useState(300);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookedFlights, setBookedFlights] = useState<Set<string>>(new Set());

  // Fetch wallet balance on mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const userId = getStoredUserId();
        const balance = await walletApi.getBalance(userId);
        setEurBalance(balance.moneyBalance);
        setCo2Balance(balance.co2Balance);
      } catch (error) {
        // Use demo values if API is unavailable
        console.log('Using demo balance values - API not available');
      } finally {
        setIsLoadingBalance(false);
      }
    };
    fetchBalance();
  }, []);

  const handleBookFlight = (flight: Flight) => {
    if (bookedFlights.has(flight.id)) {
      toast.info('You have already booked this flight');
      return;
    }
    setSelectedFlight(flight);
  };

  const handleConfirmBooking = async () => {
    if (!selectedFlight) return;

    setIsBooking(true);
    try {
      const userId = getStoredUserId();
      await flightApi.bookFlight(userId, selectedFlight);

      // Update local balance
      setEurBalance((prev) => prev - selectedFlight.priceEur);
      setCo2Balance((prev) => prev - selectedFlight.priceCo2);
      setBookedFlights((prev) => new Set(prev).add(selectedFlight.id));

      toast.success('Flight booked successfully!', {
        description: `${selectedFlight.flightNumber}: ${selectedFlight.departure.city} → ${selectedFlight.arrival.city}`,
      });
      setSelectedFlight(null);
    } catch (error) {
      // Demo mode: simulate successful booking
      setEurBalance((prev) => prev - selectedFlight.priceEur);
      setCo2Balance((prev) => prev - selectedFlight.priceCo2);
      setBookedFlights((prev) => new Set(prev).add(selectedFlight.id));

      toast.success('Flight booked successfully! (Demo Mode)', {
        description: `${selectedFlight.flightNumber}: ${selectedFlight.departure.city} → ${selectedFlight.arrival.city}`,
      });
      setSelectedFlight(null);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        eurBalance={eurBalance}
        co2Balance={co2Balance}
        isLoading={isLoadingBalance}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-sky py-16 lg:py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm mb-6">
              <Leaf className="h-4 w-4" />
              <span>Carbon-conscious flying</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 font-display">
              Fly Smart, Pay with
              <br />
              <span className="text-white/90">EUR + Carbon Tokens</span>
            </h1>
            <p className="text-lg text-white/80 max-w-xl mx-auto">
              Book your flights with our dual-currency system. Every journey is priced in Euros and Carbon Tokens, making your environmental impact transparent.
            </p>
          </div>
        </div>
        
        {/* Decorative plane */}
        <Plane className="absolute right-[10%] top-1/2 -translate-y-1/2 h-32 w-32 text-white/10 rotate-12 hidden lg:block" />
      </section>

      {/* Flights Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="h-5 w-5" />
              <span className="font-semibold">Düsseldorf</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{demoFlights.length} flights available</span>
          </div>

          <div className="space-y-4">
            {demoFlights.map((flight, index) => (
              <div
                key={flight.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <FlightCard
                  flight={flight}
                  onBook={handleBookFlight}
                  isBooking={isBooking && selectedFlight?.id === flight.id}
                />
                {bookedFlights.has(flight.id) && (
                  <div className="mt-2 text-sm text-co2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-co2" />
                    Booked
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4 font-display">
              How Carbon Token Pricing Works
            </h2>
            <p className="text-muted-foreground mb-8">
              Each flight's Carbon Token price reflects its environmental impact based on distance, aircraft type, and occupancy. By requiring both EUR and Carbon Tokens, we encourage sustainable travel choices.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-xl shadow-soft">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Plane className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Transparent Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  See both EUR and Carbon Token costs upfront for every flight
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-soft">
                <div className="w-12 h-12 bg-co2/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-6 w-6 text-co2" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Eco Incentives</h3>
                <p className="text-sm text-muted-foreground">
                  Shorter routes and efficient aircraft cost fewer Carbon Tokens
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-soft">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Smart Choices</h3>
                <p className="text-sm text-muted-foreground">
                  Compare flights by price and environmental impact
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BookingModal
        flight={selectedFlight}
        isOpen={!!selectedFlight}
        onClose={() => setSelectedFlight(null)}
        onConfirm={handleConfirmBooking}
        isBooking={isBooking}
        eurBalance={eurBalance}
        co2Balance={co2Balance}
      />
    </div>
  );
};

export default Index;

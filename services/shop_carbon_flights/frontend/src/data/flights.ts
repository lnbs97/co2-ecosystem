export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  departure: {
    city: string;
    airport: string;
    code: string;
    time: string;
    date: string;
  };
  arrival: {
    city: string;
    airport: string;
    code: string;
    time: string;
    date: string;
  };
  duration: string;
  priceEur: number;
  priceCo2: number;
  seatsAvailable: number;
}

export const AIRLINE_USER_ID = 'shop-eco-flights';

export const demoFlights: Flight[] = [
  {
    id: 'flight-1',
    flightNumber: 'SE 201',
    airline: 'SkyEco Airways',
    departure: {
      city: 'Düsseldorf',
      airport: 'Düsseldorf Airport',
      code: 'DUS',
      time: '08:30',
      date: '2026-01-15',
    },
    arrival: {
      city: 'London',
      airport: 'Heathrow Airport',
      code: 'LHR',
      time: '09:15',
      date: '2026-01-15',
    },
    duration: '1h 45m',
    priceEur: 129,
    priceCo2: 135000, // 135kg
    seatsAvailable: 24,
  },
  {
    id: 'flight-2',
    flightNumber: 'SE 305',
    airline: 'SkyEco Airways',
    departure: {
      city: 'Barcelona',
      airport: 'El Prat Airport',
      code: 'BCN',
      time: '14:00',
      date: '2026-01-15',
    },
    arrival: {
      city: 'Düsseldorf',
      airport: 'Düsseldorf Airport',
      code: 'DUS',
      time: '16:30',
      date: '2026-01-15',
    },
    duration: '2h 30m',
    priceEur: 89,
    priceCo2: 215000, // 215kg
    seatsAvailable: 12,
  },
  {
    id: 'flight-3',
    flightNumber: 'SE 118',
    airline: 'SkyEco Airways',
    departure: {
      city: 'Düsseldorf',
      airport: 'Düsseldorf Airport',
      code: 'DUS',
      time: '06:45',
      date: '2026-01-16',
    },
    arrival: {
      city: 'Paris',
      airport: 'Charles de Gaulle',
      code: 'CDG',
      time: '08:00',
      date: '2026-01-16',
    },
    duration: '1h 15m',
    priceEur: 75,
    priceCo2: 105000, // 105kg
    seatsAvailable: 8,
  },
  {
    id: 'flight-4',
    flightNumber: 'SE 422',
    airline: 'SkyEco Airways',
    departure: {
      city: 'Rome',
      airport: 'Fiumicino Airport',
      code: 'FCO',
      time: '11:20',
      date: '2026-01-16',
    },
    arrival: {
      city: 'Düsseldorf',
      airport: 'Düsseldorf Airport',
      code: 'DUS',
      time: '13:35',
      date: '2026-01-16',
    },
    duration: '2h 15m',
    priceEur: 145,
    priceCo2: 210000, // 210kg
    seatsAvailable: 31,
  },
  {
    id: 'flight-5',
    flightNumber: 'SE 550',
    airline: 'SkyEco Airways',
    departure: {
      city: 'Düsseldorf',
      airport: 'Düsseldorf Airport',
      code: 'DUS',
      time: '18:00',
      date: '2026-01-17',
    },
    arrival: {
      city: 'Amsterdam',
      airport: 'Schiphol Airport',
      code: 'AMS',
      time: '18:55',
      date: '2026-01-17',
    },
    duration: '0h 55m',
    priceEur: 59,
    priceCo2: 85000, // 85kg
    seatsAvailable: 5,
  },
  {
    id: 'flight-6',
    flightNumber: 'SE 789',
    airline: 'SkyEco Airways',
    departure: {
      city: 'Düsseldorf',
      airport: 'Düsseldorf Airport',
      code: 'DUS',
      time: '20:30',
      date: '2026-01-17',
    },
    arrival: {
      city: 'Vienna',
      airport: 'Vienna International',
      code: 'VIE',
      time: '22:10',
      date: '2026-01-17',
    },
    duration: '1h 40m',
    priceEur: 112,
    priceCo2: 160000, // 160kg
    seatsAvailable: 18,
  },
];
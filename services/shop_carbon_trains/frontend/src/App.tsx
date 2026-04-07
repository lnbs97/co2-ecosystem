import { useState, useEffect } from 'react'

interface Train {
  id: number;
  from: string;
  to: string;
  priceEur: number;
  priceCo2: number;
  trainNumber: string;
}

const TRAINS: Train[] = [
  { 
    id: 1, 
    from: 'Düsseldorf', 
    to: 'Paris', 
    priceEur: 79, 
    priceCo2: 17500, // ca. 500km -> 17,5kg CO2
    trainNumber: 'EST 9424' // Eurostar
  },
  { 
    id: 2, 
    from: 'Düsseldorf', 
    to: 'Vienna', 
    priceEur: 129, 
    priceCo2: 33250, // ca. 950km -> 33,25kg CO2
    trainNumber: 'ICE 21' 
  },
  { 
    id: 3, 
    from: 'Düsseldorf', 
    to: 'Copenhagen', 
    priceEur: 109, 
    priceCo2: 27300, // ca. 780km -> 27,3kg CO2
    trainNumber: 'ICE 826' 
  },
  { 
    id: 4, 
    from: 'Düsseldorf', 
    to: 'Brussels', 
    priceEur: 45, 
    priceCo2: 7000, // ca. 200km -> 7kg CO2
    trainNumber: 'EST 9412' 
  },
];

function App() {
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');

  const bookTrain = async (train: Train) => {
    if (!userId) {
      alert('Please enter a User ID');
      return;
    }

    setBooking(true);
    setMessage('');

    try {
      const res = await fetch('/api/trains/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ train, userId }),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage('Booking successful! Event emitted.');
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (err: any) {
      setMessage(`Network error: ${err.message}`);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <header className="flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-green-400">Eco Rails</h1>
          <p className="text-gray-400">Fast, Green, European.</p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500 uppercase tracking-widest">Active User ID</label>
          <input 
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              localStorage.setItem('userId', e.target.value);
            }}
            placeholder="e.g. user-123"
            className="bg-gray-800 border border-gray-700 px-3 py-2 rounded text-sm focus:outline-none focus:border-green-500"
          />
        </div>
      </header>

      {message && (
        <div className={`mb-8 p-4 rounded border ${message.includes('Error') ? 'bg-red-900/20 border-red-500 text-red-200' : 'bg-green-900/20 border-green-500 text-green-200'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TRAINS.map((train) => (
          <div key={train.id} className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl hover:border-green-500/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-mono text-gray-500">{train.trainNumber}</span>
              <div className="flex gap-2 text-sm font-bold">
                <span className="text-green-400">{train.priceEur} €</span>
                <span className="text-blue-400">{train.priceCo2} g CO2</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="text-xl font-bold">{train.from}</div>
              </div>
              <div className="h-[2px] w-8 bg-gray-700 relative">
                <div className="absolute top-[-4px] right-0 w-2 h-2 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 text-right">
                <div className="text-xl font-bold">{train.to}</div>
              </div>
            </div>

            <button 
              disabled={booking}
              onClick={() => bookTrain(train)}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white py-3 rounded-lg font-bold transition-colors"
            >
              {booking ? 'Processing...' : 'Book Ticket'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App

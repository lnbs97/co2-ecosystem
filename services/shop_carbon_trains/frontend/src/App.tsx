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
  const [balance, setBalance] = useState<{ moneyBalance: number, co2Balance: number } | null>(null);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num);
  };

  const fetchBalance = async () => {
    if (!userId) {
        setBalance(null);
        return;
    }
    try {
      const res = await fetch(`/api/wallet/balance`, {
          headers: {
              'X-User-ID': userId
          }
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data);
      } else {
          console.error('Balance request failed with status:', res.status);
          setBalance(null);
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setBalance(null);
    }
  };

  useEffect(() => {
    fetchBalance();
    
    // Polling balance every 5 seconds to keep it updated
    const interval = setInterval(fetchBalance, 5000);
    return () => clearInterval(interval);
  }, [userId]);

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
        fetchBalance();
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
    <div className="bg-gray-950 text-gray-100 min-h-screen w-full">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-12 border-b border-gray-800 pb-6 gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-10 h-10 text-green-400"
              >
                <rect x="4" y="3" width="16" height="14" rx="2" />
                <path d="M4 11h16" />
                <path d="M12 3v8" />
                <circle cx="8" cy="14" r="1" />
                <circle cx="16" cy="14" r="1" />
                <path d="M6 21l2-4" />
                <path d="M18 21l-2-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-green-400">Eco Rails</h1>
              <p className="text-gray-400">Fast, Green, European.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {balance ? (
              <div className="flex gap-3 sm:gap-4">
                <div className="bg-gray-900 border border-gray-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex flex-col items-end shadow-sm">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Balance</span>
                  <span className="text-sm sm:text-base font-bold text-blue-400">{formatNumber(balance.moneyBalance)} €</span>
                </div>
                <div className="bg-gray-900 border border-gray-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex flex-col items-end shadow-sm">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Carbon Tokens</span>
                  <span className="text-sm sm:text-base font-bold text-green-400">{formatNumber(balance.co2Balance / 1000)} CT</span>
                </div>
              </div>
            ) : (
               <div className="text-xs text-amber-500 bg-amber-900/20 border border-amber-500/50 px-4 py-2 rounded-md animate-pulse">
                  {userId ? 'Loading Balance...' : 'Please login via Hub'}
               </div>
            )}
          </div>
        </header>

        {message && (
          <div className={`mb-8 p-4 rounded-lg border shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 ${message.includes('Error') ? 'bg-red-900/20 border-red-500/50 text-red-200' : 'bg-green-900/20 border-green-500/50 text-green-200'}`}>
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${message.includes('Error') ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <p className="font-medium">{message}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 lg:gap-8">
          {TRAINS.map((train) => (
            <div key={train.id} className="bg-gray-900/40 border border-gray-800 p-6 rounded-2xl hover:border-green-500/40 transition-all duration-300 group shadow-xl hover:shadow-green-900/5">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-mono text-gray-500 bg-gray-800/50 px-2 py-1 rounded tracking-wider">{train.trainNumber}</span>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-lg font-bold text-blue-400">{formatNumber(train.priceEur)} €</span>
                  <span className="text-xs font-semibold text-green-400/80">{formatNumber(train.priceCo2 / 1000)} CT</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 uppercase tracking-tighter mb-1">Departure</div>
                  <div className="text-xl font-bold text-gray-100">{train.from}</div>
                </div>
                
                <div className="flex flex-col items-center gap-1 group-hover:px-2 transition-all duration-500">
                    <div className="h-[2px] w-12 bg-gray-800 relative overflow-hidden rounded-full">
                        <div className="absolute inset-0 bg-green-500/30"></div>
                        <div className="absolute top-0 left-0 h-full w-1/2 bg-green-500 shadow-[0_0_10px_#22c55e] animate-infinite-scroll"></div>
                    </div>
                </div>

                <div className="flex-1 text-right">
                  <div className="text-xs text-gray-500 uppercase tracking-tighter mb-1">Arrival</div>
                  <div className="text-xl font-bold text-gray-100">{train.to}</div>
                </div>
              </div>

              <button 
                disabled={booking || !userId}
                onClick={() => bookTrain(train)}
                className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-500 text-white py-4 rounded-xl font-bold transition-all duration-200 shadow-lg shadow-green-900/20 active:scale-[0.98]"
              >
                {booking ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                    </div>
                ) : (!userId ? 'Login Required' : 'Book Ticket')}
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes infinite-scroll {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
        }
        .animate-infinite-scroll {
            animation: infinite-scroll 2s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default App

import {useEffect, useState, useRef} from 'react';
import io from 'socket.io-client';
import {Activity, ShoppingBag, Wallet, UserPlus, Leaf, ArrowRightLeft} from 'lucide-react';

// Connects to the backend via Traefik.
// Traefik strips '/api/dashboard', so the backend receives requests at root '/socket.io'
const SOCKET_PATH = '/api/dashboard/socket.io';

function App() {
    const [events, setEvents] = useState([]);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        // Initialize Socket.IO connection
        const socket = io('/', {
            path: SOCKET_PATH,
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            console.log('Connected to WebSocket');
            setConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected');
            setConnected(false);
        });

        // Listen for the custom event broadcasted by the backend
        socket.on('dashboard_event', (newEvent) => {
            // Keep only the last 50 events to avoid memory issues in long-running demos
            setEvents((prev) => [newEvent, ...prev].slice(0, 50));
        });

        return () => socket.disconnect();
    }, []);

    // Helper to style events based on their source/content
    const getEventStyle = (evt) => {
        const s = (evt.service || '').toLowerCase();
        const t = (evt.type || '').toLowerCase();

        if (s.includes('wallet')) return {
            icon: <Wallet/>,
            color: 'border-yellow-500 bg-yellow-900/20 text-yellow-500'
        };
        if (s.includes('shop')) return {
            icon: <ShoppingBag/>,
            color: 'border-purple-500 bg-purple-900/20 text-purple-400'
        };
        if (s.includes('user') || s.includes('hub')) return {
            icon: <UserPlus/>,
            color: 'border-blue-500 bg-blue-900/20 text-blue-400'
        };
        if (s.includes('exchange')) return {
            icon: <ArrowRightLeft/>,
            color: 'border-pink-500 bg-pink-900/20 text-pink-400'
        };
        if (t.includes('co2')) return {
            icon: <Leaf/>,
            color: 'border-green-500 bg-green-900/20 text-green-400'
        };

        return {icon: <Activity/>, color: 'border-gray-500 bg-gray-800 text-gray-300'};
    };

    return (
        <div className="min-h-screen p-6 font-sans">
            <header
                className="max-w-4xl mx-auto mb-8 flex items-center justify-between border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                        Global Event Stream
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Realtime CO2 Economy Monitoring</p>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">
            {connected ? 'Live' : 'Offline'}
          </span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto space-y-4">
                {events.length === 0 && (
                    <div
                        className="text-center py-20 text-gray-600 italic border border-dashed border-gray-800 rounded-lg">
                        Waiting for transactions...
                    </div>
                )}

                {events.map((evt, idx) => {
                    const style = getEventStyle(evt);

                    return (
                        <div
                            key={idx}
                            className={`flex items-start gap-4 p-4 rounded-lg border-l-4 shadow-lg animate-in ${style.color.split(' ')[0]} bg-gray-900`}
                        >
                            <div className={`p-2 rounded-full ${style.color}`}>
                                {style.icon}
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-gray-200">
                                        {evt.service || 'System'}
                                    </h3>
                                    <span className="text-xs text-gray-500 font-mono">
                                      {evt.timestamp
                                          ? new Date(evt.timestamp).toLocaleTimeString('de-DE', {
                                              timeZone: 'Europe/Berlin',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              second: '2-digit'
                                          })
                                          : new Date().toLocaleTimeString('de-DE', {timeZone: 'Europe/Berlin'})
                                      }
                                    </span>
                                </div>

                                <p className="text-gray-400 mt-1">{evt.message || JSON.stringify(evt.data)}</p>

                                <div className="flex gap-2 mt-3">
                                    {evt.amount && (
                                        <span
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-gray-800 text-gray-300 border border-gray-700">
                      {evt.amount < 0 ? 'Sent' : 'Received'} {Math.abs(evt.amount)}
                    </span>
                                    )}
                                    {evt.type && (
                                        <span
                                            className="px-2 py-1 rounded text-xs font-mono bg-gray-800 text-gray-500 uppercase border border-gray-700">
                       {evt.type}
                     </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </main>
        </div>
    );
}

export default App;
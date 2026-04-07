import {useEffect, useState} from 'react';
import io from 'socket.io-client';
// 1. NEU: 'Plane' Icon importieren
import {Activity, ShoppingBag, Wallet, UserPlus, Leaf, ArrowRightLeft, Plane, Train} from 'lucide-react';

const SOCKET_PATH = '/api/dashboard/socket.io';

function App() {
    const [events, setEvents] = useState([]);
    const [connected, setConnected] = useState(false);

    const formatNumber = (num) => {
        if (num === undefined || num === null) return '0';
        return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num);
    };

    useEffect(() => {
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

        socket.on('dashboard_event', (newEvent) => {
            setEvents((prev) => [newEvent, ...prev].slice(0, 50));
        });

        return () => socket.disconnect();
    }, []);

    const getEventStyle = (evt) => {
        const s = (evt.service || '').toLowerCase();
        const t = (evt.type || '').toLowerCase();

        // 2. NEU: Style für Flight-Service hinzufügen
        if (s.includes('flight')) return {
            icon: <Plane/>,
            color: 'border-cyan-500 bg-cyan-900/20 text-cyan-400'
        };
        if (s.includes('train')) return {
            icon: <Train/>,
            color: 'border-emerald-500 bg-emerald-900/20 text-emerald-400'
        };

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

    // Helper für die Amount-Label Beschriftung
    const getAmountLabel = (evt) => {
        if (evt.type === 'FLIGHT_BOOKED') return 'Price';
        return evt.amount < 0 ? 'Sent' : 'Received';
    };

    return (
        <div className="min-h-screen p-6 font-sans bg-gray-950"> {/* Habe bg-gray-950 für dunklen Background ergänzt */}
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
                            className={`flex items-start gap-4 p-4 rounded-lg border-l-4 shadow-lg animate-in fade-in slide-in-from-top-2 ${style.color.split(' ')[0]} bg-gray-900`}
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

                                <div className="flex flex-wrap gap-2 mt-3">
                                    {(evt.type === 'CO2_TRANSFER' || evt.type?.includes('CO2')) && evt.amount && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-green-900/30 text-green-400 border border-green-800">
                                            {formatNumber(Math.abs(evt.amount))} g CO2
                                        </span>
                                    )}
                                    {(evt.type === 'MONEY_TRANSFER' || evt.type?.includes('MONEY') || evt.type === 'WALLET_CREATED') && evt.amount && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-blue-900/30 text-blue-400 border border-blue-800">
                                            {formatNumber(Math.abs(evt.amount))} €
                                        </span>
                                    )}
                                    {(evt.type === 'PRODUCT_PURCHASED' || evt.type === 'FLIGHT_BOOKED' || evt.type === 'TRAIN_BOOKED' || evt.type === 'TRADE_EXECUTED' || evt.type === 'ORDER_CREATED') && (
                                        <>
                                            {evt.details?.co2Amount !== undefined && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-green-900/30 text-green-400 border border-green-800">
                                                    {formatNumber(evt.details.co2Amount || evt.details.priceCo2 || evt.details.amount)} g CO2
                                                </span>
                                            )}
                                            {(evt.details?.moneyAmount !== undefined || evt.details?.priceEur !== undefined || evt.details?.amount_cash !== undefined) && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-blue-900/30 text-blue-400 border border-blue-800">
                                                    {formatNumber(evt.details.moneyAmount || evt.details.priceEur || evt.details.amount_cash)} €
                                                </span>
                                            )}
                                        </>
                                    )}
                                    {/* Fallback if no specific logic matched but amount exists */}
                                    {!['CO2_TRANSFER', 'MONEY_TRANSFER', 'PRODUCT_PURCHASED', 'FLIGHT_BOOKED', 'TRAIN_BOOKED', 'TRADE_EXECUTED', 'ORDER_CREATED'].includes(evt.type) && evt.amount && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-gray-800 text-gray-300 border border-gray-700">
                                            {formatNumber(Math.abs(evt.amount))}
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
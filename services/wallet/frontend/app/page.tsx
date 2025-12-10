'use client';

import { useState, useEffect } from 'react';
import {
    getBalance,
    transferCo2,
    transferMoney,
    getUsers, // Neu importiert
    BalanceResponse,
    User // Neu importiert
} from './services/walletService';

export default function HomePage() {
    const [balance, setBalance] = useState<BalanceResponse | null>(null);
    const [users, setUsers] = useState<User[]>([]); // State für die User-Liste

    const [co2Recipient, setCo2Recipient] = useState('');
    const [co2Amount, setCo2Amount] = useState('');

    const [moneyRecipient, setMoneyRecipient] = useState('');
    const [moneyAmount, setMoneyAmount] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        // Eigene ID aus LocalStorage holen (um sich nicht selbst in der Liste zu sehen)
        const storedUserId = localStorage.getItem('userId');
        setCurrentUserId(storedUserId);

        const fetchData = async () => {
            try {
                // 1. Guthaben laden
                const balanceData = await getBalance();
                setBalance(balanceData);

                // 2. User-Liste laden
                const usersData = await getUsers();
                // Optional: Sich selbst aus der Liste filtern
                const otherUsers = usersData.filter(u => u.userId !== storedUserId);
                setUsers(otherUsers);

            } catch (err: any) {
                // Fehler beim Laden nicht zu hart bestrafen, vielleicht geht nur der Hub nicht
                console.error(err);
                if (!balance) setError(err.message);
            }
        };
        fetchData();
    }, []);

    const handleCo2Transfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!co2Recipient) {
            setError("Bitte einen Empfänger auswählen");
            return;
        }
        try {
            await transferCo2({ toUserId: co2Recipient, amount: parseFloat(co2Amount), description: 'CO2 Transfer' });
            const updatedBalance = await getBalance();
            setBalance(updatedBalance);
            setCo2Amount('');
            // Empfänger lassen wir stehen oder resetten ihn, je nach Geschmack
            setError(null);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleMoneyTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!moneyRecipient) {
            setError("Bitte einen Empfänger auswählen");
            return;
        }
        try {
            await transferMoney({ toUserId: moneyRecipient, amount: parseFloat(moneyAmount), description: 'Money Transfer' });
            const updatedBalance = await getBalance();
            setBalance(updatedBalance);
            setMoneyAmount('');
            setError(null);
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (error) {
        return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
    }

    return (
      <div className="container mx-auto p-4 font-sans text-gray-800">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Mein Wallet</h1>

          <div className="mb-10">
              <h2 className="text-xl font-semibold mb-3">Aktueller Stand</h2>
              {balance ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm">
                        <p className="text-sm text-green-600 font-medium uppercase tracking-wider">CO2 Guthaben</p>
                        <p className="text-3xl font-bold text-green-800 mt-1">{balance.co2Balance} <span className="text-lg font-normal">kg</span></p>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                        <p className="text-sm text-blue-600 font-medium uppercase tracking-wider">Euro Guthaben</p>
                        <p className="text-3xl font-bold text-blue-800 mt-1">{balance.moneyBalance} <span className="text-lg font-normal">€</span></p>
                    </div>
                </div>
              ) : (
                <div className="animate-pulse flex space-x-4">
                    <div className="h-24 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-24 bg-gray-200 rounded w-1/2"></div>
                </div>
              )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* CO2 Form */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <span className="bg-green-100 text-green-600 p-2 rounded-full text-sm">🌱</span>
                      CO2 Transferieren
                  </h2>
                  <form onSubmit={handleCo2Transfer}>
                      <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Empfänger</label>
                          <select
                            value={co2Recipient}
                            onChange={(e) => setCo2Recipient(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            required
                          >
                              <option value="" disabled>Wähle einen Nutzer...</option>
                              {users.map((user) => (
                                <option key={user.userId} value={user.userId}>
                                    {user.vorname}
                                </option>
                              ))}
                          </select>
                      </div>
                      <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Menge (kg)</label>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={co2Amount}
                            onChange={(e) => setCo2Amount(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            placeholder="0.00"
                            required
                          />
                      </div>
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      >
                          CO2 Senden
                      </button>
                  </form>
              </div>

              {/* Money Form */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-600 p-2 rounded-full text-sm">💶</span>
                      Geld Senden
                  </h2>
                  <form onSubmit={handleMoneyTransfer}>
                      <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Empfänger</label>
                          <select
                            value={moneyRecipient}
                            onChange={(e) => setMoneyRecipient(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                          >
                              <option value="" disabled>Wähle einen Nutzer...</option>
                              {users.map((user) => (
                                <option key={user.userId} value={user.userId}>
                                    {user.vorname}
                                </option>
                              ))}
                          </select>
                      </div>
                      <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Betrag (€)</label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={moneyAmount}
                            onChange={(e) => setMoneyAmount(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="0.00"
                            required
                          />
                      </div>
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                          Geld Senden
                      </button>
                  </form>
              </div>
          </div>
      </div>
    );
}
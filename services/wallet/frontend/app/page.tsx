'use client';

import { useState, useEffect } from 'react';
import { getBalance, transferCo2, transferMoney, BalanceResponse } from './services/walletService';

export default function HomePage() {
    const [balance, setBalance] = useState<BalanceResponse | null>(null);
    const [co2Recipient, setCo2Recipient] = useState('');
    const [co2Amount, setCo2Amount] = useState('');
    const [moneyRecipient, setMoneyRecipient] = useState('');
    const [moneyAmount, setMoneyAmount] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const balance = await getBalance();
                setBalance(balance);
            } catch (err: any) {
                setError(err.message);
            }
        };
        fetchBalance();
    }, []);

    const handleCo2Transfer = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await transferCo2({ toUserId: co2Recipient, amount: parseFloat(co2Amount), description: 'CO2 Transfer' });
            const updatedBalance = await getBalance();
            setBalance(updatedBalance);
            setCo2Recipient('');
            setCo2Amount('');
            setError(null);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleMoneyTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await transferMoney({ toUserId: moneyRecipient, amount: parseFloat(moneyAmount), description: 'Money Transfer' });
            const updatedBalance = await getBalance();
            setBalance(updatedBalance);
            setMoneyRecipient('');
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
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Wallet</h1>

            <div className="mb-8">
                <h2 className="text-xl font-semibold">Balanzen</h2>
                {balance ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-lg">CO2: {balance.co2Balance} kg</p>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-lg">Geld: {balance.moneyBalance} €</p>
                        </div>
                    </div>
                ) : (
                    <p>Loading balance...</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">CO2 senden</h2>
                    <form onSubmit={handleCo2Transfer}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Empfänger</label>
                            <input
                                type="text"
                                value={co2Recipient}
                                onChange={(e) => setCo2Recipient(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Menge (kg)</label>
                            <input
                                type="number"
                                value={co2Amount}
                                onChange={(e) => setCo2Amount(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Senden
                        </button>
                    </form>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">Geld senden</h2>
                    <form onSubmit={handleMoneyTransfer}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Empfänger</label>
                            <input
                                type="text"
                                value={moneyRecipient}
                                onChange={(e) => setMoneyRecipient(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Menge (€)</label>
                            <input
                                type="number"
                                value={moneyAmount}
                                onChange={(e) => setMoneyAmount(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Senden
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
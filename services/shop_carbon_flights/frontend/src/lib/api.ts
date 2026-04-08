const API_BASE_URL = '/api/wallet';

export const flightApi = {
  bookFlight: async (userId: string, flight: any) => {
    // Ruft den neuen Service auf, der via Traefik unter /api/flights erreichbar ist
    const response = await fetch('/api/flights/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, flight }),
    });
    if (!response.ok) throw new Error('Booking failed');
    return response.json();
  },
};

export function getStoredUserId(): string {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.warn("Keine 'userId' im localStorage gefunden. Transaktionen könnten fehlschlagen.");
    return "";
  }
  return userId;
}

export interface BalanceResponse {
  co2Balance: number;
  moneyBalance: number;
}

export interface CombinedTransferRequest {
  toUserId: string;
  co2Amount: number;
  moneyAmount: number;
  description: string;
}

export interface TransactionEvent {
  eventType: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  description: string;
  timestamp: string;
}

export const walletApi = {
  getBalance: async (userId: string): Promise<BalanceResponse> => {
    const response = await fetch(`${API_BASE_URL}/balance`, {
      headers: {
        'X-User-ID': userId,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch balance');
    return response.json();
  },

  transferCombined: async (
    userId: string,
    request: CombinedTransferRequest
  ): Promise<TransactionEvent[]> => {
    const response = await fetch(`${API_BASE_URL}/transfer-combined`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': userId,
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Transfer failed');
    return response.json();
  },
};

const API_URL = '/api/wallet';

const getAuthHeaders = () => {
    const userId = localStorage.getItem('userId'); // Read userId from localStorage
    if (!userId) {
        throw new Error('User ID not found in local storage. Please log in.');
    }
    return {
        'Content-Type': 'application/json',
        'X-User-ID': userId,
    };
};

export interface CreateWalletRequest {
    userId: string;
    co2Balance: number;
    moneyBalance: number;
}

export interface Wallet {
    id: string;
    userId: string;
    co2Balance: number;
    moneyBalance: number;
}

export interface BalanceResponse {
    co2Balance: number;
    moneyBalance: number;
}

export interface Co2TransferRequest {
    toUserId: string;
    amount: number;
    description: string;
}

export interface MoneyTransferRequest {
    toUserId: string;
    amount: number;
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

export const createWallet = async (request: CreateWalletRequest): Promise<Wallet> => {
    const response = await fetch(`${API_URL}/wallets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
    });
    return response.json();
}

export const getBalance = async (): Promise<BalanceResponse> => {
    const response = await fetch(`${API_URL}/balance`, {
        headers: getAuthHeaders(),
    });
    return response.json();
}

export const transferCo2 = async (request: Co2TransferRequest): Promise<TransactionEvent> => {
    const response = await fetch(`${API_URL}/transfer-co2`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
    });
    return response.json();
}

export const transferMoney = async (request: MoneyTransferRequest): Promise<TransactionEvent> => {
    const response = await fetch(`${API_URL}/transfer-money`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
    });
    return response.json();
}

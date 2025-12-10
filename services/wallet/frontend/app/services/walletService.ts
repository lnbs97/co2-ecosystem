const API_URL = '/api/wallet';
const USER_SERVICE_URL = '/api/user-service';

const getAuthHeaders = () => {
    const userId = localStorage.getItem('userId');
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

export interface User {
    userId: string;
    vorname: string;
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

export const getUsers = async (): Promise<User[]> => {
    const response = await fetch(`${USER_SERVICE_URL}/users`);
    if (!response.ok) {
        throw new Error('Could not load user list'); // Übersetzt
    }
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
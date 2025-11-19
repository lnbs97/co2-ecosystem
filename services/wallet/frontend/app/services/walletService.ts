const API_URL = 'http://localhost:8080/api/wallet';

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
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });
    return response.json();
}

export const getBalance = async (userId: string): Promise<BalanceResponse> => {
    const response = await fetch(`${API_URL}/balance`, {
        headers: {
            'X-User-ID': userId,
        },
    });
    return response.json();
}

export const transferCo2 = async (fromUserId: string, request: Co2TransferRequest): Promise<TransactionEvent> => {
    const response = await fetch(`${API_URL}/transfer-co2`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-User-ID': fromUserId,
        },
        body: JSON.stringify(request),
    });
    return response.json();
}

export const transferMoney = async (fromUserId: string, request: MoneyTransferRequest): Promise<TransactionEvent> => {
    const response = await fetch(`${API_URL}/transfer-money`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-User-ID': fromUserId,
        },
        body: JSON.stringify(request),
    });
    return response.json();
}

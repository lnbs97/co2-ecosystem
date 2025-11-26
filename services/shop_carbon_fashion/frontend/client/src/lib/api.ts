import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const MERCHANT_ID = "shop-eco-fashion";

// Helper to get user ID from local storage
export function getStoredUserId(): string {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.warn("Keine 'userId' im localStorage gefunden. Transaktionen könnten fehlschlagen.");
    return "";
  }
  return userId;
}

// Types based on OpenAPI definition
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

// API Functions
async function getBalance(userId: string): Promise<BalanceResponse> {
  if (!userId) throw new Error("User ID is missing");

  const res = await fetch("/api/wallet/balance", {
    headers: {
      "X-User-ID": userId,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch balance");
  }
  return res.json();
}

async function transferCombined(data: CombinedTransferRequest): Promise<TransactionEvent[]> {
  const userId = getStoredUserId();
  if (!userId) throw new Error("User ID not found in storage");

  const res = await fetch("/api/wallet/transfer-combined", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-ID": userId,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorMessage = "Transfer failed";
    try {
      // Versuche, eine JSON-Fehlermeldung zu parsen (z.B. {"message": "Nicht genug CO2 Token"})
      const errorData = await res.json();
      if (errorData && typeof errorData === 'object') {
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } else {
        errorMessage = String(errorData);
      }
    } catch (e) {
      // Fallback auf reinen Text, falls kein JSON zurückkommt
      const text = await res.text();
      if (text) errorMessage = text;
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

// React Query Hooks
export function useBalance() {
  const userId = getStoredUserId();

  return useQuery({
    queryKey: ["balance", userId],
    queryFn: () => getBalance(userId),
    enabled: !!userId,
    refetchInterval: 5000,
    retry: 1,
  });
}

export function useCombinedTransfer() {
  const queryClient = useQueryClient();
  const userId = getStoredUserId();

  return useMutation({
    mutationFn: (data: CombinedTransferRequest) => transferCombined(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance", userId] });
    },
  });
}
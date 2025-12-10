<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCcw, 
  Wallet, 
  TrendingUp,
  X
} from 'lucide-vue-next';

// --- CONFIGURATION ---
const API_BASE = "/api/exchange-service";
const USER_API_BASE = "/api/user-service";

// --- STATE ---
const storedUserId = localStorage.getItem('userId');
const currentUser = ref(storedUserId ? { id: storedUserId, name: '' } : null);

const balance = ref({ eur: 0, tokens: 0 });
const orders = ref([]);
const loading = ref(false);
const message = ref({ text: "", type: "" });
const userNames = ref({}); 

// Default to 'buy' mode
const tradeMode = ref('buy'); // 'buy' or 'sell' UI toggle

const newOrder = ref({
    type: "buy", 
    amount_token: null,
    amount_cash: null
});

// --- COMPUTED ---
const isValidOrder = computed(() => {
    return newOrder.value.amount_token > 0 && newOrder.value.amount_cash > 0;
});

const isLoggedIn = computed(() => !!currentUser.value);

// --- API CLIENT ---
const api = {
    async request(endpoint, options = {}) {
        if (!isLoggedIn.value) throw new Error("Authentication missing");
        const headers = { 'X-User-ID': currentUser.value.id, ...options.headers };
        const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
        
        let data;
        try { data = await res.json(); } 
        catch (e) { data = { error: await res.text() || res.statusText }; }

        if (!res.ok) throw new Error(data.error || 'Unknown Error');
        return data;
    },
    get(endpoint) { return this.request(endpoint); },
    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    },
    delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
};

// --- LOGIC ---
const fetchUserName = async (userId) => {
    if (userNames.value[userId]) return;
    if (userId === currentUser.value.id && currentUser.value.name) {
        userNames.value[userId] = currentUser.value.name;
        return;
    }
    try {
        const res = await fetch(`${USER_API_BASE}/users/${userId}`);
        if (res.ok) {
            const data = await res.json();
            userNames.value[userId] = data.vorname;
        } else { userNames.value[userId] = "Unknown"; }
    } catch (e) { userNames.value[userId] = "Unknown"; }
};

const fetchMyName = async () => {
    if (!currentUser.value?.id) return;
    try {
        const res = await fetch(`${USER_API_BASE}/users/${currentUser.value.id}`);
        if (res.ok) {
            const data = await res.json();
            currentUser.value.name = data.vorname;
            userNames.value[currentUser.value.id] = data.vorname; 
        }
    } catch (e) { console.error(e); }
};

const fetchData = async () => {
    if (!isLoggedIn.value) return;
    loading.value = true;
    try {
        const [bal, ord] = await Promise.all([
            api.get('/balance'),
            api.get('/orders')
        ]);
        balance.value = bal;
        orders.value = ord;
        ord.forEach(order => fetchUserName(order.user_id));
    } catch (e) {
        showMessage("Connection Error", "error");
    } finally {
        loading.value = false;
    }
};

const createOrder = async () => {
    loading.value = true;
    // Set type based on current UI tab
    newOrder.value.type = tradeMode.value;
    
    try {
        await api.post('/orders', { ...newOrder.value });
        showMessage("Order Placed", "success");
        newOrder.value.amount_token = null;
        newOrder.value.amount_cash = null;
        await fetchData();
    } catch (e) {
        showMessage(e.message, "error");
    } finally {
        loading.value = false;
    }
};

const deleteOrder = async (orderId) => {
    try {
        await api.delete(`/orders/${orderId}`);
        await fetchData();
    } catch (e) { showMessage(e.message, "error"); }
};

const acceptOrder = async (order) => {
    try {
        await api.post(`/orders/${order.order_id}/accept`, {});
        showMessage("Transaction Successful", "success");
        await fetchData();
    } catch (e) { showMessage(e.message, "error"); }
};

// --- HELPER ---
const isMyOrder = (order) => order.user_id === currentUser.value?.id;
const formatCurrency = (val) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);

const showMessage = (text, type) => {
    message.value = { text, type };
    setTimeout(() => message.value = { text: "", type: "" }, 3000);
};

onMounted(() => {
    if (isLoggedIn.value) {
        fetchMyName();
        fetchData();
        setInterval(fetchData, 4000); 
    }
});
</script>

<template>
  <div class="min-h-screen bg-black text-white font-sans pt-24 pb-12 px-4 selection:bg-emerald-500/30">
    
    <div class="max-w-6xl mx-auto">
        
        <div class="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
            <div>
                <h1 class="text-3xl font-bold tracking-tight mb-1">Portfolio</h1>
                <div class="flex items-center gap-2 text-zinc-400 text-sm">
                    <span>Welcome back, {{ currentUser?.name || '...' }}</span>
                </div>
            </div>

            <div class="flex gap-6">
                <div class="text-right">
                    <span class="block text-xs font-medium text-zinc-500 uppercase tracking-wide">Cash Balance</span>
                    <span class="text-2xl font-bold tracking-tight">{{ formatCurrency(balance.eur) }}</span>
                </div>
                <div class="text-right border-l border-zinc-800 pl-6">
                    <span class="block text-xs font-medium text-zinc-500 uppercase tracking-wide">Carbon Assets</span>
                    <span class="text-2xl font-bold tracking-tight text-emerald-400">{{ balance.tokens }} <span class="text-sm text-emerald-600">CT</span></span>
                </div>
            </div>
        </div>

        <transition enter-from-class="opacity-0 translate-y-2" leave-to-class="opacity-0 translate-y-2">
            <div v-if="message.text" class="fixed bottom-6 right-6 z-50 bg-zinc-800 border border-zinc-700 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300">
                <div class="h-2 w-2 rounded-full" :class="message.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'"></div>
                <span class="text-sm font-medium">{{ message.text }}</span>
            </div>
        </transition>


        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div class="lg:col-span-4">
                <div class="bg-zinc-900 rounded-2xl p-6 sticky top-24 border border-zinc-800/50 shadow-xl">
                    
                    <div class="bg-black rounded-lg p-1 flex mb-6">
                        <button 
                            @click="tradeMode = 'buy'"
                            class="flex-1 py-2 text-sm font-bold rounded-md transition-all duration-200"
                            :class="tradeMode === 'buy' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'"
                        >
                            Buy
                        </button>
                        <button 
                            @click="tradeMode = 'sell'"
                            class="flex-1 py-2 text-sm font-bold rounded-md transition-all duration-200"
                            :class="tradeMode === 'sell' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'"
                        >
                            Sell
                        </button>
                    </div>

                    <div class="space-y-4">
                        <div class="group">
                            <label class="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Quantity (CT)</label>
                            <div class="relative">
                                <input 
                                    type="number" 
                                    v-model.number="newOrder.amount_token" 
                                    class="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-lg font-medium text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                    placeholder="0"
                                >
                                <div class="absolute right-4 top-3.5 text-zinc-600 text-sm font-medium">Tokens</div>
                            </div>
                        </div>

                        <div class="group">
                            <label class="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Total Price (€)</label>
                            <div class="relative">
                                <input 
                                    type="number" 
                                    v-model.number="newOrder.amount_cash" 
                                    class="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-lg font-medium text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                    placeholder="0.00"
                                >
                                <div class="absolute right-4 top-3.5 text-zinc-600 text-sm font-medium">EUR</div>
                            </div>
                        </div>
                    </div>

                    <button 
                        @click="createOrder" 
                        :disabled="loading || !isValidOrder"
                        class="w-full mt-8 py-4 rounded-xl font-bold text-base transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        :class="tradeMode === 'buy' 
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20' 
                            : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'"
                    >
                        <span v-if="loading" class="animate-pulse">Processing...</span>
                        <span v-else>{{ tradeMode === 'buy' ? 'Place Buy Order' : 'Place Sell Order' }}</span>
                    </button>

                </div>
            </div>


            <div class="lg:col-span-8">
                <div class="bg-zinc-900 rounded-2xl border border-zinc-800/50 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
                    
                    <div class="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
                        <h2 class="font-bold text-zinc-100 flex items-center gap-2">
                            <TrendingUp class="w-4 h-4 text-emerald-500" /> Market Activity
                        </h2>
                        <button @click="fetchData" class="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors">
                            <RefreshCcw class="w-4 h-4" :class="{'animate-spin': loading}" />
                        </button>
                    </div>

                    <div class="grid grid-cols-12 px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide border-b border-zinc-800 bg-zinc-900/50">
                        <div class="col-span-2">User</div>
                        <div class="col-span-3 text-right">Volume</div>
                        <div class="col-span-3 text-right">Price</div>
                        <div class="col-span-4 text-right">Action</div>
                    </div>

                    <div class="flex-grow overflow-y-auto">
                        
                        <div v-if="orders.length === 0" class="h-64 flex flex-col items-center justify-center text-zinc-600">
                            <div class="bg-zinc-800 p-4 rounded-full mb-3">
                                <RefreshCcw class="w-6 h-6 opacity-50" />
                            </div>
                            <span class="text-sm">Market is currently empty.</span>
                        </div>

                        <div v-for="order in orders" :key="order.order_id" 
                             class="grid grid-cols-12 px-6 py-4 items-center border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors group">
                            
                            <div class="col-span-2 flex items-center gap-2">
                                <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                                     :class="isMyOrder(order) ? 'bg-emerald-500 text-black' : 'bg-zinc-700 text-zinc-300'">
                                     {{ (isMyOrder(order) ? 'ME' : (userNames[order.user_id]?.[0] || '?')).toUpperCase() }}
                                </div>
                                <span class="text-sm font-medium truncate" :class="isMyOrder(order) ? 'text-emerald-400' : 'text-zinc-300'">
                                    {{ isMyOrder(order) ? 'You' : (userNames[order.user_id] || 'Loading...') }}
                                </span>
                            </div>

                            <div class="col-span-3 text-right font-medium text-white">
                                {{ order.amount_token }} <span class="text-zinc-600 text-xs">CT</span>
                            </div>

                            <div class="col-span-3 text-right font-medium text-white">
                                {{ formatCurrency(order.amount_cash) }}
                            </div>

                            <div class="col-span-4 flex justify-end">
                                <button v-if="isMyOrder(order)" @click="deleteOrder(order.order_id)" 
                                        class="p-2 rounded-lg text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors" title="Cancel Order">
                                    <X class="w-4 h-4" />
                                </button>

                                <button v-else @click="acceptOrder(order)" 
                                        class="px-5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all transform active:scale-95 shadow-lg"
                                        :class="order.type === 'buy' 
                                            ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-900/20' 
                                            : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-900/20'">
                                    {{ order.type === 'buy' ? 'Sell' : 'Buy' }}
                                </button>
                            </div>

                            <div v-if="isMyOrder(order)" class="col-span-12 mt-1">
                                <span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase tracking-wider">
                                    Your {{ order.type }} Order
                                </span>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

        </div>
    </div>
  </div>
</template>
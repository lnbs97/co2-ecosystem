<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Leaf, 
  PlusCircle, 
  List, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle 
} from 'lucide-vue-next';

// --- KONFIGURATION ---
const API_BASE = "/api/exchange-service";
const USER_API_BASE = "/api/user-service"; // Neu: Pfad zum User Service

// --- STATE ---
const storedUserId = localStorage.getItem('userId');
const currentUser = ref(storedUserId ? { id: storedUserId, name: '...' } : null);

const balance = ref({ eur: 0, tokens: 0 });
const orders = ref([]);
const loading = ref(false);
const message = ref({ text: "", type: "" });
const userNames = ref({}); // Cache für Namen: { "uuid": "Max" }

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
        if (!isLoggedIn.value) throw new Error("Nicht eingeloggt");

        const headers = { 
            'X-User-ID': currentUser.value.id,
            ...options.headers 
        };

        const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
        
        let data;
        try {
            data = await res.json();
        } catch (e) {
            data = { error: await res.text() || res.statusText };
        }

        if (!res.ok) throw new Error(data.error || 'Unbekannter Fehler');
        return data;
    },

    get(endpoint) {
        return this.request(endpoint);
    },

    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

// --- ACTIONS ---

// Neu: Lädt den Namen zu einer UUID
const fetchUserName = async (userId) => {
    // Wenn wir den Namen schon haben oder es der eigene User ist, abbrechen
    if (userNames.value[userId]) return;
    if (userId === currentUser.value.id) return; 

    try {
        const res = await fetch(`${USER_API_BASE}/users/${userId}`);
        if (res.ok) {
            const data = await res.json();
            userNames.value[userId] = data.vorname;
        } else {
            userNames.value[userId] = "Unbekannt";
        }
    } catch (e) {
        console.error("Konnte Name nicht laden", e);
        userNames.value[userId] = "Fehler";
    }
};

// Neu: Lädt den eigenen Namen (optional, für Anzeige oben rechts)
const fetchMyName = async () => {
    if (!currentUser.value?.id) return;
    try {
        const res = await fetch(`${USER_API_BASE}/users/${currentUser.value.id}`);
        if (res.ok) {
            const data = await res.json();
            currentUser.value.name = data.vorname;
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

        // Neu: Für jede Order den Namen nachladen, falls noch nicht bekannt
        ord.forEach(order => {
            fetchUserName(order.user_id);
        });

    } catch (e) {
        showMessage("Ladefehler: " + e.message, "error");
    } finally {
        loading.value = false;
    }
};

const createOrder = async () => {
    loading.value = true;
    try {
        await api.post('/orders', { ...newOrder.value });
        showMessage("Order erfolgreich erstellt!", "success");
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
    if(!confirm("Order wirklich löschen?")) return;
    try {
        await api.delete(`/orders/${orderId}`);
        showMessage("Order gelöscht", "success");
        await fetchData();
    } catch (e) {
        showMessage(e.message, "error");
    }
};

const acceptOrder = async (order) => {
    if(!confirm(`Trade ausführen mit ${userNames.value[order.user_id] || 'dem Nutzer'}?`)) return;
    try {
        await api.post(`/orders/${order.order_id}/accept`, {});
        showMessage("Trade erfolgreich!", "success");
        await fetchData();
    } catch (e) {
        showMessage(e.message, "error");
    }
};

// --- UTILS ---
const isMyOrder = (order) => order.user_id === currentUser.value?.id;

const formatCurrency = (val) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);

const showMessage = (text, type) => {
    message.value = { text, type };
    setTimeout(() => message.value = { text: "", type: "" }, 4000);
};

// --- LIFECYCLE ---
onMounted(() => {
    if (isLoggedIn.value) {
        fetchMyName(); // Eigenen Namen laden
        fetchData();
        setInterval(fetchData, 5000);
    }
});
</script>

<template>
  <div class="min-h-screen bg-base-200 p-4 font-sans">
    
    <!-- LOGIN WARNING OVERLAY -->
    <div v-if="!isLoggedIn" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="card w-96 bg-base-100 shadow-xl">
            <div class="card-body text-center items-center">
                <AlertCircle class="w-16 h-16 text-error mb-2" />
                <h2 class="card-title">Nicht eingeloggt</h2>
                <p>Bitte logge dich zuerst über den HUB ein, um auf die Börse zuzugreifen.</p>
                <div class="card-actions justify-end mt-4">
                    <a href="/" class="btn btn-primary">Zum Hub</a>
                </div>
            </div>
        </div>
    </div>

    <div class="max-w-6xl mx-auto" :class="{ 'blur-sm pointer-events-none': !isLoggedIn }">
        <!-- Navbar -->
        <div class="navbar bg-base-100 rounded-box shadow-lg mb-6">
            <div class="flex-1">
                <a class="btn btn-ghost normal-case text-xl text-primary gap-2">
                    <Leaf class="w-6 h-6" /> EcoExchange
                </a>
            </div>
            <div class="flex-none gap-4">
                <div class="stats shadow scale-90 sm:scale-100 bg-base-200">
                    <div class="stat p-2 place-items-center">
                        <div class="stat-title text-xs">Wallet (EUR)</div>
                        <div class="stat-value text-success text-lg">{{ formatCurrency(balance.eur) }}</div>
                    </div>
                    <div class="stat p-2 place-items-center">
                        <div class="stat-title text-xs">CO2 Tokens</div>
                        <div class="stat-value text-secondary text-lg">{{ balance.tokens }}</div>
                    </div>
                </div>

                <div class="dropdown dropdown-end">
                    <label tabindex="0" class="btn btn-ghost btn-circle avatar placeholder">
                        <div class="bg-neutral-focus text-neutral-content rounded-full w-10">
                            <!-- Erster Buchstabe des Namens oder '?' -->
                            <span>{{ currentUser?.name?.charAt(0).toUpperCase() || currentUser?.id?.charAt(0).toUpperCase() || '?' }}</span>
                        </div>
                    </label>
                    <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-64 break-all">
                        <li><a class="font-bold">{{ currentUser?.name || 'Lade...' }}</a></li>
                        <li><a class="text-xs text-gray-500">ID: {{ currentUser?.id }}</a></li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Create Order -->
            <div class="card bg-base-100 shadow-xl h-fit">
                <div class="card-body">
                    <h2 class="card-title text-base-content flex gap-2">
                        <PlusCircle class="w-5 h-5" /> Neue Order
                    </h2>
                    
                    <div class="form-control w-full">
                        <label class="label"><span class="label-text">Ich möchte...</span></label>
                        <div class="join w-full">
                            <input class="join-item btn w-1/2" :class="{'btn-primary': newOrder.type === 'buy'}" type="radio" value="buy" v-model="newOrder.type" aria-label="Kaufen" />
                            <input class="join-item btn w-1/2" :class="{'btn-secondary': newOrder.type === 'sell'}" type="radio" value="sell" v-model="newOrder.type" aria-label="Verkaufen" />
                        </div>
                    </div>

                    <div class="form-control w-full mt-2">
                        <label class="label"><span class="label-text">Menge (Tokens)</span></label>
                        <input type="number" v-model.number="newOrder.amount_token" class="input input-bordered w-full" placeholder="0" />
                    </div>

                    <div class="form-control w-full mt-2">
                        <label class="label"><span class="label-text">Gesamtpreis (€)</span></label>
                        <input type="number" v-model.number="newOrder.amount_cash" class="input input-bordered w-full" placeholder="0.00" />
                    </div>

                    <div class="divider"></div>
                    
                    <div class="text-xs text-center mb-4 opacity-70">
                        <span v-if="newOrder.type === 'buy'">Reserviere <strong>{{ formatCurrency(newOrder.amount_cash || 0) }}</strong> im Treuhandkonto.</span>
                        <span v-else>Reserviere <strong>{{ newOrder.amount_token || 0 }} Tokens</strong> im Treuhandkonto.</span>
                    </div>

                    <button class="btn btn-primary w-full" @click="createOrder" :disabled="loading || !isValidOrder">
                        <span v-if="loading" class="loading loading-spinner"></span> Order Erstellen
                    </button>
                </div>
            </div>

            <!-- Order List -->
            <div class="lg:col-span-2 flex flex-col gap-6">
                <transition name="fade">
                    <div v-if="message.text" :class="`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'} shadow-lg`">
                        <component :is="message.type === 'error' ? AlertCircle : CheckCircle" class="w-6 h-6" />
                        <span>{{ message.text }}</span>
                    </div>
                </transition>

                <div class="card bg-base-100 shadow-xl">
                    <div class="card-body p-0">
                        <div class="p-4 border-b border-base-200 flex justify-between items-center">
                            <h2 class="card-title gap-2"><List class="w-5 h-5"/> Orderbuch</h2>
                            <button class="btn btn-sm btn-ghost" @click="fetchData"><RefreshCw class="w-4 h-4"/></button>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="table table-zebra w-full">
                                <thead>
                                    <tr>
                                        <th>Typ</th>
                                        <th>Menge</th>
                                        <th>Preis</th>
                                        <th>User</th>
                                        <th>Aktion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="orders.length === 0">
                                        <td colspan="5" class="text-center py-8 text-gray-500">Keine offenen Orders.</td>
                                    </tr>
                                    <tr v-for="order in orders" :key="order.order_id">
                                        <td>
                                            <div class="badge font-bold" :class="order.type === 'buy' ? 'badge-success' : 'badge-secondary'">
                                                {{ order.type.toUpperCase() }}
                                            </div>
                                        </td>
                                        <td class="font-mono font-bold">{{ order.amount_token }}</td>
                                        <td class="font-mono">{{ formatCurrency(order.amount_cash) }}</td>
                                        <td>
                                            <!-- HIER IST DIE ÄNDERUNG: Name statt ID -->
                                            <span class="text-xs" :class="{'font-bold': isMyOrder(order)}">
                                                {{ isMyOrder(order) ? 'Du' : (userNames[order.user_id] || 'Lade...') }}
                                            </span>
                                        </td>
                                        <td>
                                            <button v-if="isMyOrder(order)" class="btn btn-error btn-xs" @click="deleteOrder(order.order_id)">Löschen</button>
                                            <button v-else class="btn btn-primary btn-xs" @click="acceptOrder(order)">
                                                {{ order.type === 'buy' ? 'Verkaufen' : 'Kaufen' }}
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}
</style>
<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';
import { io } from 'socket.io-client';

const isOpen = ref(false);
const userName = ref('');
const userType = ref(''); // ⭐️ NEU: Speichert 'arm' oder 'reich'
const tasksState = ref({}); 
const isInitialAllocationAcknowledged = ref(false);

// Achievement Logic
const lastCompletedTask = ref(null); 
const showAchievement = ref(false);
let socket = null; 

// --- 1. TASK DEFINITIONS (Generisch benannt nach Typ) ---

// Hat viel Geld, aber wenig Tokens -> Muss Tokens kaufen
const richTasks = [
    { id: 'rich_liq', title: "Secure Carbon Liquidity", desc: "Purchase Tokens in the Exchange Service" },
    { id: 'rich_flight', title: "Book Business Flight", desc: "Book a flight via Travel Service." },
    { id: 'rich_suit', title: "Update Wardrobe", desc: "Buy a Navy Blue Blazer in the Shop." }
];

// Hat wenig Geld, aber viele Tokens -> Muss Tokens verkaufen
const poorTasks = [
    { id: 'poor_sell', title: "Monetize Carbon Surplus", desc: "Sell tokens on the Exchange to generate Cash." },
    { id: 'poor_bike', title: "SustainableMobility", desc: "Book a train ticket via Train Shop" },
    { id: 'poor_jacket', title: "Basics Essentials", desc: "Buy the Essential Black T-Shirt in the Shop." }
];

const defaultTasks = [
    { id: 'def_login', title: "System Login", desc: "Access the terminal." }
];

// --- 2. PERSONA DATA (Logik basiert jetzt auf userType) ---
const personaData = computed(() => {
    // Wir prüfen hier den userType vom Backend
    
    if (userType.value === 'reich') {
        return {
            role: 'HIGH INCOME / CONSUMER',
            // Werte angepasst an dein Python Backend (1000€ / 5 CO2)
            desc: 'Your consumption profile is classified as HIGH INTENSITY. Your initial carbon allowance is critically low. Use your financial capital to acquire necessary emission rights immediately.',
            startCash: 64500.00,
            startToken: 850.00,     
            tasks: richTasks
        };
    } else if (userType.value === 'arm') {
        return {
            role: 'LOW INCOME / SAVER',
            // Werte angepasst an dein Python Backend (50€ / 100 CO2)
            desc: 'Your consumption profile is MINIMAL. You have been allocated a surplus of Carbon Tokens. Your liquidity is low; consider trading your surplus rights for currency.',
            startCash: 42.50,     
            startToken: 310000.00,
            tasks: poorTasks
        };
    } else {
        // Fallback, falls API noch lädt oder Fehler
        return {
            role: 'CITIZEN',
            desc: 'Standard profile loaded. Manage your resources wisely.',
            startCash: 0,
            startToken: 0,
            tasks: defaultTasks
        };
    }
});

// --- 3. PROGRESS LOGIC ---
const currentTasks = computed(() => {
    return personaData.value.tasks.map(t => ({
        ...t,
        completed: !!tasksState.value[t.id]
    }));
});

const progress = computed(() => {
    const total = currentTasks.value.length;
    const done = currentTasks.value.filter(t => t.completed).length;
    return { done, total, percent: total > 0 ? (done / total) * 100 : 0 };
});

const saveProgress = () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        localStorage.setItem(`onboarding_tasks_${userId}`, JSON.stringify(tasksState.value));
    }
};
const loadProgress = () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        const saved = localStorage.getItem(`onboarding_tasks_${userId}`);
        if (saved) {
            tasksState.value = JSON.parse(saved);
        } else {
            // Wichtig: Wenn neuer User -> Resetten!
            tasksState.value = {}; 
        }
    }
};

const saveAcknowledgement = () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        localStorage.setItem(`onboarding_ack_${userId}`, 'true');
        isInitialAllocationAcknowledged.value = true;
    }
};

const loadAcknowledgement = () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        const ack = localStorage.getItem(`onboarding_ack_${userId}`);
        isInitialAllocationAcknowledged.value = ack === 'true';
    }
};

// --- 4. AUTOMATION & EVENTS ---
const handleGlobalEvents = (event) => {
    if (event.type === 'toggle-onboarding-modal') {
        if (event.detail && event.detail.forceOpen) openModal();
        else isOpen.value ? closeModal() : openModal();
    }
};

// ⭐️ NEU: WebSocket Setup
const setupWebSocket = () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    // Verbindung zum User-Service aufbauen
    // Falls du Traefik nutzt, hier die Public URL (z.B. localhost/api/user-service oder direkt Port 8080)
    // Für Dev Umgebung direkt auf den Port:
    socket = io({
        transports: ["websocket"], // Erzwingt Websocket (schneller)
    });

    socket.on("connect", () => {
        console.log("🟢 WebSocket Connected!");
    });

    // WIR HÖREN AUF DAS EVENT VOM BACKEND
    socket.on("task_update", (data) => {
        // Prüfen: Ist das Event für MICH?
        if (data.userId === userId) {
            console.log("🚀 WebSocket Event empfangen:", data.taskId);
            
            // Task abhaken
            if (!tasksState.value[data.taskId]) {
                tasksState.value[data.taskId] = true;
                saveProgress();
            }
        }
    });
};

const fetchInitialStatus = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    try {
        const res = await axios.get(`/api/user-service/users/${userId}/tasks`);
        const serverTasks = res.data.completed_tasks || [];
        serverTasks.forEach(taskId => {
            if (!tasksState.value[taskId]) tasksState.value[taskId] = true;
        });
        saveProgress();
    } catch (e) { console.warn(e); }
};

const formatNumber = (num) => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num);
};

// --- 5. API & INIT ---
const openModal = () => {
  fetchUserData(); // Lädt jetzt auch den Typ!
  loadProgress();
  fetchInitialStatus();
  loadAcknowledgement();
  isOpen.value = true;
};
const closeModal = () => {
    saveAcknowledgement();
    isOpen.value = false;
};

// ⭐️ NEU: Holt Name UND Typ
async function fetchUserData() {
  const userId = localStorage.getItem('userId');
  if (!userId) return;
  try {
    const res = await axios.get('/api/user-service/me', { headers: { 'Authorization': `Bearer ${userId}` } });
    
    // Wir erwarten JSON: { "vorname": "Alex", "userType": "arm", ... }
    userName.value = res.data.vorname; 
    userType.value = res.data.userType; // Speichern für die Logik
    
  } catch (e) { console.error("Fehler beim Laden der User-Daten:", e); }
}

onMounted(() => {
  loadProgress();
  fetchUserData();
  fetchInitialStatus();
  setupWebSocket();
  window.addEventListener('toggle-onboarding-modal', handleGlobalEvents);
});

onUnmounted(() => {
  if (socket) socket.disconnect();

  window.removeEventListener('toggle-onboarding-modal', handleGlobalEvents);
});
</script>

<template>
  <div>
    <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
        
        <div class="fixed inset-0 bg-slate-950/90 backdrop-blur-sm" @click="closeModal"></div>

        <div class="relative bg-slate-900 border border-slate-700 shadow-2xl w-full max-w-2xl overflow-hidden z-[101] my-8 animate-in zoom-in duration-300">
          
          <div class="absolute top-0 left-0 w-full h-1 bg-slate-800"></div>
          <div class="absolute top-0 left-0 h-1 bg-emerald-500 transition-all duration-700 ease-out" :style="{ width: progress.percent + '%' }"></div>
          
          <div class="absolute top-2 right-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
             PROTOCOL: {{ userType === 'reich' ? 'CLASS_A_PRIORITY' : 'CLASS_B_STANDARD' }}
          </div>

          <div class="p-8">

            <div class="flex justify-between items-start mb-6">
              <div>
                <h2 class="text-2xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Status Report
                </h2>
                <div class="mt-2 font-mono uppercase text-sm">
                   <span class="text-slate-400">Citizen:</span> <span class="text-white font-bold mr-3">{{ userName || 'UNKNOWN' }}</span>
                   <span class="text-slate-400">Class:</span> <span class="text-emerald-500 font-bold">{{ personaData.role }}</span>
                </div>
              </div>
              <button @click="closeModal" class="text-slate-500 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div v-if="!isInitialAllocationAcknowledged" class="space-y-6 text-slate-300 mb-8">
              <p class="text-sm leading-relaxed border-l-2 border-emerald-500/50 pl-4 bg-slate-950/30 py-2">
                 {{ personaData.desc }}
              </p>

              <div class="bg-slate-950 border border-slate-800 p-4 font-mono text-sm relative overflow-hidden">
                 <div class="absolute top-0 right-0 p-2 text-slate-700 text-[10px]">INITIAL_ALLOCATION_DATA</div>
                 <div class="grid grid-cols-2 gap-4">
                    <div>
                       <span class="block text-xs text-slate-500 uppercase mb-1">Carbon Tokens</span>
                       <span class="text-xl font-bold text-emerald-400 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2v-2zm8 0h-2v2h2v-2zM9 9h2v2H9V9z" clip-rule="evenodd" /></svg>
                          {{ formatNumber(personaData.startToken / 1000) }} CT
                       </span>
                    </div>

                    <div>
                       <span class="block text-xs text-slate-500 uppercase mb-1">Euro Balance</span>
                       <span class="text-xl font-bold text-blue-400">
                          € {{ formatNumber(personaData.startCash) }}
                       </span>
                    </div>
                 </div>
              </div>
            </div>

            <div>
               <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-4 flex justify-between items-center">
                 Required Protocols
                 <span v-if="progress.percent === 100" class="text-emerald-500 text-[10px] animate-pulse">● ALL OBJECTIVES MET</span>
               </h3>
               
               <ul class="space-y-3 font-mono text-sm">
                  <li v-for="task in currentTasks" :key="task.id" 
                      class="relative flex items-start gap-4 p-3 border transition-all duration-500 overflow-hidden"
                      :class="task.completed 
                          ? 'bg-emerald-900/10 border-emerald-500/30' 
                          : 'bg-slate-950 border-slate-800 opacity-90'"
                  >
                      <div v-if="task.completed" class="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>

                      <div class="relative mt-1 flex-shrink-0 w-5 h-5 flex items-center justify-center border transition-colors duration-300"
                           :class="task.completed ? 'bg-emerald-600 border-emerald-600' : 'bg-slate-900 border-slate-700'">
                          <svg v-if="task.completed" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-slate-950" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                     
                      <div class="transition-all duration-300" :class="{'opacity-50 blur-[0.5px] line-through text-slate-500': task.completed}">
                          <strong class="block text-white mb-0.5" :class="{'text-emerald-400': task.completed}">{{ task.title }}</strong>
                          <span class="text-xs text-slate-400">{{ task.desc }}</span>
                      </div>

                      <div v-if="task.completed" class="absolute right-3 top-3 text-[10px] font-bold text-emerald-500 uppercase tracking-widest border border-emerald-500/30 px-1 py-0.5 rounded rotate-[-2deg]">
                          Completed
                      </div>
                  </li>
               </ul>
            </div>

            <div class="mt-8 pt-4 border-t border-slate-800">
               <button @click="closeModal" class="w-full bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 font-bold uppercase tracking-widest py-3 transition-colors flex justify-center items-center gap-2 text-sm">
                  {{ isInitialAllocationAcknowledged ? 'CLOSE REPORT' : 'ACKNOWLEDGE & CLOSE' }}
               </button>
            </div>

          </div>
        </div>
      </div>
    </transition>

    <transition 
      enter-active-class="transform transition ease-out duration-500" 
      enter-from-class="translate-y-[-100%] opacity-0" 
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transform transition ease-in duration-300" 
      leave-from-class="translate-y-0 opacity-100" 
      leave-to-class="translate-y-[-100%] opacity-0"
    >
      <div v-if="showAchievement" class="fixed top-24 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md pointer-events-none">
        <div class="mx-4 bg-slate-900 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] p-4 relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent animate-scan"></div>
            <div class="flex items-center gap-4 relative z-10">
                <div class="bg-emerald-500 text-slate-900 p-2 font-bold rounded-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                    <div class="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mb-1">Protocol Completed</div>
                    <div class="text-lg font-bold text-white uppercase tracking-wider shadow-black drop-shadow-md">
                        {{ lastCompletedTask?.title }}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
@keyframes scan {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
}
.animate-scan {
    animation: scan 2s linear infinite;
}
</style>
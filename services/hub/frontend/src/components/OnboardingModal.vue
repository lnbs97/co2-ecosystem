<template>
  <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" @click="closeModal"></div>

      <div class="relative bg-slate-900 border border-slate-700 shadow-2xl w-full max-w-2xl p-8 overflow-hidden z-[101] animate-in zoom-in duration-300">
        
        <div class="absolute top-0 left-0 w-full h-1 bg-emerald-600"></div>
        <div class="absolute top-1 right-2 text-[10px] font-mono text-slate-600">PROTOCOL: CITIZEN_INIT_V4</div>

        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="text-2xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              REGISTRATION SUCCESSFUL
            </h2>
            <p class="text-sm text-emerald-500 font-mono mt-1 uppercase">
              Welcome to the grid, Citizen {{ userName || 'UKNOWN' }}.
            </p>
          </div>
          <button @click="closeModal" class="text-slate-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>


        <div class="space-y-6 text-slate-300">
          
          <p class="text-sm leading-relaxed">
            Your biometric data has been processed in accordance with <strong class="text-white">Emergency Decree §2030-B</strong>. You have been allocated an initial carbon allowance. Every economic interaction now carries a mandatory CO2 cost. Manage it wisely; insolvency is not an option.
          </p>

          <div class="bg-slate-950 border border-slate-800 p-4 font-mono text-sm relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
             <div class="absolute top-0 right-0 p-2 text-slate-700 text-xs">INITIAL_ALLOCATION_DATA</div>
             <div class="grid grid-cols-2 gap-4">
                <div>
                   <span class="block text-xs text-slate-500 uppercase mb-1">Carbon Tokens (CT)</span>
                   <span class="text-xl font-bold text-emerald-400 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2v-2zm8 0h-2v2h2v-2zM9 9h2v2H9V9z" clip-rule="evenodd" /></svg>
                      500.00 CT
                   </span>
                </div>
                <div>
                   <span class="block text-xs text-slate-500 uppercase mb-1">Fiat Credit (€)</span>
                   <span class="text-xl font-bold text-blue-400">
                      € 1,000.00
                   </span>
                </div>
             </div>
          </div>


          <div>
             <h3 class="text-sm font-bold text-white uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">
               Mandatory Onboarding Tasks
             </h3>
             <ul class="space-y-2 font-mono text-sm">
                <li class="flex items-start gap-3 p-2 hover:bg-slate-900/50 border border-transparent hover:border-slate-800 transition-colors cursor-pointer group">
                   <input type="checkbox" class="accent-emerald-600 mt-1 h-4 w-4 rounded-none border-slate-600 bg-slate-950 checked:bg-emerald-600" id="task1">
                   <label for="task1" class="group-hover:text-emerald-300 cursor-pointer">
                      Complete your first transaction simulation in the <strong class="text-purple-400">Cart Sim</strong>.
                   </label>
                </li>
                <li class="flex items-start gap-3 p-2 hover:bg-slate-900/50 border border-transparent hover:border-slate-800 transition-colors cursor-pointer group">
                   <input type="checkbox" class="accent-emerald-600 mt-1 h-4 w-4 rounded-none border-slate-600 bg-slate-950 checked:bg-emerald-600" id="task2">
                   <label for="task2" class="group-hover:text-blue-300 cursor-pointer">
                      Trade on the <strong class="text-blue-400">Exchange</strong> until you acquire 100 surplus CT tokens.
                   </label>
                </li>
                 <li class="flex items-start gap-3 p-2 hover:bg-slate-900/50 border border-transparent hover:border-slate-800 transition-colors cursor-pointer group">
                   <input type="checkbox" class="accent-emerald-600 mt-1 h-4 w-4 rounded-none border-slate-600 bg-slate-950 checked:bg-emerald-600" id="task3">
                   <label for="task3" class="group-hover:text-white cursor-pointer">
                      Review your current emission status in the <strong class="text-emerald-400">Wallet</strong> dashboard.
                   </label>
                </li>
             </ul>
          </div>

        </div>

        <div class="mt-8">
           <button @click="closeModal" class="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest py-3 transition-colors flex justify-center items-center gap-2">
              ACKNOWLEDGE & PROCEED
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
           </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

const isOpen = ref(false);
const userName = ref('');

// Event name to listen for
const EVENT_NAME = 'toggle-onboarding-modal';

const openModal = () => {
  fetchUserName(); // Fetch name right before opening
  isOpen.value = true;
  // Optional: Prevent background scrolling when modal is open
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  isOpen.value = false;
  document.body.style.overflow = '';
};

// Function to handle the custom event
const handleToggleEvent = (event) => {
  // If event contains detail.forceOpen = true, open it. Otherwise toggle.
  if (event.detail && event.detail.forceOpen) {
      openModal();
  } else {
      isOpen.value ? closeModal() : openModal();
  }
};

async function fetchUserName() {
  const userId = localStorage.getItem('userId');
  if (!userId) return;

  try {
    // Using the same API endpoint as in AppHeader to get the name
    const response = await axios.get('/api/user-service/me', {
      headers: { 'Authorization': `Bearer ${userId}` }
    });
    userName.value = response.data.vorname;
  } catch (error) {
    console.error("Could not fetch username for modal:", error);
    userName.value = 'CITIZEN';
  }
}

// Listen for the global event
onMounted(() => {
  window.addEventListener(EVENT_NAME, handleToggleEvent);
  // Optional: Check if just registered to auto-open (could be done via query param too)
});

onUnmounted(() => {
  window.removeEventListener(EVENT_NAME, handleToggleEvent);
});
</script>
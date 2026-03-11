<template>
  <div class="navbar fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 h-16">
    
    <div class="flex items-center gap-4">
      <router-link to="/" class="btn btn-ghost hover:bg-transparent text-xl font-mono font-bold tracking-widest text-slate-100 hover:text-emerald-500 transition-colors">
        <span class="text-emerald-600 mr-2">EU::</span>CO2_HUB
      </router-link> 
      
      <button v-if="isLoggedIn" @click="openOnboardingModal" class="btn btn-sm btn-ghost hover:bg-slate-900 text-xs font-mono text-slate-400 hover:text-emerald-400 border border-transparent hover:border-slate-700 uppercase tracking-wider flex items-center gap-2 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
          TASKS
          <span class="flex h-2 w-2 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
      </button>
    </div>
    <div class="flex-none ml-auto">

      <ul v-if="isLoggedIn" class="menu menu-horizontal px-1 items-center gap-4">
        <li v-if="userName" class="hidden md:block text-xs font-mono text-slate-400 uppercase tracking-wider mr-2">
          USER: <span class="text-emerald-500">{{ userName }}</span>
        </li>

        <li>
          <button @click="handleLogout" class="rounded-none border border-red-900/50 bg-red-900/10 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-500 text-xs font-mono uppercase tracking-widest px-6 py-2 transition-all duration-300">
            [ LOGOUT ]
          </button>
        </li>
      </ul>

      <ul v-else class="menu menu-horizontal px-1">
        <li>
          <router-link to="/register" class="rounded-none border border-emerald-500/50 bg-emerald-900/10 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 text-xs font-mono uppercase tracking-widest px-6 py-2 transition-all duration-300">
            INITIATE_REGISTRATION
          </router-link>
        </li>
      </ul>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'; 
import { useRouter } from 'vue-router';
import axios from 'axios'; 

// ... (Rest des bestehenden Codes für Auth Logic bleibt gleich) ...
const router = useRouter();
const isLoggedIn = ref(false); 
const userName = ref(''); 

// ⭐️ NEUE FUNKTION: Feuert das Event, um das Modal zu öffnen
function openOnboardingModal() {
  // Wir senden ein Custom Event, auf das das Modal lauscht.
  // Wir nutzen 'forceOpen: true', damit es sich sicher öffnet und nicht nur toggelt.
  window.dispatchEvent(new CustomEvent('toggle-onboarding-modal', { detail: { forceOpen: true } }));
}

// --- AUTH LOGIC (UNVERÄNDERT) ---
async function fetchUserData() {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    isLoggedIn.value = false;
    userName.value = '';
    return; 
  }
  try {
    const response = await axios.get('/api/user-service/me', {
      headers: { 'Authorization': `Bearer ${userId}` }
    });
    isLoggedIn.value = true;
    userName.value = response.data.vorname; 
  } catch (error) {
    console.error("Fehler beim Abrufen der Nutzerdaten:", error);
    handleLogout(); 
  }
}

function updateLoginState() {
  fetchUserData();
}

function handleLogout() {
  const currentUserId = localStorage.getItem('userId');
  if (currentUserId) {
      localStorage.removeItem(`onboarding_tasks_${currentUserId}`);
  }
  localStorage.removeItem('userId');
  isLoggedIn.value = false; 
  userName.value = ''; 
  window.location.href = '/';
}

onMounted(() => {
  updateLoginState(); 
  window.addEventListener('storage-changed', updateLoginState); 
});

onUnmounted(() => {
  window.removeEventListener('storage-changed', updateLoginState);
});
</script>
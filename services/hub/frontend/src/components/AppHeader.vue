<template>
  <div class="navbar fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 h-16">
    
    <div class="flex-1">
      <router-link to="/" class="btn btn-ghost hover:bg-transparent text-xl font-mono font-bold tracking-widest text-slate-100 hover:text-emerald-500 transition-colors">
        <span class="text-emerald-600 mr-2">EU::</span>CO2_HUB
      </router-link> 
    </div>

    <div class="flex-none">

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
import axios from 'axios'; // ⭐️ NEU: Axios importieren

const router = useRouter();
const isLoggedIn = ref(false); // Beginnt standardmäßig als "ausgeloggt"
const userName = ref(''); // ⭐️ NEU: Ref für den Vornamen

// ⭐️ NEUE FUNKTION: Holt Nutzerdaten vom Backend
async function fetchUserData() {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    isLoggedIn.value = false;
    userName.value = '';
    return; // Nichts tun, wenn keine userId da ist
  }

  try {
    // Rufe den NEUEN Backend-Endpunkt auf
    // WICHTIG: Sende die userId im Authorization-Header
    const response = await axios.get('/api/user-service/me', {
      headers: {
        'Authorization': `Bearer ${userId}`
      }
    });

    // Speichere die Daten und setze den Status
    isLoggedIn.value = true;
    userName.value = response.data.vorname; // Holt den Vornamen aus der Antwort

  } catch (error) {
    console.error("Fehler beim Abrufen der Nutzerdaten:", error);
    // Wenn der Nutzer nicht gefunden wurde (z.B. 404), logge ihn aus
    handleLogout(); // Loggt den Nutzer aus (löscht die ungültige ID)
  }
}

// ⭐️ ANGEPASST: Diese Funktion wird jetzt von überall aufgerufen
function updateLoginState() {
  // Wenn der Status sich ändert, versuche IMMER, die Nutzerdaten neu zu laden
  fetchUserData();
}

// Beim Logout:
function handleLogout() {
  localStorage.removeItem('userId');
  
  // Setzt Variablen zurück (optisch schneller als der Reload)
  isLoggedIn.value = false; 
  userName.value = ''; 

  // Erzwingt den Reload und geht zur Startseite
  window.location.href = '/';
}

// Wenn die Komponente lädt (Seitenaufbau)
onMounted(() => {
  updateLoginState(); // ⭐️ Lade Daten beim Start
  window.addEventListener('storage-changed', updateLoginState); // Höre auf Login/Logout
});

// Aufräumen
onUnmounted(() => {
  window.removeEventListener('storage-changed', updateLoginState);
});
</script>
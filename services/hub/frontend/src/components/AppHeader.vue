<template>
  <div class="navbar bg-base-100 shadow-xl">
    <div class="flex-1">
      <router-link to="/" class="btn btn-ghost text-xl">CO2 Hub</router-link> 
    </div>
    <div class="flex-none">

      <ul v-if="isLoggedIn" class="menu menu-horizontal px-1">
        <li>
          <button @click="handleLogout" class="btn btn-outline btn-error">
            Ausloggen
          </button>
        </li>
      </ul>

      <ul v-else class="menu menu-horizontal px-1">
        <!-- <li><router-link to="/login" class="btn btn-neutral">Login</router-link></li> --> 
        <li><router-link to="/register" class="btn btn-primary">Registrieren</router-link></li>
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
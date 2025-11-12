<template>
  <label class="swap swap-rotate">
    
    <input 
      type="checkbox" 
      v-model="isDark" 
      @change="toggleTheme" 
    />
    
    <svg class="swap-off fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M5.64,17l1.41,1.41L11.4,14.05c-0.49-0.3-0.97-0.61-1.4-0.98L5.64,17z M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9S16.97,3,12,3z M12,19c-3.86,0-7-3.14-7-7s3.14-7,7-7s7,3.14,7,7S15.86,19,12,19z M17.45,14.05l-1.41,1.41L17.4,17l1.41-1.41L17.45,14.05z M12.5,13.07c0.37-0.08,0.74-0.17,1.1-0.29l-1.45-1.45C12.08,11.7,12,12.17,12,12.7c0,0.17,0.01,0.34,0.03,0.5L12.5,13.07z M12,5.5c-3.03,0-5.5,2.47-5.5,5.5s2.47,5.5,5.5,5.5s5.5-2.47,5.5-5.5S15.03,5.5,12,5.5z M18.36,6.64l-1.41-1.41L12.6,9.58c0.49,0.3,0.97,0.61,1.4,0.98L18.36,6.64z"/>
    </svg>
    
    <svg class="swap-on fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9S16.97,3,12,3z M12,19c-3.86,0-7-3.14-7-7s3.14-7,7-7s7,3.14,7,7S15.86,19,12,19z M12,5.5c-3.03,0-5.5,2.47-5.5,5.5s2.47,5.5,5.5,5.5s5.5-2.47,5.5-5.5S15.03,5.5,12,5.5z"/>
    </svg>
    
  </label>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Definieren Sie hier die Namen Ihrer Themes (aus tailwind.config.js)
const lightTheme = 'cupcake'; // oder "light"
const darkTheme = 'dracula';  // oder "dark"

// isDark ist der reaktive Zustand, der an die Checkbox gebunden ist
const isDark = ref(false);

// Diese Funktion wird durch @change am <input> aufgerufen
const toggleTheme = () => {
  // isDark.value wurde durch v-model bereits automatisch aktualisiert
  const theme = isDark.value ? darkTheme : lightTheme;
  
  // 1. Das data-theme-Attribut im <html>-Tag setzen
  document.documentElement.setAttribute('data-theme', theme);
  
  // 2. Die Auswahl im localStorage für zukünftige Besuche speichern
  localStorage.setItem('theme', theme);
};

// onMounted wird ausgeführt, sobald die Komponente geladen wird
onMounted(() => {
  // 1. Gespeichertes Theme aus localStorage abrufen
  const savedTheme = localStorage.getItem('theme');
  
  let currentTheme;

  if (savedTheme) {
    // 2. Wenn ein Theme gespeichert ist, verwenden wir das
    currentTheme = savedTheme;
  } else {
    // 3. Wenn nichts gespeichert ist, prüfen wir die OS-Einstellung (Fallback)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    currentTheme = prefersDark ? darkTheme : lightTheme;
  }

  // 4. Den Zustand des Toggles (isDark) entsprechend setzen
  isDark.value = (currentTheme === darkTheme);
  
  // 5. Das Theme beim Laden der Seite initial anwenden
  document.documentElement.setAttribute('data-theme', currentTheme);
});
</script>

<style scoped>
/* Stellt sicher, dass der Klickbereich angenehm ist */
.swap {
  margin: 0 1rem; /* Ein wenig Abstand */
}
</style>
<template>
  <div>
    <button @click="fetchData" :disabled="loading" class="btn btn-primary">
      API-Daten (Axios) abrufen
    </button>

    <div class="mt-4 p-4 rounded-lg bg-base-200 min-h-24">
      
      <p v-if="loading" class="flex items-center">
        <span class="loading loading-spinner loading-xs mr-2"></span>
        Lade...
      </p>

      <p v-if="error" class="text-error font-bold">
        Fehler: {{ error }}
      </p>
      
      <p v-if="apiMessage" class="text-lg font-bold text-success">
        {{ apiMessage }}
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios'; // ⭐️ Axios importieren

// 3. Reaktive Variablen bleiben gleich
const apiMessage = ref('');
const loading = ref(false);
const error = ref(null);

// 4. Die Funktion, die beim Klick ausgeführt wird
async function fetchData() {
  loading.value = true;
  error.value = null;
  apiMessage.value = '';

  try {
    // ⭐️ 5. Die GET-Anfrage mit axios.get()
    // Axios parst die JSON-Antwort automatisch.
    const response = await axios.get('/api/test/hello');

    // ⭐️ 6. Datenextraktion
    // Axios packt die Antwort in ein 'data'-Objekt.
    // (response.data entspricht dem { "message": "Hallo Welt..." } Objekt)
    apiMessage.value = response.data.message;

  } catch (e) {
    // ⭐️ 7. Fehlerbehandlung
    // Axios wirft automatisch einen Fehler bei HTTP-Statuscodes wie 404 oder 500.
    console.error('Fehler beim Abrufen der Daten:', e);
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
</style>
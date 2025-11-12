<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router' // Um nach dem Login weiterzuleiten

// Reakive Variable für das Formularfeld
const vorname = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const router = useRouter() // Holt sich die Router-Instanz

async function handleDemoLogin() {
  // Verhindern, dass der Button mehrfach geklickt wird
  if (isLoading.value) return 
  
  isLoading.value = true
  errorMessage.value = ''

  try {
    // Sende den Vornamen an dein Flask User Service Backend
    const response = await axios.post('/api/user-service/register', { 
      vorname: vorname.value 
    })

    // Empfange die UserID vom Backend
    const userId = response.data.userId

    // Speichere die ID im localStorage für andere Micro-Frontends
    localStorage.setItem('userId', userId)

    window.dispatchEvent(new Event('storage-changed'));

    // (Optional) Kurze Erfolgsmeldung
    // alert(`Demo-Login erfolgreich! Willkommen, ${vorname.value}.`)

    // Leite den Nutzer zum Shop oder Hub weiter
    router.push('/') // Passe '/shop' an deine Ziel-Route an

  } catch (error) {
    console.error('Login-Fehler:', error)
    errorMessage.value = 'Login fehlgeschlagen. Läuft das Backend?'
  } finally {
    isLoading.value = false // Ladezustand beenden
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200">
    
    <div class="card w-full max-w-sm bg-base-100 shadow-xl">
      
      <div class="card-body">
        <h2 class="card-title text-2xl justify-center">
          Demo-Login
        </h2>
        <p class="text-center text-sm text-base-content/70">
          Gib einen Vornamen ein, um einen Demo-Nutzer zu erstellen.
        </p>

        <form @submit.prevent="handleDemoLogin" class="mt-4">
          
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Vorname</span>
            </label>
            
            <input 
              v-model="vorname"
              type="text" 
              placeholder="z.B. Alex" 
              class="input input-bordered w-full"
              required
            />
          </div>

          <div vD-if="errorMessage" class="text-error text-sm mt-2">
            {{ errorMessage }}
          </div>

          <div class="form-control mt-6">
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="loading loading-spinner"></span>
              <span v-else>Einloggen & Starten</span>
            </button>
          </div>
          
        </form>
      </div>
    </div>
  </div>
</template>
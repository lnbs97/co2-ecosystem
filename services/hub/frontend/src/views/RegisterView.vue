<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router' 

// Reakive Variable für das Formularfeld
const vorname = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const router = useRouter() 

async function handleDemoLogin() {
  if (isLoading.value) return 
  
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await axios.post('/api/user-service/register', { 
      vorname: vorname.value 
    })

    const userId = response.data.userId
    localStorage.setItem('userId', userId)

    window.dispatchEvent(new Event('storage-changed'));

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('toggle-onboarding-modal', { detail: { forceOpen: true } }));
    }, 500);

    router.push('/') 

  } catch (error) {
    console.error('Login-Fehler:', error)
    errorMessage.value = 'Login fehlgeschlagen. Läuft das Backend?'
  } finally {
    isLoading.value = false 
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-950 px-4 pt-16 font-sans">
    
    <div class="w-full max-w-sm bg-slate-900 border border-slate-800 shadow-2xl relative p-8">
      
      <div class="absolute top-0 left-0 w-full h-1 bg-emerald-600"></div>
      
      <div class="mb-6 text-center">
        <h2 class="text-2xl font-bold text-white uppercase tracking-widest mb-2">
          DEMO ACCESS
        </h2>
        <p class="text-xs text-slate-400 font-mono uppercase">
          IDENTIFICATION REQUIRED FOR CO2 SUBSYSTEM.
        </p>
      </div>

      <form @submit.prevent="handleDemoLogin" class="space-y-6">
        
        <div class="form-control w-full">
          <label class="block mb-2">
            <span class="text-xs font-mono text-emerald-500 uppercase tracking-widest">NAME</span>
          </label>
          
          <input 
            v-model="vorname"
            type="text" 
            placeholder="INPUT..." 
            class="w-full bg-slate-950 border border-slate-700 text-white p-3 font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder-slate-700"
            required
          />
        </div>

        <div v-if="errorMessage" class="bg-red-900/10 border border-red-900/50 p-3 text-red-500 text-xs font-mono">
          [ERROR]: {{ errorMessage }}
        </div>

        <div class="mt-6">
          <button 
            type="submit" 
            class="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold uppercase tracking-widest py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            :disabled="isLoading"
          >
            <svg v-if="isLoading" class="animate-spin h-4 w-4 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            
            <span v-else>INITIALIZE SYSTEM</span>
          </button>
        </div>
        
      </form>
      
      <div class="mt-6 text-center border-t border-slate-800 pt-4">
        <p class="text-[10px] text-slate-600 font-mono uppercase">
          EU Carbon Control Authority
        </p>
      </div>

    </div>
  </div>
</template>
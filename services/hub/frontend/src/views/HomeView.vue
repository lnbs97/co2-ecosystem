<template>
  <hero class="min-h-screen bg-base-200 flex flex-col justify-center items-center">
    <div class="hero-content text-center flex-col">
      
      <div class="max-w-md mb-10">
        <h1 class="text-5xl font-bold">Welcome to CO2 Ecosystem Hub</h1>
        <p class="py-6">Your gateway to managing and monitoring CO2 emissions effectively.</p>
        
        <div v-if="!isLoggedIn">
           <router-link to="/register" class="btn btn-primary">Getting started!</router-link>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        
        <div @click="handleServiceClick('/wallet')" 
             class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer border border-base-300 group">
          <div class="card-body items-center text-center">
            
            <div class="p-4 bg-primary/10 rounded-full mb-2 group-hover:bg-primary/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>

            <h2 class="card-title flex gap-2">
              My Wallet
              <svg v-if="!isLoggedIn" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/40" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
            </h2>
            <p class="text-sm text-base-content/70">Manage your CO2 tokens and assets.</p>
            
            <div class="card-actions mt-4">
              <span class="btn btn-sm btn-primary">
                {{ isLoggedIn ? 'Open Wallet' : 'Login to Access' }}
              </span>
            </div>
          </div>
        </div>

        <div @click="handleServiceClick('/shop')" 
             class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer border border-base-300 group">
          <div class="card-body items-center text-center">
            <div class="p-4 bg-secondary/10 rounded-full mb-2 group-hover:bg-secondary/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 class="card-title flex gap-2">
              Carbon Fashion
              <svg v-if="!isLoggedIn" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/40" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
            </h2>
            <p class="text-sm text-base-content/70">Shop sustainable fashion.</p>
            <div class="card-actions mt-4">
              <span class="btn btn-sm btn-secondary">
                 {{ isLoggedIn ? 'Go to Shop' : 'Login to Access' }}
              </span>
            </div>
          </div>
        </div>

        <div @click="handleServiceClick('/exchange')" 
             class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer border border-base-300 group">
          <div class="card-body items-center text-center">
            <div class="p-4 bg-accent/10 rounded-full mb-2 group-hover:bg-accent/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h2 class="card-title flex gap-2">
                Exchange
                <svg v-if="!isLoggedIn" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/40" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
            </h2>
            <p class="text-sm text-base-content/70">Trade carbon credits instantly.</p>
            <div class="card-actions mt-4">
              <button class="btn btn-sm btn-accent">
                {{ isLoggedIn ? 'Start Trading' : 'Login to Access' }}
              </button>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-sm border border-base-300 opacity-70 relative overflow-hidden">
          <div class="absolute top-3 right-3 badge badge-ghost">Coming Soon</div>
          <div class="card-body items-center text-center">
            <div class="p-4 bg-neutral/10 rounded-full mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-neutral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 class="card-title">Green Jobs</h2>
            <p class="text-sm text-base-content/70">Find sustainable career paths.</p>
            <div class="card-actions mt-4">
              <button class="btn btn-sm btn-disabled">Not Available</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </hero>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const isLoggedIn = ref(false);

// --- NAVIGATION LOGIC ---
function handleServiceClick(externalUrl) {
  if (isLoggedIn.value) {
    // 1. If logged in, go to the other Micro-Frontend
    window.location.href = externalUrl; 
  } else {
    // 2. If not logged in, go to Register
    router.push('/register'); 
  }
}

// --- AUTH LOGIC ---
async function checkLoginStatus() {
  const userId = localStorage.getItem('userId');
  
  if (!userId) {
    isLoggedIn.value = false;
    return;
  }

  try {
    await axios.get('/api/user-service/me', {
      headers: { 'Authorization': `Bearer ${userId}` }
    });
    isLoggedIn.value = true;
  } catch (error) {
    console.error("Session invalid:", error);
    localStorage.removeItem('userId');
    isLoggedIn.value = false;
  }
}

onMounted(() => {
  checkLoginStatus();
});
</script>
<template>
  <div class="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-red-500 selection:text-white">

    <div class="relative h-screen w-full overflow-hidden flex flex-col justify-center items-center">
      
      <div class="absolute inset-0 z-0">
        <video autoplay muted loop playsinline class="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
           <source src="https://assets.mixkit.co/videos/preview/mixkit-factory-smoke-emission-coming-from-chimneys-43340-large.mp4" type="video/mp4">
        </video>
        <div class="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950"></div>
      </div>

      <div class="relative z-10 text-center max-w-4xl px-4 mt-[-50px]">
        <div class="inline-block border border-red-500/50 bg-red-500/10 text-red-500 px-3 py-1 text-xs font-mono mb-4 tracking-widest uppercase animate-pulse">
          Emergency Decree §2030-B Active
        </div>
        <h1 class="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-white">
          EU CARBON CONTROL
        </h1>
        <p class="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light">
          The national emission budget is exhausted. <br>
          Your participation in CO2 trading is <strong>mandatory</strong>.
        </p>
      </div>

      <div class="absolute bottom-10 animate-bounce">
        <span class="text-xs font-mono text-slate-500 uppercase">Access Terminal</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto text-slate-500 mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>


    <div class="min-h-screen grid grid-cols-1 lg:grid-cols-12 border-t border-slate-800">
      
      <div class="lg:col-span-4 bg-slate-900 border-r border-slate-800 p-8 flex flex-col gap-8 relative overflow-hidden">
        
        <div>
           <h3 class="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Global Status</h3>
           <div class="text-4xl font-mono font-bold text-red-500">+2.4°C</div>
           <p class="text-xs text-slate-400 mt-1">Above pre-industrial levels</p>
        </div>

        <div class="border-l-2 border-slate-700 pl-4 py-2">
          <h4 class="text-sm font-bold text-slate-100 mb-2">Official Announcements</h4>
          <ul class="text-sm text-slate-400 space-y-3 font-mono">
            <li class="flex gap-2">
              <span class="text-red-500">[ALERT]</span>
              <span>Drought Zone South: Water rationing increased to Level 4.</span>
            </li>
            <li class="flex gap-2">
              <span class="text-yellow-500">[INFO]</span>
              <span>CO2 Token Rate: Stable at 1g = 1 Token.</span>
            </li>
            <li class="flex gap-2">
              <span class="text-slate-500">[SYS]</span>
              <span>Trading system synchronizing...</span>
            </li>
          </ul>
        </div>

        <div class="mt-auto">
          <div class="text-xs font-mono text-slate-500 mb-2">Emission Target vs. Reality</div>
          <div class="h-32 flex items-end gap-1 border-b border-slate-700 pb-1">
             <div class="w-1/5 bg-slate-700 h-[40%]"></div>
             <div class="w-1/5 bg-slate-700 h-[50%]"></div>
             <div class="w-1/5 bg-slate-600 h-[60%]"></div>
             <div class="w-1/5 bg-slate-500 h-[80%]"></div>
             <div class="w-1/5 bg-red-600 h-[100%] animate-pulse relative group">
                <span class="absolute -top-6 left-0 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">NOW</span>
             </div>
          </div>
        </div>
      </div>


      <div class="lg:col-span-8 bg-slate-950 p-8 flex flex-col justify-center">
        
        <div class="max-w-3xl mx-auto w-full">
          
          <div class="mb-10 border-b border-slate-800 pb-6">
            <div v-if="isLoggedIn && userName">
               <span class="text-xs font-mono text-emerald-500">● IDENTIFIED</span>
               <h2 class="text-3xl font-bold text-white mt-1">Welcome, Citizen <span class="text-emerald-400">{{ userName }}</span></h2>
               <p class="text-slate-400 mt-2">Your personal dashboard is ready.</p>
            </div>
            <div v-else>
               <span class="text-xs font-mono text-slate-500">● UNIDENTIFIED</span>
               <h2 class="text-3xl font-bold text-white mt-1">Authentication Required</h2>
               <p class="text-slate-400 mt-2">Identify yourself to retrieve your budget.</p>
               
               <router-link to="/register" class="mt-4 inline-flex items-center px-6 py-2 border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-slate-900 transition-colors font-mono uppercase text-sm font-bold">
                 Proceed to Registration
               </router-link>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div @click="handleServiceClick('/wallet')" 
                 class="group relative border border-slate-800 bg-slate-900/50 p-6 cursor-pointer hover:border-emerald-500/50 transition-all hover:bg-slate-900">
               <div class="absolute top-0 right-0 p-2 opacity-50">
                  <span class="text-[10px] font-mono border border-slate-700 px-1 text-slate-500">SYS-01</span>
               </div>
               <div class="h-10 w-10 text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
               </div>
               <h3 class="text-xl font-bold text-slate-200 group-hover:text-emerald-400">CO2 Wallet</h3>
               <p class="text-sm text-slate-500 mt-2">Manage tokens & check balance.</p>
               <div class="mt-4 flex items-center text-xs font-mono text-slate-600 group-hover:text-emerald-500">
                  {{ isLoggedIn ? '> ACCESS GRANTED' : '> ACCESS DENIED (LOGIN)' }}
               </div>
            </div>

            <div @click="handleServiceClick('/exchange')" 
                 class="group relative border border-slate-800 bg-slate-900/50 p-6 cursor-pointer hover:border-blue-500/50 transition-all hover:bg-slate-900">
               <div class="absolute top-0 right-0 p-2 opacity-50">
                  <span class="text-[10px] font-mono border border-slate-700 px-1 text-slate-500">SYS-02</span>
               </div>
               <div class="h-10 w-10 text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
               </div>
               <h3 class="text-xl font-bold text-slate-200 group-hover:text-blue-400">Exchange</h3>
               <p class="text-sm text-slate-500 mt-2">Buy certificates or sell surplus.</p>
               <div class="mt-4 flex items-center text-xs font-mono text-slate-600 group-hover:text-blue-500">
                  {{ isLoggedIn ? '> OPEN MARKET' : '> LOGIN REQUIRED' }}
               </div>
            </div>

            <div @click="handleServiceClick('/shop')" 
                 class="group relative border border-slate-800 bg-slate-900/50 p-6 cursor-pointer hover:border-purple-500/50 transition-all hover:bg-slate-900">
               <div class="absolute top-0 right-0 p-2 opacity-50">
                  <span class="text-[10px] font-mono border border-slate-700 px-1 text-slate-500">SYS-03</span>
               </div>
               <div class="h-10 w-10 text-purple-500 mb-4 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
               </div>
               <h3 class="text-xl font-bold text-slate-200 group-hover:text-purple-400">Cart Sim.</h3>
               <p class="text-sm text-slate-500 mt-2">Check consumer goods for CO2 impact.</p>
               <div class="mt-4 flex items-center text-xs font-mono text-slate-600 group-hover:text-purple-500">
                  {{ isLoggedIn ? '> START SHOP' : '> LOGIN REQUIRED' }}
               </div>
            </div>

            <div class="relative border border-slate-800 bg-slate-950 p-6 opacity-50 grayscale">
               <div class="absolute top-2 right-2">
                  <span class="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-1">OFFLINE</span>
               </div>
               <div class="h-10 w-10 text-slate-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
               </div>
               <h3 class="text-xl font-bold text-slate-500">Green Jobs</h3>
               <p class="text-sm text-slate-600 mt-2">Sector not yet authorized.</p>
            </div>

          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const isLoggedIn = ref(false);
const userName = ref('');

// --- NAVIGATION LOGIC (WIEDERHERGESTELLT) ---
function handleServiceClick(externalUrl) {
  if (isLoggedIn.value) {
    // WICHTIG FÜR DOCKER/MICROSERVICES:
    // Wir erzwingen einen echten Page-Reload, damit der Reverse Proxy (Nginx/Traefik)
    // die Anfrage an den richtigen Container (z.B. Shop oder Wallet) weiterleiten kann.
    window.location.href = externalUrl; 
  } else {
    // Registrierung ist Teil dieser Landingpage-App, daher Vue Router okay:
    router.push('/register'); 
  }
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
    console.error("Session invalid:", error);
    localStorage.removeItem('userId');
    isLoggedIn.value = false;
    userName.value = '';
  }
}

onMounted(() => {
  fetchUserData();
});
</script>
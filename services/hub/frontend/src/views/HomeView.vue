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


    <div class="grid grid-cols-1 lg:grid-cols-2 min-h-screen border-t border-slate-800">

        <div class="bg-slate-950 border-r border-slate-800 p-8 lg:p-12 flex flex-col justify-center">

          <div class="max-w-xl mx-auto">
            <div class="border-b border-slate-800 pb-6 mb-8">
              <div class="flex items-center gap-3 mb-3">
                <span class="px-2 py-1 bg-red-900/30 text-red-500 text-xs font-mono uppercase border border-red-900 rounded">EU-Decree 2031</span>
                <span class="text-slate-500 text-xs font-mono uppercase">Status: Enforced</span>
              </div>
              <h2 class="text-3xl font-bold text-slate-100 mb-3">The End of Voluntarism: The "Personal Carbon Allowance"</h2>
              <p class="text-lg text-slate-400 font-light leading-relaxed">
                Why the free market failed and why your consumption is now rationed.
              </p>
            </div>

            <div class="space-y-8 text-slate-300 leading-relaxed">

              <div>
                <h3 class="text-white font-mono uppercase text-sm mb-3 flex items-center gap-2">
                  <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                  The Failure of 2030
                </h3>
                <p class="text-sm">
                  We warned. We appealed. We failed. The goal to reduce emissions by 55% by 2030 was missed. The consequences are visible outside our windows. The time for debate has expired.
                </p>
                <p class="mt-2 text-sm border-l-2 border-red-500 pl-3 italic text-slate-400">
                  "Nature does not negotiate. The atmosphere's emission budget is physically exhausted."
                </p>
              </div>

              <div>
                <h3 class="text-white font-mono uppercase text-sm mb-3 flex items-center gap-2">
                  <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Your Responsibility
                </h3>
                <p class="text-sm mb-4">
                  Effective immediately, responsibility is privatized. The State guarantees survival, but no longer luxury. With the <strong>Personal Carbon Allowance Act (PCAA)</strong>, your ecological footprint becomes hard currency.
                </p>
                <ul class="text-sm space-y-2 font-mono text-slate-400 bg-slate-900 p-4 rounded border border-slate-800">
                  <li class="flex justify-between">
                    <span>Exchange Rate:</span>
                    <span class="text-white">1 Token = 1 kg CO2</span>
                  </li>
                  <li class="flex justify-between">
                    <span>Transaction Lock:</span>
                    <span class="text-red-400 animate-pulse">ACTIVE</span>
                  </li>
                  <li class="text-xs pt-2 border-t border-slate-800 mt-2 opacity-75">
                    No tokens, no transaction. Fiat currency is secondary.
                  </li>
                </ul>
              </div>

              <div class="bg-slate-900 p-5 rounded border border-slate-800">
                <h3 class="text-white font-mono uppercase text-sm mb-3">The Great Shrink (2030-2050)</h3>
                <p class="text-xs mb-4 text-slate-400">
                  To force "Net Zero" by 2050, the state allocation of tokens is <strong>cut by 7.5% annually</strong>.
                </p>

                <div class="flex items-end gap-1 h-12 border-b border-slate-700 pb-1 font-mono text-[10px] text-center">
                  <div class="w-1/6 bg-emerald-600/50 h-full flex items-end justify-center pb-1 text-emerald-200">2031</div>
                  <div class="w-1/6 bg-emerald-700/50 h-[80%] flex items-end justify-center pb-1 text-slate-400">2035</div>
                  <div class="w-1/6 bg-yellow-700/50 h-[60%] flex items-end justify-center pb-1 text-slate-400">2040</div>
                  <div class="w-1/6 bg-orange-700/50 h-[40%] flex items-end justify-center pb-1 text-slate-400">2045</div>
                  <div class="w-1/6 bg-red-900/50 h-[20%] flex items-end justify-center pb-1 text-red-500">2050</div>
                  <div class="w-1/6 flex items-end justify-center pb-1 text-slate-600 italic">Zero</div>
                </div>
              </div>
            </div>

            <div class="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500 font-mono flex items-center justify-between">
              <span>SYS-ID: EU-CLIMATE-CORE</span>
              <span class="text-red-500 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                Strictly enforced.
              </span>
            </div>
          </div>
        </div>


        <div class="bg-slate-950 p-8 lg:p-12 flex flex-col justify-center relative">

            <div class="max-w-xl mx-auto w-full">

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

                   <router-link to="/register" class="mt-6 inline-flex items-center px-6 py-3 border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-slate-900 transition-colors font-mono uppercase text-sm font-bold tracking-wider">
                     Proceed to Registration
                   </router-link>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

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
                  <h3 class="text-xl font-bold text-slate-200 group-hover:text-purple-400">EcoFashion</h3>
               <p class="text-sm text-slate-500 mt-2">Check consumer goods for CO2 impact.</p>
                  <div class="mt-4 flex items-center text-xs font-mono text-slate-600 group-hover:text-purple-500">
                     {{ isLoggedIn ? '> START SHOP' : '> LOGIN REQUIRED' }}
                  </div>
                </div>

                <div @click="handleServiceClick('/flights')"
                     class="group relative border border-slate-800 bg-slate-900/50 p-6 cursor-pointer hover:border-orange-500/50 transition-all hover:bg-slate-900">
                  <div class="absolute top-0 right-0 p-2 opacity-50">
                     <span class="text-[10px] font-mono border border-slate-700 px-1 text-slate-500">SYS-04</span>
                  </div>
                  <div class="h-10 w-10 text-orange-500 mb-4 group-hover:scale-110 transition-transform">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                     </svg>
                  </div>
               <h3 class="text-xl font-bold text-slate-200 group-hover:text-orange-400">Flight Service</h3>
                  <p class="text-sm text-slate-500 mt-2">Book flights. High emission warnings.</p>
                  <div class="mt-4 flex items-center text-xs font-mono text-slate-600 group-hover:text-orange-500">
                     {{ isLoggedIn ? '> ACCESS TERMINAL' : '> LOGIN REQUIRED' }}
                  </div>
                </div>

                <div @click="handleServiceClick('/trains')"
                     class="group relative border border-slate-800 bg-slate-900/50 p-6 cursor-pointer hover:border-emerald-500/50 transition-all hover:bg-slate-900">
                  <div class="absolute top-0 right-0 p-2 opacity-50">
                     <span class="text-[10px] font-mono border border-slate-700 px-1 text-slate-500">SYS-05</span>
                  </div>
                  <div class="h-10 w-10 text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <rect x="4" y="3" width="16" height="14" rx="2" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 11h16" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v8" />
                      <circle cx="8" cy="14" r="1" />
                      <circle cx="16" cy="14" r="1" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 21l2-4" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M18 21l-2-4" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-slate-200 group-hover:text-emerald-400">Train Tickets</h3>
                  <p class="text-sm text-slate-500 mt-2">Green travel options. Low emissions.</p>
                  <div class="mt-4 flex items-center text-xs font-mono text-slate-600 group-hover:text-emerald-500">
                     {{ isLoggedIn ? '> BOOK TRAIN' : '> LOGIN REQUIRED' }}
                  </div>
                </div>

                <div @click="handleServiceClick('/dashboard')"
                     class="group relative border border-slate-800 bg-slate-900/50 p-6 cursor-pointer hover:border-red-500/50 transition-all hover:bg-slate-900">
                  <div class="absolute top-0 right-0 p-2 opacity-50">
                     <span class="text-[10px] font-mono border border-slate-700 px-1 text-slate-500">SYS-MONITOR</span>
                  </div>
                  <div class="h-10 w-10 text-red-500 mb-4 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-slate-200 group-hover:text-red-400">Event Stream</h3>
                  <p class="text-sm text-slate-500 mt-2">Realtime monitoring of the economy.</p>
                  <div class="mt-4 flex items-center text-xs font-mono text-slate-600 group-hover:text-red-500">
                     {{ isLoggedIn ? '> VIEW MONITOR' : '> LOGIN REQUIRED' }}
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

function handleServiceClick(externalUrl) {
  if (isLoggedIn.value) {
    window.location.href = externalUrl;
  } else {
    router.push('/register');
  }
}

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

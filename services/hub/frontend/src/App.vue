<template>
  <div class="min-h-screen bg-slate-950 font-sans text-slate-200">
    
    <AppHeader class="fixed top-0 left-0 w-full z-50" /> 
    
    <main class="w-full">
      <router-view />
    </main>

    <OnboardingModal />
    
  </div>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue';
// ⭐️ Importiere das neue Modal
import OnboardingModal from './components/OnboardingModal.vue';
</script>

<style>
/* Globaler Reset, falls nötig */
html, body {
  margin: 0;
  padding: 0;
  background-color: #020617; /* slate-950 safety fallback */
}
</style>
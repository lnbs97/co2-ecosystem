<template>
  <div class="min-h-screen bg-slate-950 font-sans text-slate-200">
    
    <AppHeader class="fixed top-0 left-0 w-full z-50" /> 
    
    <main class="w-full">
      <router-view />
    </main>
    
  </div>
</template>

<!-- 🚀 WICHTIG: Verwenden Sie <script setup> -->
<script setup>
// Imports werden automatisch im Template verfügbar gemacht
import AppHeader from './components/AppHeader.vue';
</script>

<style>
/* Globaler Reset, falls nötig */
html, body {
  margin: 0;
  padding: 0;
  background-color: #020617; /* slate-950 safety fallback */
}
</style>
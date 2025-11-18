<template>
  <div class="min-h-screen bg-base-200">
    <!-- Komponente kann direkt verwendet werden, da sie im Setup-Block importiert wurde -->
    <AppHeader /> 
    
    <main class="container mx-auto p-4">
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
/* ... */
</style>
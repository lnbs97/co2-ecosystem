// src/router/index.js (Auszug)
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterView from '../views/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView // Die Startseite des Hubs
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView 
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true } // <--- Wichtig für geschützte Routen
    }
    // ... weitere Routen zu Services
  ]
})

export default router;
// ... (Navigation Guard folgt in Punkt 3)
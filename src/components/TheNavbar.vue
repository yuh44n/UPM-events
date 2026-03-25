<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { LogOut } from 'lucide-vue-next'
import NotificationPanel from './NotificationPanel.vue'

const router = useRouter()
const route = useRoute()
const { user, userData, logout } = useAuth()

const handleLogout = async () => {
  await logout()
  router.push('/login')
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar__inner">
      <div class="navbar__left">
        <router-link to="/" class="navbar__logo">
          UPM <span>Events</span>
        </router-link>

        <ul v-if="user" class="navbar__nav">
          <li>
            <router-link to="/" class="nav-link">Dashboard</router-link>
          </li>
          <li>
            <router-link to="/polls" class="nav-link">Boîte à Idées</router-link>
          </li>
          <li v-if="userData?.role === 'club'">
            <router-link to="/admin" class="nav-link">Admin</router-link>
          </li>
        </ul>
      </div>

      <!-- Profile Actions -->
      <div v-if="user" class="navbar__profile">
        <NotificationPanel />
        <div class="navbar__avatar" :title="userData?.displayName">
          {{ userData?.displayName?.charAt(0).toUpperCase() || 'U' }}
        </div>
        <button @click="handleLogout" class="btn-icon" title="Déconnexion">
          <LogOut class="w-4 h-4" />
        </button>
      </div>

      <div v-else class="flex items-center gap-4">
        <router-link 
          to="/login" 
          :class="['nav-link', { 'btn btn-primary btn-sm': route.path === '/register' }]"
        >
          Login
        </router-link>
        <router-link 
          to="/register" 
          :class="['nav-link', { 'btn btn-primary btn-sm': route.path === '/login' || route.path === '/' }]"
        >
          S'inscrire
        </router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Scoped styles can be empty since we use global classes from style.css */
</style>

import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase/config'
import { onAuthStateChanged } from 'firebase/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue')
  },
  {
    path: '/polls',
    name: 'Polls',
    component: () => import('../views/PollsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/event/:id',
    name: 'EventDetail',
    component: () => import('../views/EventDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminClub',
    component: () => import('../views/AdminClubView.vue'),
    meta: { requiresAuth: true, requiresClub: true }
  },
  {
    path: '/create-event',
    name: 'CreateEvent',
    component: () => import('../views/CreateEventView.vue'),
    meta: { requiresAuth: true, requiresClub: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  },
})

// Navigation Guard
router.beforeEach(async (to) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe()
        resolve(user)
      }, reject)
    })
  }

  const user = await getCurrentUser()

  if (requiresAuth && !user) {
    return '/login'
  }
})

export default router

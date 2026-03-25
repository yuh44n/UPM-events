import { createApp }    from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

// ── Views ──────────────────────────────────────────────────────
import LoginView       from './views/LoginView.vue'
import RegisterView    from './views/RegisterView.vue'
import HomeView        from './views/HomeView.vue'
import PollsView       from './views/PollsView.vue'
import EventDetailView from './views/EventDetailView.vue'
import AdminClubView   from './views/AdminClubView.vue'
import CreateEventView from './views/CreateEventView.vue'

// ── Auth composable (for nav guard) ───────────────────────────
import { getCurrentUser } from './composables/useAuth'

// ── Routes ─────────────────────────────────────────────────────
const routes = [
  // Public
  { path: '/login',    name: 'Login',    component: LoginView,    meta: { public: true } },
  { path: '/register', name: 'Register', component: RegisterView, meta: { public: true } },

  // Student
  { path: '/',           name: 'Home',        component: HomeView        },
  { path: '/polls',      name: 'Polls',       component: PollsView       },
  { path: '/events/:id', name: 'EventDetail', component: EventDetailView },

  // Club / Admin
  { path: '/admin',          name: 'Admin',       component: AdminClubView,   meta: { requiresClub: true } },
  { path: '/admin/create',   name: 'CreateEvent', component: CreateEventView, meta: { requiresClub: true } },
  { path: '/admin/edit/:id', name: 'EditEvent',   component: CreateEventView, meta: { requiresClub: true } },

  // Catch-all
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

// ── Router ─────────────────────────────────────────────────────
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, saved) {
    if (saved)    return saved
    if (to.hash)  return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  },
})

// ── Navigation guard ───────────────────────────────────────────
router.beforeEach(async (to) => {
  const user = await getCurrentUser()

  // Not logged in → go to login
  if (!to.meta.public && !user) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  // Already logged in → skip auth pages
  if (to.meta.public && user) {
    return { name: 'Home' }
  }
})

// ── App ────────────────────────────────────────────────────────
const app = createApp(App)
app.use(router)
app.mount('#app')

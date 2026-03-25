<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { db } from '../firebase/config'
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, limit } from 'firebase/firestore'
import { useAuth } from '../composables/useAuth'
import { Bell, Calendar, AtSign, X, Check } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const { user } = useAuth()
const router = useRouter()
const notifications = ref([])
const isOpen = ref(false)
const isPending = ref(true)

let unsubscribe = null

const startNotifQuery = () => {
  if (!user.value) return
  if (unsubscribe) unsubscribe()

  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', user.value.uid),
    orderBy('createdAt', 'desc'),
    limit(20)
  )

  unsubscribe = onSnapshot(q, (snapshot) => {
    notifications.value = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }))
    isPending.value = false
  }, (err) => {
    console.error("Notif fetch error:", err);
    isPending.value = false
  })
}

onMounted(() => {
  if (user.value) {
    startNotifQuery()
  }
})

// Handle page refresh/auth state change
watch(user, (newUser) => {
  if (newUser) {
    startNotifQuery()
  } else {
    notifications.value = []
    if (unsubscribe) unsubscribe()
  }
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

const togglePanel = () => {
  isOpen.value = !isOpen.value
}

const markAsRead = async (notifId) => {
  try {
    await updateDoc(doc(db, 'notifications', notifId), {
      read: true
    })
  } catch (err) {
    console.error('Error marking notification as read:', err)
  }
}

const deleteNotif = async (notifId) => {
  try {
    await deleteDoc(doc(db, 'notifications', notifId))
  } catch (err) {
    console.error('Error deleting notification:', err)
  }
}

const handleNotifClick = async (notif) => {
  await markAsRead(notif.id)
  isOpen.value = false
  if (notif.link) {
    router.push(notif.link)
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="notif-wrapper">
    <button @click="togglePanel" class="notif-trigger" :class="{ 'has-unread': unreadCount > 0 }">
      <Bell class="w-5 h-5" />
      <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
    </button>

    <div v-if="isOpen" class="notif-panel">
      <div class="notif-header">
        <h4 class="overline">Notifications</h4>
        <button @click="isOpen = false" class="btn-close-sm"><X class="w-4 h-4" /></button>
      </div>

      <div class="notif-body">
        <div v-if="isPending" class="p-8 text-center">
          <div class="spinner spinner--sm mx-auto"></div>
        </div>

        <div v-else-if="notifications.length === 0" class="notif-empty">
          <Bell class="w-8 h-8 opacity-20 mb-2" />
          <p>Aucune notification</p>
        </div>

        <div v-else class="notif-list">
          <div 
            v-for="notif in notifications" 
            :key="notif.id" 
            class="notif-item"
            :class="{ 'unread': !notif.read }"
            @click="handleNotifClick(notif)"
          >
            <div class="notif-icon-box" :class="notif.type">
              <Calendar v-if="notif.type === 'reminder'" class="w-4 h-4" />
              <AtSign v-else-if="notif.type === 'mention'" class="w-4 h-4" />
              <Bell v-else class="w-4 h-4" />
            </div>
            
            <div class="notif-content">
              <p class="notif-text">{{ notif.message }}</p>
              <span class="notif-time">{{ formatDate(notif.createdAt) }}</span>
            </div>

            <div class="notif-actions" @click.stop>
              <button v-if="!notif.read" @click="markAsRead(notif.id)" class="action-btn-notif" title="Marquer comme lu">
                <Check class="w-3 h-3" />
              </button>
              <button @click="deleteNotif(notif.id)" class="action-btn-notif danger" title="Supprimer">
                <X class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notif-wrapper {
  position: relative;
}

.notif-trigger {
  position: relative;
  background: var(--surface-2);
  border: 1px solid var(--bdr-soft);
  color: var(--text-muted);
  width: 38px;
  height: 38px;
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--t-fast);
}

.notif-trigger:hover {
  background: var(--surface-3);
  color: var(--gold-200);
  border-color: var(--bdr-mid);
}

.notif-trigger.has-unread {
  color: var(--gold-100);
  border-color: var(--gold-glow-2);
}

.notif-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--gold-300);
  color: var(--void);
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--void);
}

.notif-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 320px;
  background: var(--surface-1);
  border: 1px solid var(--bdr-mid);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg), 0 10px 40px rgba(0,0,0,0.5);
  z-index: 500;
  overflow: hidden;
  animation: slide-in 0.25s var(--ease) both;
}

@keyframes slide-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.notif-header {
  padding: 14px 20px;
  background: var(--surface-2);
  border-bottom: 1px solid var(--bdr-faint);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notif-body {
  max-height: 400px;
  overflow-y: auto;
}

.notif-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.notif-list {
  display: flex;
  flex-direction: column;
}

.notif-item {
  padding: 16px 20px;
  display: flex;
  gap: 12px;
  border-bottom: 1px solid var(--bdr-faint);
  cursor: pointer;
  transition: background var(--t-fast);
  position: relative;
}

.notif-item:hover {
  background: var(--surface-2);
}

.notif-item.unread {
  background: var(--gold-glow);
}

.notif-icon-box {
  width: 32px;
  height: 32px;
  border-radius: var(--r-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-icon-box.reminder { background: rgba(74, 143, 212, 0.15); color: #4a8fd4; }
.notif-icon-box.mention { background: var(--gold-glow); color: var(--gold-200); }

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-text {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 4px;
}

.unread .notif-text {
  color: var(--text-primary);
  font-weight: 500;
}

.notif-time {
  font-size: 0.65rem;
  color: var(--text-muted);
}

.notif-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  transition: opacity var(--t-fast);
}

.notif-item:hover .notif-actions {
  opacity: 1;
}

.action-btn-notif {
  width: 22px;
  height: 22px;
  border-radius: var(--r-xs);
  background: var(--surface-3);
  border: 1px solid var(--bdr-soft);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.action-btn-notif:hover {
  color: var(--text-primary);
  background: var(--surface-4);
}

.action-btn-notif.danger:hover {
  background: var(--clr-danger-bg);
  color: var(--clr-danger);
}

.btn-close-sm {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
}

.btn-close-sm:hover {
  color: var(--text-primary);
}
</style>

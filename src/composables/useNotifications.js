import { ref } from 'vue'

const notifications = ref([])

export function useNotifications() {
  const notify = (message, type = 'info', duration = 3000) => {
    const id = Date.now()
    notifications.value.push({ id, message, type })
    
    setTimeout(() => {
      remove(id)
    }, duration)
  }

  const remove = (id) => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  return {
    notifications,
    notify,
    remove
  }
}

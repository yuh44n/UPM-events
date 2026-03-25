<script setup>
import { onMounted, ref } from 'vue'
import { db } from '../firebase/config'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { User, Mail, GraduationCap, X } from 'lucide-vue-next'

const props = defineProps({
  attendeeIds: { type: Array, required: true },
  eventId: { type: String, required: true }
})

const emit = defineEmits(['close'])

const attendees = ref([])
const isPending = ref(true)

onMounted(async () => {
  if (props.attendeeIds.length === 0) {
    isPending.value = false
    return
  }

  // Fetch user details for each attendee ID
  // Note: For production, consider a more efficient query if many attendees
  const userDetails = []
  for (const uid of props.attendeeIds) {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      userDetails.push(userDoc.data())
    }
  }
  attendees.value = userDetails
  isPending.value = false
})
</script>

<template>
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
    <div class="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">
      <div class="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div class="space-y-1">
          <h2 class="text-2xl font-black text-gray-900">Liste des Inscrits</h2>
          <p class="text-sm text-gray-500 font-medium">{{ attendeeIds.length }} participants confirmés</p>
        </div>
        <button @click="$emit('close')" class="p-3 bg-white text-gray-400 hover:text-red-500 rounded-2xl shadow-sm border border-gray-100 transition-all hover:scale-110 active:scale-95">
          <X class="h-6 w-6" />
        </button>
      </div>

      <div class="p-8 max-h-[60vh] overflow-y-auto">
        <div v-if="isPending" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="attendees.length === 0" class="text-center py-12 text-gray-400 space-y-4">
          <Users class="h-16 w-16 mx-auto opacity-20" />
          <p class="font-bold">Aucun inscrit pour le moment.</p>
        </div>

        <div v-else class="space-y-4">
          <div 
            v-for="attendee in attendees" 
            :key="attendee.uid"
            class="flex items-center justify-between p-5 rounded-3xl bg-gray-50 border border-gray-100 group hover:bg-white hover:shadow-md hover:border-blue-100 transition-all"
          >
            <div class="flex items-center space-x-4">
              <div class="bg-white p-3 rounded-2xl shadow-sm group-hover:bg-blue-50 transition-colors">
                <User class="h-6 w-6 text-gray-400 group-hover:text-blue-600" />
              </div>
              <div>
                <p class="font-black text-gray-900 leading-none mb-1">{{ attendee.displayName }}</p>
                <div class="flex items-center text-xs text-gray-500">
                  <Mail class="h-3 w-3 mr-1" /> {{ attendee.email }}
                </div>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1">
              <span class="px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-sm">
                {{ attendee.major }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button @click="$emit('close')" class="btn btn-primary px-8 py-3">Fermer</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

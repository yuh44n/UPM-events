import { ref } from 'vue'
import { db } from '../firebase/config'
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc, 
  arrayUnion, 
  arrayRemove,
  getDoc
} from 'firebase/firestore'

export function useEvents() {
  const events = ref([])
  const polls = ref([])
  const error = ref(null)
  const isPending = ref(false)

  // Real-time fetching
  const getEvents = (status = 'confirmed') => {
    isPending.value = true
    error.value = null
    
    const q = query(
      collection(db, 'events'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = []
      snapshot.docs.forEach(doc => {
        results.push({ ...doc.data(), id: doc.id })
      })
      if (status === 'confirmed') events.value = results
      else polls.value = results
      isPending.value = false
    }, (err) => {
      console.error("Firestore error:", err);
      error.value = 'Could not fetch events'
      isPending.value = false
    })

    return unsubscribe
  }

  const addEvent = async (eventData) => {
    error.value = null
    isPending.value = true

    try {
      const res = await addDoc(collection(db, 'events'), {
        ...eventData,
        createdAt: new Date(),
        votes: [],
        attendees: [],
        status: eventData.status || 'poll' // default to poll phase
      })
      isPending.value = false
      return res
    } catch (err) {
      error.value = err.message
      isPending.value = false
    }
  }

  const toggleVote = async (eventId, userId) => {
    const eventRef = doc(db, 'events', eventId)
    const eventSnap = await getDoc(eventRef)
    
    if (eventSnap.exists()) {
      const votes = eventSnap.data().votes || []
      const hasVoted = votes.includes(userId)

      try {
        await updateDoc(eventRef, {
          votes: hasVoted ? arrayRemove(userId) : arrayUnion(userId)
        })
      } catch (err) {
        error.value = 'Could not toggle vote'
      }
    }
  }

  const registerForEvent = async (eventId, userId) => {
    const eventRef = doc(db, 'events', eventId)
    try {
      await updateDoc(eventRef, {
        attendees: arrayUnion(userId)
      })
    } catch (err) {
      error.value = 'Could not register for event'
    }
  }

  return {
    events,
    polls,
    error,
    isPending,
    getEvents,
    addEvent,
    toggleVote,
    registerForEvent
  }
}

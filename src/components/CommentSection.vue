<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db } from '../firebase/config'
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs } from 'firebase/firestore'
import { useAuth } from '../composables/useAuth'
import { Send, AtSign, User } from 'lucide-vue-next'

const props = defineProps({
  eventId: {
    type: String,
    required: true
  },
  isParticipant: {
    type: Boolean,
    default: false
  }
})

const { user, userData } = useAuth()
const comments = ref([])
const newComment = ref('')
const isPending = ref(false)
const showMentions = ref(false)
const users = ref([])
const filteredUsers = ref([])

let unsubscribe = null

onMounted(async () => {
  // Fetch comments
  const q = query(
    collection(db, 'comments'),
    where('eventId', '==', props.eventId),
    orderBy('createdAt', 'asc')
  )

  unsubscribe = onSnapshot(q, (snapshot) => {
    comments.value = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }))
  })

  // Fetch all users for mentions (only students/clubs)
  const usersSnap = await getDocs(collection(db, 'users'))
  users.value = usersSnap.docs.map(doc => ({
    displayName: doc.data().displayName,
    uid: doc.id
  }))
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const handleInput = (e) => {
  const text = e.target.value
  const cursorPosition = e.target.selectionStart
  const textBeforeCursor = text.substring(0, cursorPosition)
  const lastAtSymbol = textBeforeCursor.lastIndexOf('@')

  if (lastAtSymbol !== -1) {
    const queryText = textBeforeCursor.substring(lastAtSymbol + 1).toLowerCase()
    // Only search if there's no space between @ and cursor, or if we want to support spaces in search
    if (!queryText.includes('\n')) {
      filteredUsers.value = users.value.filter(u => 
        u.displayName.toLowerCase().includes(queryText) && u.uid !== user.value.uid
      ).slice(0, 5)
      showMentions.value = filteredUsers.value.length > 0
      return
    }
  }
  showMentions.value = false
}

const insertMention = (mentionUser) => {
  const text = newComment.value
  const cursorPosition = document.querySelector('.comment-field textarea').selectionStart
  const textBeforeCursor = text.substring(0, cursorPosition)
  const textAfterCursor = text.substring(cursorPosition)
  const lastAtSymbol = textBeforeCursor.lastIndexOf('@')

  const newText = textBeforeCursor.substring(0, lastAtSymbol) + '@' + mentionUser.displayName + ' ' + textAfterCursor
  newComment.value = newText
  showMentions.value = false
}

const postComment = async () => {
  if (!newComment.value.trim() || isPending.value) return

  const text = newComment.value.trim()
  isPending.value = true
  try {
    await addDoc(collection(db, 'comments'), {
      eventId: props.eventId,
      userId: user.value.uid,
      userName: userData.value.displayName,
      text,
      createdAt: serverTimestamp()
    })

    // Handle mention notifications - check against our user list
    for (const u of users.value) {
      if (text.includes(`@${u.displayName}`) && u.uid !== user.value.uid) {
        await addDoc(collection(db, 'notifications'), {
          userId: u.uid,
          type: 'mention',
          message: `${userData.value.displayName} vous a mentionné dans une discussion.`,
          link: `/event/${props.eventId}`,
          read: false,
          createdAt: serverTimestamp()
        })
      }
    }

    newComment.value = ''
  } catch (err) {
    console.error('Error posting comment:', err)
  } finally {
    isPending.value = false
  }
}

const formatText = (text) => {
  let formatted = text
  // Highlight mentions by checking against our user list
  users.value.forEach(u => {
    const mentionStr = `@${u.displayName}`
    if (formatted.includes(mentionStr)) {
      const regex = new RegExp(mentionStr, 'g')
      formatted = formatted.replace(regex, `<span class="mention">${mentionStr}</span>`)
    }
  })
  return formatted
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <section class="comments-section">
    <div class="section-title mb-6">
      <h3 class="display-italic">Espace Discussion</h3>
    </div>

    <div v-if="!isParticipant" class="alert-box mb-6">
      <p>Seuls les participants inscrits à cet événement peuvent interagir ici.</p>
    </div>

    <div class="comments-list">
      <div v-if="comments.length === 0" class="empty-discussion">
        <p>Aucun message pour le moment. Soyez le premier à réagir !</p>
      </div>

      <div 
        v-for="comment in comments" 
        :key="comment.id" 
        class="comment-item"
        :class="{ 'comment-item--own': comment.userId === user?.uid }"
      >
        <div class="comment-avatar">
          <User class="w-4 h-4" />
        </div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">{{ comment.userName }}</span>
            <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
          </div>
          <p class="comment-text" v-html="formatText(comment.text)"></p>
        </div>
      </div>
    </div>

    <div v-if="isParticipant" class="comment-input-wrap">
      <div v-if="showMentions" class="mentions-dropdown">
        <button 
          v-for="u in filteredUsers" 
          :key="u.uid" 
          @click="insertMention(u)"
          class="mention-item"
        >
          @{{ u.displayName }}
        </button>
      </div>

      <div class="comment-field">
        <textarea 
          v-model="newComment" 
          @input="handleInput"
          placeholder="Écrivez un message... (utilisez @ pour mentionner)"
          class="form-textarea"
          rows="1"
        ></textarea>
        <button 
          @click="postComment" 
          :disabled="!newComment.trim() || isPending"
          class="btn-send"
        >
          <Send class="w-4 h-4" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.comments-section {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--bdr-soft);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
  margin-bottom: 24px;
}

.comment-item {
  display: flex;
  gap: 12px;
  max-width: 85%;
}

.comment-item--own {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--surface-3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  flex-shrink: 0;
}

.comment-content {
  background: var(--surface-1);
  border: 1px solid var(--bdr-faint);
  padding: 10px 14px;
  border-radius: var(--r-lg);
  position: relative;
}

.comment-item--own .comment-content {
  background: var(--gold-glow);
  border-color: var(--gold-glow-2);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.comment-author {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gold-200);
}

.comment-date {
  font-size: 0.65rem;
  color: var(--text-muted);
}

.comment-text {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.comment-input-wrap {
  position: relative;
}

.mentions-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 200px;
  background: var(--surface-2);
  border: 1px solid var(--bdr-mid);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 10;
  margin-bottom: 8px;
}

.mention-item {
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
}

.mention-item:hover {
  background: var(--gold-glow);
  color: var(--gold-100);
}

.comment-field {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.comment-field textarea {
  min-height: 44px;
  border-radius: var(--r-xl);
  padding: 10px 20px;
  resize: none;
}

.btn-send {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--gold-200);
  color: var(--void);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--t-fast);
  flex-shrink: 0;
}

.btn-send:hover {
  transform: scale(1.05);
  background: var(--gold-100);
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alert-box {
  background: var(--surface-2);
  border: 1px solid var(--bdr-soft);
  padding: 12px 16px;
  border-radius: var(--r-md);
  font-size: 0.82rem;
  color: var(--text-muted);
  text-align: center;
}

.empty-discussion {
  text-align: center;
  padding: 32px;
  color: var(--text-muted);
  font-style: italic;
  font-size: 0.88rem;
}

:deep(.mention) {
  color: var(--gold-200);
  font-weight: 600;
}
</style>

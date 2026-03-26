<script setup>
import { ref } from 'vue'
import { Upload, X } from 'lucide-vue-next'
import { useCloudinary } from '../composables/useCloudinary'
import BadgeStatus from './BadgeStatus.vue'

const emit = defineEmits(['uploaded', 'error'])

const { uploadImage, isPending, error, progress } = useCloudinary()
const fileInput = ref(null)
const previewUrl = ref(null)
const uploadedUrl = ref(null)
const isDragging = ref(false)

const handleFileSelect = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  processFile(file)
}

const handleDrop = async (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (!file) return
  processFile(file)
}

const processFile = async (file) => {
  // Local preview
  previewUrl.value = URL.createObjectURL(file)
  
  // Upload to Cloudinary
  const url = await uploadImage(file)
  if (url) {
    uploadedUrl.value = url
    emit('uploaded', url)
  } else {
    emit('error', error.value)
  }
}

const clear = () => {
  previewUrl.value = null
  uploadedUrl.value = null
  if (fileInput.value) fileInput.value.value = ''
  emit('uploaded', null)
}
</script>

<template>
  <div class="image-uploader-container">
    <div 
      class="image-uploader"
      :class="{ 'image-uploader--dragging': isDragging }"
      @click="!previewUrl && fileInput.click()"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <input 
        ref="fileInput"
        type="file" 
        accept="image/*" 
        class="hidden" 
        @change="handleFileSelect"
      />

      <!-- Preview -->
      <template v-if="previewUrl">
        <div class="image-uploader__preview">
          <img :src="previewUrl" alt="Affiche" />
          <div class="image-uploader__preview-overlay">
            <button @click.stop="clear" class="btn btn-danger btn-sm">
              <X class="w-4 h-4" /> Supprimer
            </button>
          </div>
        </div>
      </template>

      <!-- Placeholder -->
      <div v-else class="text-center">
        <Upload class="image-uploader__icon" />
        <div class="image-uploader__label">Cliquez ou glissez l'affiche ici</div>
        <div class="image-uploader__sub">Format JPG, PNG ou WebP (Max. 5MB)</div>
      </div>

      <!-- Uploading Overlay -->
      <div v-if="isPending" class="absolute inset-0 bg-surface-0/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 px-8">
        <div class="spinner"></div>
        <div class="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden border border-bdr-soft">
          <div 
            class="h-full bg-gold-200 transition-all duration-300 ease-out"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <p class="overline text-gold-200">{{ progress }}% - Envoi en cours...</p>
      </div>

      <!-- Success Overlay -->
      <div v-if="uploadedUrl" class="absolute top-3 right-3">
        <BadgeStatus label="Prêt" type="success" />
      </div>
    </div>

    <p v-if="error" class="form-error mt-2 flex items-center gap-1">
      <X class="w-3 h-3" /> {{ error }}
    </p>
  </div>
</template>

<style scoped>
.image-uploader-container { width: 100%; }
</style>

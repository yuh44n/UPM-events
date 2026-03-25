import { ref } from 'vue'

const CLOUD_NAME = 'ds9ai5yfp'
const UPLOAD_PRESET = 'upm_events' // Make sure to create an "Unsigned" preset in Cloudinary dashboard

export function useCloudinary() {
  const isPending = ref(false)
  const error = ref(null)
  const progress = ref(0)

  const uploadImage = async (file) => {
    isPending.value = true
    error.value = null
    progress.value = 0

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error('Could not upload image')

      const data = await res.json()
      isPending.value = false
      return data.secure_url
    } catch (err) {
      error.value = err.message
      isPending.value = false
      return null
    }
  }

  return {
    uploadImage,
    isPending,
    error,
    progress
  }
}

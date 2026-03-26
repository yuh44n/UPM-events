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

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          progress.value = Math.round((e.loaded * 100) / e.total)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText)
          isPending.value = false
          resolve(data.secure_url)
        } else {
          error.value = 'Could not upload image'
          isPending.value = false
          resolve(null)
        }
      })

      xhr.addEventListener('error', () => {
        error.value = 'Network error'
        isPending.value = false
        resolve(null)
      })

      xhr.send(formData)
    })
  }

  return {
    uploadImage,
    isPending,
    error,
    progress
  }
}

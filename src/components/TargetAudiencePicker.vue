<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  label: { type: String, default: 'Public Cible' }
})

const emit = defineEmits(['update:modelValue'])

const majors = [
  'Ingénierie', 
  'Business', 
  'Santé', 
  'Hôtellerie', 
  'Design', 
  'Journalisme'
]

const isAllSelected = computed(() => props.modelValue.includes('all'))

const toggleMajor = (major) => {
  let newValue = [...props.modelValue]
  
  if (major === 'all') {
    newValue = isAllSelected.value ? [] : ['all']
  } else {
    // Remove 'all' if selecting a specific major
    newValue = newValue.filter(v => v !== 'all')
    
    if (newValue.includes(major)) {
      newValue = newValue.filter(v => v !== major)
    } else {
      newValue.push(major)
    }
    
    // If all majors are selected, just select 'all' instead? 
    // Or just keep them. Usually 'all' is exclusive.
  }
  
  emit('update:modelValue', newValue)
}
</script>

<template>
  <div class="form-group">
    <label class="form-label">{{ label }}</label>
    <div class="flex flex-wrap gap-2 mt-2">
      <button
        type="button"
        @click="toggleMajor('all')"
        :class="['px-4 py-2 rounded-full text-xs font-medium transition-all border', 
          isAllSelected ? 'bg-gold-200 border-gold-200 text-void shadow-lg' : 'bg-surface-2 border-bdr-soft text-text-muted hover:border-gold-300']"
      >
        Tous les étudiants
      </button>

      <button
        v-for="major in majors"
        :key="major"
        type="button"
        @click="toggleMajor(major)"
        :class="['px-4 py-2 rounded-full text-xs font-medium transition-all border', 
          modelValue.includes(major) ? 'bg-gold-200 border-gold-200 text-void shadow-lg' : 'bg-surface-2 border-bdr-soft text-text-muted hover:border-gold-300']"
      >
        {{ major }}
      </button>
    </div>
  </div>
</template>

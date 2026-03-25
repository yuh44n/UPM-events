<script setup>
defineProps({
  label: { type: String, required: true },
  type: { type: String, default: 'info' }
})

const classMap = {
  info: 'badge-open',
  success: 'badge-confirmed',
  warning: 'badge-paid',
  danger: 'badge-draft',
  gray: 'badge-draft',
  purple: 'badge-specific',
  poll: 'badge-poll',
  free: 'badge-free'
}
</script>

<template>
  <span :class="['badge', classMap[type] || 'badge-draft']">
    {{ label }}
  </span>
</template>

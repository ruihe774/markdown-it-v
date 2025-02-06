<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: ['modelValue'],
  emits: ['update:modelValue'],
})
</script>

<template>
  <textarea
    :value="modelValue"
    @input="
      $emit('update:modelValue', ($event.target! as HTMLTextAreaElement).value)
    "
  ></textarea>
</template>

<style scoped>
textarea {
  padding: 2em;
}
</style>

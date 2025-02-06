<script lang="ts">
import { defineComponent } from 'vue'

import MarkdownEditor from './components/MarkdownEditor.vue'
import MarkdownPreviewer from './components/MarkdownPreviewer.tsx'

export default defineComponent({
  components: {
    MarkdownEditor,
    MarkdownPreviewer,
  },
  data() {
    return {
      source: 'The *quick* brown fox _jumps_ over the **lazy** dog.',
    }
  },
})
</script>

<template>
  <div class="mirror">
    <MarkdownEditor v-model="source" />
    <MarkdownPreviewer :source="source" />
  </div>
</template>

<style scoped>
.mirror {
  display: flex;
  align-items: stretch;
  width: 100%;
  & > * {
    flex-basis: 50%;
  }
}
</style>

import { h, defineComponent } from 'vue'
import MarkdownIt from 'markdown-it'
import MarkdownItVPlugin from 'markdown-it-v'
import type { MarkdownItV } from 'markdown-it-v'

const md = MarkdownIt().use(MarkdownItVPlugin) as unknown as MarkdownItV

export default defineComponent({
  props: ['source'],
  computed: {
    sDom() {
      return md.render(this.source)
    },
  },
  render() {
    return <div style={{ padding: '2em' }}>{this.sDom.toVue(h)}</div>
  },
})

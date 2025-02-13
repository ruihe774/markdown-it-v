import { default as createRenderer, Renderer } from './renderer.ts'
import type MarkdownIt from 'markdown-it'
import type StreamDom from './stream-dom.ts'

export type { default as StreamDom } from './stream-dom.ts'

// @ts-ignore
export interface MarkdownItV extends MarkdownIt {
  /**
   * Render markdown string into html. It does all magic for you :).
   *
   * `env` can be used to inject additional metadata (`{}` by default).
   * But you will not need it with high probability. See also comment
   * in {@link MarkdownIt.parse}.
   *
   * @param src source string
   * @param env environment sandbox
   */
  render(src: string, env?: any): StreamDom

  /**
   * Similar to {@link MarkdownIt.render} but for single paragraph content. Result
   * will NOT be wrapped into `<p>` tags.
   *
   * @param src source string
   * @param env environment sandbox
   */
  renderInline(src: string, env?: any): StreamDom
}

type BaseRenderer = MarkdownIt.Renderer

export default (md: MarkdownIt) => {
  // workaround readonly
  const renderer = createRenderer(md)
  ;(md as unknown as { renderer: Renderer }).renderer = renderer

  // auto clear renderer
  const mdv = md as unknown as MarkdownItV
  const render = md.render
  const renderInline = md.renderInline
  mdv.render = function (...args) {
    const result = render.apply(this, args) as unknown as StreamDom
    if ((this.renderer as unknown as Renderer) === renderer) {
      renderer.clear()
      result.xhtmlOut = !!md.options.xhtmlOut
    }
    return result
  }
  mdv.renderInline = function (...args) {
    const result = renderInline.apply(this, args) as unknown as StreamDom
    if ((this.renderer as unknown as Renderer) === renderer) {
      renderer.clear()
      result.xhtmlOut = !!md.options.xhtmlOut
    }
    return result
  }

  return mdv
}

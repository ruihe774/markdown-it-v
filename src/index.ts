import createRenderer from './renderer'
import { createClass } from './utils'
import type MarkdownIt from 'markdown-it'
import type StreamDom from './stream-dom'

export type { default as StreamDom } from './stream-dom'

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

export default (md: MarkdownIt): MarkdownItV => {
  const Base = Object.getPrototypeOf(md).constructor as new () => MarkdownIt

  function MarkdownItV() {
    // @ts-ignore
    let _this = this
    const constructing = _this instanceof MarkdownItV
    if (constructing) {
      _this = Reflect.construct(
        Base,
        [],
        Object.getPrototypeOf(_this).constructor,
      )
    }

    _this.renderer = createRenderer(md)

    if (!constructing) {
      Object.setPrototypeOf(_this, MarkdownItV.prototype)
    }
    return _this
  }

  const methods = {
    constructor: MarkdownItV,
    render(...args) {
      const result = Base.prototype.render.apply(this, args) as StreamDom
      if ('clear' in this.renderer) {
        // @ts-ignore
        this.renderer.clear()
        result.xhtmlOut = !!md.options.xhtmlOut
      }
      return result
    },
    renderInline(...args) {
      const result = Base.prototype.renderInline.apply(this, args) as StreamDom
      if ('clear' in this.renderer) {
        // @ts-ignore
        this.renderer.clear()
        result.xhtmlOut = !!md.options.xhtmlOut
      }
      return result
    },
  } as MarkdownItV & { constructor: any }

  createClass(MarkdownItV, Base, methods)

  return MarkdownItV.call(md)
}

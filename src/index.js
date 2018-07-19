import Renderer from './renderer'

export default md => {
  md.renderer = new Renderer()
  const render = md.render
  const renderInline = md.renderInline
  md.render = function(...args) {
    const result = render.apply(this, args)
    if (this.renderer instanceof Renderer) {
      this.renderer.clear()
      result.xhtmlOut = md.options.xhtmlOut
    }
    return result
  }
  md.renderInline = function(...args) {
    const result = renderInline.apply(this, args)
    if (this.renderer instanceof Renderer) {
      this.renderer.clear()
      result.xhtmlOut = md.options.xhtmlOut
    }
    return result
  }
}

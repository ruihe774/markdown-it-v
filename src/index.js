import Renderer from './renderer'

export default md => {
    md.renderer = new Renderer
    const render = md.render
    const renderInline = md.renderInline
    md.render = function (...args) {
        const result = render.apply(this, args)
        this.renderer.clear?.()
        return result
    }
    md.renderInline = function (...args) {
        const result = renderInline.apply(this, args)
        this.renderer.clear?.()
        return result
    }
}

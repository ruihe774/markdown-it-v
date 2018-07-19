import Renderer from './renderer'

export default md => {
    md.renderer = new Renderer
    const render = ::md.render
    const renderInline = ::md.renderInline
    md.render = function (...args) {
        const result = render(...args)
        this.renderer.clear?.()
        return result
    }
    md.renderInline = function (...args) {
        const result = renderInline(...args)
        this.renderer.clear?.()
        return result
    }
}

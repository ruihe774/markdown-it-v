import StreamDom from './stream-dom'
import OriginalRenderer from 'markdown-it/lib/renderer'

const default_rules = {
    text (tokens, idx, options, env, slf) {
        slf.sDom.appendText(tokens[idx].content)
        return slf.sDom
    }
}

export default class Renderer extends OriginalRenderer {
    constructor () {
        super()
        this.rules = { ...default_rules }
        this.clear()
    }
    clear () {
        this.sDom = new StreamDom
    }
    renderAttrs ({ attrs }) {
        const result = {}
        attrs?.forEach(([key, value]) => void (result[key] = value))
        return result
    }
    render (tokens, options, env) {
        tokens.forEach(({ type, children }, i) => {
            if (type === 'inline') {
                this.renderInline(children, options, env)
            } else if (typeof this.rules[type] !== 'undefined') {
                this.rules[type](tokens, i, options, env, this)
            } else {
                this.renderToken(tokens, i, options, env)
            }
        })
        return this.sDom
    }
    renderInline (tokens, options, env) {
        tokens.forEach(({ type }, i) => {
            if (typeof this.rules[type] !== 'undefined') {
                this.rules[type](tokens, i, options, env, this)
            } else {
                this.renderToken(tokens, i, options)
            }
        })
        return this.sDom
    }
    renderToken (tokens, idx, options) {
        const token = tokens[idx]
        const { tag: tagName, nesting } = token
        if (nesting < 0) {
            this.sDom.closeTag()
        } else {
            const attrs = this.renderAttrs(token)
            this.sDom.openTag(tagName, attrs)
            if (nesting === 0) {
                this.sDom.closeTag()
            }
        }
        return this.sDom
    }
}

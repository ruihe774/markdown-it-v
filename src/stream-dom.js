import { escapeHtml } from 'markdown-it/lib/common/utils'

const voidElements = new Set(["base", "link", "meta", "hr", "br", "img", "embed", "param", "source", "area", "col", "input", "command"])

export const voidTag = Symbol('void')

export class Node {
    constructor (tagName, attrs = {}, parent = null, ...children) {
        this.tagName = tagName
        this.attrs = {}
        Object.entries(attrs).filter(([key, value]) => key !== '__html').forEach(([key, value]) => void (this.attrs[key] = value))
        this.innerHTML = attrs.__html
        this.parent = parent
        this.children = children
    }
    renderAttrsToHTML () {
        return Object.entries(this.attrs).map(([key, value]) => `${escapeHtml(key)}="${escapeHtml(value)}"`).join(' ')
    }
    renderInnerHTML (xhtmlOut = false) {
        if (voidElements.has(this.tagName)) {
            return ''
        } else if (this.innerHTML == null) {
            return this.children.map(child => typeof child === 'string' ? escapeHtml(child) : child.renderToHTML(xhtmlOut)).join('')
        } else {
            return this.innerHTML
        }
    }
    renderToHTML (xhtmlOut = false) {
        if (this.tagName === voidTag) {
            return this.renderInnerHTML()
        }
        const attrsString = this.renderAttrsToHTML()
        let result = '<' + this.tagName
        if (attrsString) {
            result += ' ' + attrsString
        }
        if (voidElements.has(this.tagName)) {
            if (xhtmlOut) {
                result += ' />'
            } else {
                result += '>'
            }
        } else {
            result += '>'
            result += this.renderInnerHTML(xhtmlOut)
            result += `</${this.tagName}>`
        }
        return result
    }
}

export default class StreamDom {
    currentNode = new Node('root')
    xhtmlOut = false
    openTag (tagName, attrs) {
        const newNode = new Node(tagName, attrs, this.currentNode)
        this.currentNode.children.push(newNode)
        this.currentNode = newNode
    }
    closeTag () {
        this.currentNode = this.currentNode.parent
    }
    appendText (text) {
        this.currentNode.children.push(text)
    }
    toHTML (root, xhtmlOut = this.xhtmlOut) {
        let result = this.currentNode.renderToHTML(xhtmlOut)
        result = /^<root>(.*)<\/root>$/s.exec(result)[1]
        if (root != null) {
            result = `<${root}>${result}</${root}>`
        }
        return result
    }
}

import { escapeHtml } from 'markdown-it/lib/common/utils'

const voidElements = new Set(["base", "link", "meta", "hr", "br", "img", "embed", "param", "source", "area", "col", "input", "command"])

export class Node {
    constructor (tagName, attrs = {}, parent = null, ...children) {
        this.tagName = tagName
        this.attrs = attrs
        this.parent = parent
        this.children = children
    }
    renderAttrsToHTML () {
        return Object.entries(this.attrs).map(([key, value]) => `${escapeHtml(key)}="${escapeHtml(value)}"`).join(' ')
    }
    renderToHTML (xhtmlOut = false) {
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
            result += this.children.map(child => typeof child === 'string' ? escapeHtml(child) : child.renderToHTML(xhtmlOut)).join('')
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

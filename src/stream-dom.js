import { escapeHtml } from 'markdown-it/lib/common/utils'
import * as crossCreateElement from './cross-create-element'
import _ from 'lodash'

const voidElements = [
  'base',
  'link',
  'meta',
  'hr',
  'br',
  'img',
  'embed',
  'param',
  'source',
  'area',
  'col',
  'input',
  'command',
]

export const voidTag = Symbol('void')

export class Node {
  constructor(tagName, attrs = {}, parent = null, ...children) {
    this.tagName = tagName
    this.attrs = {}
    Object.entries(attrs)
      .filter(([key, value]) => key !== '__html')
      .forEach(([key, value]) => void (this.attrs[key] = value))
    this.innerHTML = attrs.__html
    this.parent = parent
    this.children = children
  }
  renderAttrsToHTML() {
    return Object.entries(this.attrs)
      .map(([key, value]) => `${escapeHtml(key)}="${escapeHtml(value)}"`)
      .join(' ')
  }
  renderInnerHTML(xhtmlOut = false) {
    if (voidElements.includes(this.tagName)) {
      return ''
    } else if (this.innerHTML == null) {
      return this.children
        .map(
          child =>
            typeof child === 'string'
              ? escapeHtml(child)
              : child.renderToHTML(xhtmlOut),
        )
        .join('')
    } else {
      return this.innerHTML
    }
  }
  renderToHTML(xhtmlOut = false) {
    if (this.tagName === voidTag) {
      return this.renderInnerHTML(xhtmlOut)
    }
    const attrsString = this.renderAttrsToHTML()
    let result = '<' + this.tagName
    if (attrsString) {
      result += ' ' + attrsString
    }
    if (voidElements.includes(this.tagName)) {
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
  renderInnerVDOM(h) {
    return this.children.map(
      child => (typeof child === 'string' ? child : child.renderToVDOM(h)),
    ) |> _.flatten
  }
  renderToVDOM(h) {
    if (this.tagName === voidTag) {
      return this.renderInnerVDOM(h)
    } else {
      return h(
        this.tagName,
        this.attrs,
        this.innerHTML,
        this.renderInnerVDOM(h),
      )
    }
  }
  dropParent() {
    this.parent = null
  }
  dropParents() {
    this.dropParent()
    this.children.filter(el => typeof el !== 'string').forEach(el => el.dropParents())
  }
}

export default class StreamDom {
  currentNode = new Node(voidTag)
  xhtmlOut = false
  openTag(tagName, attrs) {
    const newNode = new Node(tagName, attrs, this.currentNode)
    this.currentNode.children.push(newNode)
    this.currentNode = newNode
  }
  closeTag() {
    this.currentNode = this.currentNode.parent
  }
  appendText(text) {
    this.currentNode.children.push(text)
  }
  toHTML(xhtmlOut = this.xhtmlOut) {
    return this.currentNode.renderToHTML(xhtmlOut)
  }
  toVue(createElement) {
    return this.currentNode.renderToVDOM(
      crossCreateElement.createElementVueFactory(createElement),
    )
  }
  toReact(createElement) {
    return this.currentNode.renderToVDOM(
      crossCreateElement.createElementReactFactory(createElement),
    )
  }
  toNative(document) {
    return this.currentNode.renderToVDOM(
      crossCreateElement.createElementNativeFactory(document),
    ).map(el => typeof el === 'string' ? document.createTextNode(el) : el)
  }
}

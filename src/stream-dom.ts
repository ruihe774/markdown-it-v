import * as crossCreateElement from './cross-create-element'
import type MarkdownIt from 'markdown-it'
import type { Dictionary } from './utils'
import type { CreateElement, VirtualElement } from './cross-create-element'
import type { h as vueCreateElement, VNode as VueElement } from 'vue'
import type { createElement as reactCreateElement, ReactElement } from 'react'

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

export class VirtualNode {
  attrs: Dictionary<string>
  innerHTML?: string
  children: (string | VirtualNode)[]

  constructor(
    public tagName: string | null,
    attrs?: Dictionary<string>,
    public parent?: VirtualNode,
    ...children: (string | VirtualNode)[]
  ) {
    this.attrs = Object.assign({}, attrs)
    this.innerHTML = this.attrs.__html
    delete this.attrs.__html
    this.children = children
  }

  renderAttrsToHTML(escapeHtml: (str: string) => string): string {
    return Object.entries(this.attrs)
      .map(([key, value]) => `${escapeHtml(key)}="${escapeHtml(value)}"`)
      .join(' ')
  }

  renderInnerHTML(
    escapeHtml: (str: string) => string,
    xhtmlOut: boolean = false,
  ): string {
    if ((voidElements as any[]).includes(this.tagName)) {
      return ''
    } else if (this.innerHTML == null) {
      return this.children
        .map((child) =>
          typeof child == 'string'
            ? escapeHtml(child)
            : child.renderToHTML(escapeHtml, xhtmlOut),
        )
        .join('')
    } else {
      return this.innerHTML
    }
  }

  renderToHTML(
    escapeHtml: (str: string) => string,
    xhtmlOut: boolean = false,
  ): string {
    if (this.tagName == null) {
      return this.renderInnerHTML(escapeHtml, xhtmlOut)
    }
    const attrsString = this.renderAttrsToHTML(escapeHtml)
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
      result += this.renderInnerHTML(escapeHtml, xhtmlOut)
      result += `</${this.tagName}>`
    }
    return result
  }

  renderInnerVDOM(h: CreateElement): (string | VirtualElement)[] {
    return this.children.flatMap((child) =>
      typeof child == 'string' ? child : child.renderToVDOM(h),
    )
  }

  renderToVDOM(h: CreateElement): VirtualElement | (string | VirtualElement)[] {
    if (this.tagName == null) {
      if (this.innerHTML != null) {
        throw new Error('`void` tag cannot contain innerHTML')
      }
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
}

export default class StreamDom {
  currentNode = new VirtualNode(null)
  xhtmlOut = false

  constructor(private utils: MarkdownIt.Utils) {}

  openTag(tagName: string | null, attrs: Dictionary<string> = {}): void {
    const newNode = new VirtualNode(tagName, attrs, this.currentNode)
    this.currentNode.children.push(newNode)
    this.currentNode = newNode
  }

  closeTag(): void {
    this.currentNode = this.currentNode.parent!
  }

  appendText(text: string): void {
    this.currentNode.children.push(text)
  }

  toHTML(xhtmlOut = this.xhtmlOut): string {
    return this.currentNode.renderToHTML(this.utils.escapeHtml, xhtmlOut)
  }

  toVue(createElement: typeof vueCreateElement): (string | VueElement)[] {
    return this.currentNode.renderToVDOM(
      crossCreateElement.createElementVueFactory(createElement),
    ) as (string | VueElement)[]
  }

  toReact(createElement: typeof reactCreateElement): (string | ReactElement)[] {
    return this.currentNode.renderToVDOM(
      crossCreateElement.createElementReactFactory(createElement),
    ) as (string | ReactElement)[]
  }

  toNative(
    createElement: typeof document.createElement,
  ): (string | HTMLElement)[] {
    return this.currentNode.renderToVDOM(
      crossCreateElement.createElementNativeFactory(createElement),
    ) as (string | HTMLElement)[]
  }
}

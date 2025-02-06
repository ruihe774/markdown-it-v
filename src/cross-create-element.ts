import type { Dictionary } from 'lodash'
import type { h as vueCreateElement, VNode as VueElement } from 'vue'
import type { createElement as reactCreateElement, ReactElement } from 'react'

export type VirtualElement = VueElement | ReactElement | HTMLElement
export type CreateElement = (
  tagName: string,
  attrs: Dictionary<string>,
  innerHTML: string | undefined,
  children: (string | VirtualElement)[],
) => VirtualElement

export function createElementVueFactory(
  h: typeof vueCreateElement,
): CreateElement {
  return function createElementVue(tagName, attrs, innerHTML, children) {
    const arg2: { [type: string]: any } = {}
    for (const [name, value] of Object.entries(attrs)) {
      arg2['^' + name] = value
    }
    if (innerHTML != null) {
      arg2['.innerHTML'] = innerHTML
    }
    return h(tagName, arg2, children as (string | VueElement)[])
  }
}

export function createElementReactFactory(
  h: typeof reactCreateElement,
): CreateElement {
  return function createElementReact(tagName, attrs, innerHTML, children) {
    const arg2: { [type: string]: any } = { ...attrs }
    if (innerHTML != null) {
      arg2.dangerouslySetInnerHTML = { __html: innerHTML }
    }
    if (typeof arg2.style === 'string') {
      const styleString = arg2.style
      delete arg2.style
      arg2.ref = (elem: HTMLElement) => elem.setAttribute('style', styleString)
    }
    return h(tagName, arg2, ...(children as (string | ReactElement)[]))
  }
}

export function createElementNativeFactory(
  createElement: typeof document.createElement,
): CreateElement {
  return function createElementNative(tagName, attrs, innerHTML, children) {
    const el = createElement(tagName)
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value)
    }
    if (innerHTML != null) {
      el.innerHTML = innerHTML
    }
    if (children.length) {
      el.append(...(children as (string | HTMLElement)[]))
    }
    return el
  }
}

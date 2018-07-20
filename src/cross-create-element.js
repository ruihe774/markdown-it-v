export function createElementVueFactory(h) {
  return function createElementVue(tagName, attrs, innerHTML, children) {
    const arg2 = { attrs }
    if (innerHTML != null) {
      arg2.domProps = { innerHTML }
    }
    return h(tagName, arg2, children)
  }
}

export function createElementReactFactory(h) {
  return function createElementReact(tagName, attrs, innerHTML, children) {
    const arg2 = { ...attrs }
    if (innerHTML != null) {
      arg2.dangerouslySetInnerHTML = { __html: innerHTML }
    }
    return h(tagName, arg2, ...children)
  }
}

export function createElementNativeFactory(document) {
  return function createElementNative(tagName, attrs, innerHTML, children) {
    const el = document.createElement(tagName)
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value)
    }
    if (innerHTML != null) {
      el.innerHTML = innerHTML
    }
    for (const child of children) {
      el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child)
    }
    return el
  }
}

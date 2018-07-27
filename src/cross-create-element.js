import csstree from 'css-tree'

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
    if (typeof arg2.style === 'string') {
      const styleString = arg2.style
      arg2.style = {}
      csstree.walk(
        csstree.parse(styleString, {
          context: 'declarationList',
          parseValue: false,
        }),
        ({ type, property, value }) => {
          if (type === 'Declaration') {
            arg2.style[property] = value.value
          }
        },
      )
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
      el.appendChild(
        typeof child === 'string' ? document.createTextNode(child) : child,
      )
    }
    return el
  }
}

export function createElementVueFactory(h) {
  return function createElementVue(tagName, attrs, innerHTML, children) {
    const arg2 = { attrs }
    if (innerHTML != null) {
      arg2.domProps = { innerHTML }
    }
    return h(tagName, arg2, children)
  }
}

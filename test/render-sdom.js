const puppeteer = require('puppeteer')

class SDomRenderer {
  async open() {
    this.browser = await puppeteer.launch({
      args: ['--no-sandbox'],
    })
    this.page = await this.browser.newPage()
    await this.page.goto('about:blank')
    await this.page.addScriptTag({
      path: './dist/index.js',
    })
    await this.page.addScriptTag({
      path: './node_modules/markdown-it/dist/markdown-it.js',
    })
    await this.page.addScriptTag({
      path: './node_modules/vue/dist/vue.global.js',
    })
    await this.page.addScriptTag({
      path: './node_modules/react/umd/react.development.js',
    })
    await this.page.addScriptTag({
      path: './node_modules/react-dom/umd/react-dom.development.js',
    })
  }
  async close() {
    await this.browser.close()
  }
  async render(option, text) {
    return await this.page.evaluate(
      /* eslint-disable no-undef */
      (option, text) => {
        const md = markdownit(option).use(markdownitv)
        const sdom = md.render(text)
        function genNative() {
          const root = document.createElement('div')
          root.append(...sdom.toNative(document.createElement.bind(document)))
          return root.innerHTML
        }
        function genVue() {
          const root = document.createElement('div')
          const vue = Vue.createApp({
            render() {
              const { h } = Vue
              return h('div', null, sdom.toVue(h))
            },
          }).mount(root)
          vue.$forceUpdate()
          return vue.$el.innerHTML
        }
        function genReact() {
          const root = document.createElement('div')
          const reactEl = React.createElement(
            'div',
            null,
            ...sdom.toReact(React.createElement),
          )
          ReactDOM.render(reactEl, root)
          return root.firstElementChild.innerHTML
        }
        return {
          native: genNative(),
          vue: genVue(),
          react: genReact(),
        }
      },
      /* eslint-enable no-undef */
      option,
      text,
    )
  }
  async renderHTML(html) {
    return await this.page.evaluate(
      /* eslint-disable no-undef */
      html => {
        const root = document.createElement('div')
        root.innerHTML = html
        return root.innerHTML
      },
      /* eslint-enable no-undef */
      html,
    )
  }
}

module.exports = SDomRenderer

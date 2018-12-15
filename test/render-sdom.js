const puppeteer = require('puppeteer')

class SDomRenderer {
  async open() {
    this.browser = await puppeteer.launch({
      args: ['--no-sandbox'],
    })
    this.page = await this.browser.newPage()
    await this.page.goto('about:blank')
    await this.page.addScriptTag({
      path: './dist/testIndex.iife.js',
    })
    await this.page.addScriptTag({
      path: './node_modules/vue/dist/vue.js',
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
        const md = Test.MarkdownIt(option).use(Test.MarkdownItV)
        const sdom = md.render(text)
        function genNative() {
          const root = document.createElement('div')
          sdom.toNative(document).forEach(el => root.appendChild(el))
          return root.innerHTML
        }
        function genVue() {
          const vue = new Vue({
            render(h) {
              return h('div', null, sdom.toVue(h))
            },
          })
          vue.$mount()
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
          return root.children[0].innerHTML
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

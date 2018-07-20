const puppeteer = require('puppeteer')

class SDomRenderer {
  async open() {
    this.browser = await puppeteer.launch()
    this.page = await this.browser.newPage()
    await this.page.goto('about:blank')
    await this.page.addScriptTag({
      path: './dist/testIndex.iife.js'
    })
    await this.page.addScriptTag({
      path: './node_modules/vue/dist/vue.js'
    })
    await this.page.addScriptTag({
      path: './node_modules/react/umd/react.development.js'
    })
    await this.page.addScriptTag({
      path: './node_modules/react-dom/umd/react-dom.development.js'
    })
  }
  async close() {
    await this.browser.close()
  }
  async render(text) {
    return await this.page.evaluate(text => {
      const md = Test.MarkdownIt()
      md.use(Test.MarkdownItV)
      const sdom = md.render(text)
      function genNative() {
        const root = document.createElement('div')
        sdom.toNative(document).forEach(el => root.appendChild(el))
        return root.innerHTML
      }
      function genVue() {
        const vue = new Vue({
          render(h) { return h('div', null, sdom.toVue(h)) }
        })
        vue.$mount()
        vue.$forceUpdate()
        return vue.$el.innerHTML
      }
      function genReact() {
        const root = document.createElement('div')
        const reactEl = React.createElement('div', null, ...sdom.toReact(React.createElement))
        ReactDOM.render(reactEl, root)
        return root.children[0].innerHTML
      }
      return {
        native: genNative(),
        vue: genVue(),
        react: genReact()
      }
    }, text)
  }
}

module.exports = SDomRenderer

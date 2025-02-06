# markdown⁠-⁠it⁠-⁠v
A custom markdown⁠-⁠it renderer that outputs virtual DOM.

![version](https://img.shields.io/npm/v/markdown-it-v.svg?style=for-the-badge)

## Motivation

### Why prefer virtual DOM to `innerHTML`?
- Better integration with modern JavaScript frameworks like [Vue](https://vuejs.org) and [React](https://reactjs.org).
- Better performance for real-time preview of large Markdown document. Thanks to the diff algorithm of virtual DOM, the real DOM modification can be minimized.

### Why markdown⁠-⁠it⁠-⁠v
- markdown⁠-⁠it itself has great performance.
- markdown⁠-⁠it⁠-⁠v is a markdown⁠-⁠it plugin and can be integrated seamlessly.
- markdown⁠-⁠it⁠-⁠v supports four schemes of output:

  - Vue virtual DOM
  - React virtual DOM
  - Browser’s real DOM
  - HTML string

## Installation
```console
$ npm install markdown-it markdown-it-v --save
```

## Usage

### Setup
markdown⁠-⁠it⁠-⁠v is a plugin of markdown⁠-⁠it:
```javascript
import MarkdownIt from 'markdown-it'
import MarkdownItVPlugin from 'markdown-it-v'

const md = MarkdownIt().use(MarkdownItVPlugin)
```

If you're using TypeScript, you can convert the enhanced markdown⁠-⁠it instance to the modified interface:
```typescript
import MarkdownIt from 'markdown-it'
import MarkdownItVPlugin from 'markdown-it-v'
import type { MarkdownItV } from 'markdown-it-v'

const md = MarkdownIt().use(MarkdownItVPlugin) as unknown as MarkdownItV
```

### Render
After setup, the `render()` method will return a `StreamDom` object — a kind of virtual DOM implemented by markdown⁠-⁠it⁠-⁠v itself:
```javascript
let sdom = md.render('The *quick* brown fox _jumps_ over the **lazy** dog.')
```

### Convert
Unfortunately you cannot use `StreamDom` in other places and it doesn’t implement a diff algorithm. You must convert it to final output:
```javascript
let vueVDom   = sdom.toVue(Vue.h)
let reactVDom = sdom.toReact(React.createElement)
let realDom   = sdom.toNative(document)    // not `document.createElement`!
let htmlStr   = sdom.toHTML()
```

### Integrate with JS Frameworks
Vue component (e.g. without JSX):
```javascript
Vue.defineComponent({
    // in a Vue component
    render() {
        const { h } = Vue
        return h('div', null, sdom.toVue(h))
    }
})
```

React component (e.g. with JSX):
```jsx
class Markdown extends React.Component {
    // in a React component
    render() {
        const h = React.createElement
        return <div>{sdom.toReact(h)}</div>
    }
}

function Markdown(props) {
    // or in a React functional compoment
    const h = React.createElement
    return <div>{sdom.toReact(h)}</div>
}
```

## Changelog

- 2.0.0
  - Major refactor
  - Migrate to TypeScript
  - Upgrade all packages

- 1.2.0
  - Drop css-tree

- 1.1.1
  - Add ES6 module output

- 1.1.0
  - Adds highlightNoWrappingEls (#1) by @laosb

- 1.0.0-beta.1
  - No change

- 1.0.0-alpha.2
  - Use `_.fromPairs` in lodash

- 1.0.0-alpha.1
  - Initial release

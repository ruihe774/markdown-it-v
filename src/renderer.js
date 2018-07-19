import { default as StreamDom, voidTag } from './stream-dom'
import OriginalRenderer from 'markdown-it/lib/renderer'
import { unescapeAll } from 'markdown-it/lib/common/utils'

const default_rules = {
  text(tokens, idx, options, env, slf) {
    slf.sDom.appendText(tokens[idx].content)
    return slf.sDom
  },
  code_inline(tokens, idx, options, env, slf) {
    const token = tokens[idx]
    slf.sDom.openTag('code', slf.renderAttrs(token))
    slf.sDom.appendText(token.content)
    slf.sDom.closeTag()
    return slf.sDom
  },
  code_block(tokens, idx, options, env, slf) {
    const token = tokens[idx]
    slf.sDom.openTag('pre', slf.renderAttrs(token))
    slf.sDom.openTag('code')
    slf.sDom.appendText(token.content)
    slf.sDom.closeTag()
    slf.sDom.closeTag()
    slf.sDom.appendText('\n')
    return slf.sDom
  },
  fence(tokens, idx, options, env, slf) {
    const token = tokens[idx]
    const info = token.info ? unescapeAll(token.info).trim() : ''
    const langName = info ? info.split(/\s+/g)[0] : ''
    const attrs = slf.renderAttrs(token)
    function addClass(classString, className) {
      if (classString == null || classString === '') {
        return className
      } else {
        return `${classString} ${className}`
      }
    }
    if (info) {
      attrs['class'] = addClass(attrs['class'], options.langPrefix + langName)
    }
    slf.sDom.openTag('pre')
    slf.sDom.openTag('code', attrs)
    const highlighted = options.highlight?.(token.content, langName, slf)
    if (highlighted === slf.sDom) {
      // Processed
    } else if (typeof highlighted === 'string') {
      slf.sDom.closeTag()
      slf.sDom.currentNode.children.pop()
      slf.sDom.openTag('code', { ...attrs, __html: highlighted })
    } else {
      slf.sDom.appendText(token.content)
    }
    slf.sDom.closeTag()
    slf.sDom.closeTag()
    slf.sDom.appendText('\n')
    return slf.sDom
  },
  hardbreak(tokens, idx, options, env, slf) {
    slf.sDom.openTag('br')
    slf.sDom.closeTag()
    slf.sDom.appendText('\n')
  },
  softbreak(tokens, idx, options, env, slf) {
    if (options.breaks) {
      this.hardbreak(tokens, idx, options, env, slf)
    } else {
      slf.sDom.appendText('\n')
    }
  },
  html_block(tokens, idx, options, env, slf) {
    slf.sDom.openTag(voidTag, { __html: tokens[idx].content })
    slf.sDom.closeTag()
  },
  html_inline(tokens, idx, options, env, slf) {
    slf.sDom.openTag(voidTag, { __html: tokens[idx].content })
    slf.sDom.closeTag()
  },
}

export default class Renderer extends OriginalRenderer {
  constructor() {
    super()
    Object.assign(this.rules, default_rules)
    this.clear()
  }
  clear() {
    this.sDom = new StreamDom()
  }
  renderAttrs({ attrs }) {
    const result = {}
    attrs?.forEach(([key, value]) => void (result[key] = value))
    return result
  }
  render(tokens, options, env) {
    tokens.forEach(({ type, children }, i) => {
      if (type === 'inline') {
        this.renderInline(children, options, env)
      } else if (typeof this.rules[type] !== 'undefined') {
        this.rules[type](tokens, i, options, env, this)
      } else {
        this.renderToken(tokens, i, options, env)
      }
    })
    return this.sDom
  }
  renderInline(tokens, options, env) {
    tokens.forEach(({ type }, i) => {
      if (typeof this.rules[type] !== 'undefined') {
        this.rules[type](tokens, i, options, env, this)
      } else {
        this.renderToken(tokens, i, options)
      }
    })
    return this.sDom
  }
  renderToken(tokens, idx, options) {
    const token = tokens[idx]
    const { tag: tagName, nesting, hidden, block } = token
    if (!hidden) {
      if (block && nesting !== -1 && idx && tokens[idx - 1].hidden) {
        this.sDom.appendText('\n')
      }
      if (nesting < 0) {
        this.sDom.closeTag()
      } else {
        const attrs = this.renderAttrs(token)
        this.sDom.openTag(tagName, attrs)
        if (nesting === 0) {
          this.sDom.closeTag()
        }
      }
      let needLf = false
      if (block) {
        needLf = true
        if (nesting === 1) {
          if (idx + 1 < tokens.length) {
            const nextToken = tokens[idx + 1]
            if (nextToken.type === 'inline' || nextToken.hidden) {
              needLf = false
            } else if (
              nextToken.nesting === -1 &&
              nextToken.tag === token.tag
            ) {
              needLf = false
            }
          }
        }
      }
      if (needLf) {
        this.sDom.appendText('\n')
      }
    }
    return this.sDom
  }
}

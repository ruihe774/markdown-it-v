import StreamDom from './stream-dom'
import type MarkdownIt from 'markdown-it'
import type { Dictionary } from './utils'

type RenderRule = (
  tokens: MarkdownIt.Token[],
  idx: number,
  options: MarkdownIt.Options,
  env: any,
  self: Renderer,
) => StreamDom
interface RenderRuleRecord {
  code_inline: RenderRule
  code_block: RenderRule
  fence: RenderRule
  hardbreak: RenderRule
  softbreak: RenderRule
  text: RenderRule
  html_block: RenderRule
  html_inline: RenderRule
}

const default_rules: RenderRuleRecord = {
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
    const [langName, _, ...langAttrs] = token.info
      ? slf.utils.unescapeAll(token.info).trim().split(/\s+/g)
      : ['']
    const attrs = slf.renderAttrs(token)
    if (langName) {
      const classString = attrs['class']
      const className = options.langPrefix + langName
      attrs['class'] = classString ? `${classString} ${className}` : className
    }
    slf.sDom.openTag('pre')
    slf.sDom.openTag('code', attrs)
    let hasWrapper = true
    let highlighted = options.highlight?.(
      token.content,
      langName,
      langAttrs.join(''),
    ) as string | undefined | StreamDom
    if (highlighted === slf.sDom) {
      // Processed
    } else if (typeof highlighted == 'string') {
      if (highlighted.startsWith('<pre>') && highlighted.endsWith('</pre>')) {
        hasWrapper = false
        highlighted = highlighted.slice(5, -6)
      }
      slf.sDom.closeTag()
      if (!hasWrapper) slf.sDom.closeTag()
      slf.sDom.currentNode.children.pop()
      slf.sDom.openTag(hasWrapper ? 'code' : 'pre', {
        ...attrs,
        __html: highlighted,
      })
    } else {
      slf.sDom.appendText(token.content)
    }
    slf.sDom.closeTag()
    if (hasWrapper) slf.sDom.closeTag()
    slf.sDom.appendText('\n')
    return slf.sDom
  },

  hardbreak(tokens, idx, options, env, slf) {
    slf.sDom.openTag('br')
    slf.sDom.closeTag()
    slf.sDom.appendText('\n')
    return slf.sDom
  },

  softbreak(tokens, idx, options, env, slf) {
    if (options.breaks) {
      this.hardbreak(tokens, idx, options, env, slf)
    } else {
      slf.sDom.appendText('\n')
    }
    return slf.sDom
  },

  html_block(tokens, idx, options, env, slf) {
    slf.sDom.openTag(null, { __html: tokens[idx].content })
    slf.sDom.closeTag()
    return slf.sDom
  },

  html_inline(tokens, idx, options, env, slf) {
    slf.sDom.openTag(null, { __html: tokens[idx].content })
    slf.sDom.closeTag()
    return slf.sDom
  },
}

type BaseRenderer = MarkdownIt.Renderer
// @ts-ignore
export declare interface Renderer extends BaseRenderer {
  utils: MarkdownIt.Utils
  sDom: StreamDom
  clear(): void
  renderAttrs({ attrs }: MarkdownIt.Token): Dictionary<string>
  render(
    tokens: MarkdownIt.Token[],
    options: MarkdownIt.Options,
    env: any,
  ): StreamDom
  renderInline(
    tokens: MarkdownIt.Token[],
    options: MarkdownIt.Options,
    env: any,
  ): StreamDom
  renderToken(
    tokens: MarkdownIt.Token[],
    idx: number,
    options: MarkdownIt.Options,
  ): StreamDom
}

export default (md: MarkdownIt): Renderer => {
  const Base = Object.getPrototypeOf(md.renderer)
    .constructor as new () => BaseRenderer

  class Renderer extends Base {
    sDom: StreamDom

    constructor(public utils: MarkdownIt.Utils) {
      super()
      Object.assign(this.rules, default_rules)
      this.sDom = new StreamDom(this.utils)
    }

    clear(): void {
      this.sDom = new StreamDom(this.utils)
    }

    // @ts-ignore
    renderAttrs({ attrs }: MarkdownIt.Token): Dictionary<string> {
      return Object.fromEntries(attrs ?? [])
    }

    // @ts-ignore
    render(
      tokens: MarkdownIt.Token[],
      options: MarkdownIt.Options,
      env: any,
    ): StreamDom {
      tokens.forEach(({ type, children }, i) => {
        if (type == 'inline') {
          this.renderInline(children!, options, env)
        } else if (this.rules[type] != null) {
          this.rules[type](
            tokens,
            i,
            options,
            env,
            this as unknown as BaseRenderer,
          )
        } else {
          this.renderToken(tokens, i, options)
        }
      })
      return this.sDom
    }

    // @ts-ignore
    renderInline(
      tokens: MarkdownIt.Token[],
      options: MarkdownIt.Options,
      env: any,
    ): StreamDom {
      tokens.forEach(({ type }, i) => {
        if (this.rules[type] != null) {
          this.rules[type](
            tokens,
            i,
            options,
            env,
            this as unknown as BaseRenderer,
          )
        } else {
          this.renderToken(tokens, i, options)
        }
      })
      return this.sDom
    }

    // @ts-ignore
    renderToken(
      tokens: MarkdownIt.Token[],
      idx: number,
      options: MarkdownIt.Options,
    ): StreamDom {
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
          if (nesting == 0) {
            this.sDom.closeTag()
          }
        }
        let needLf = false
        if (block) {
          needLf = true
          if (nesting == 1) {
            if (idx + 1 < tokens.length) {
              const nextToken = tokens[idx + 1]
              if (nextToken.type == 'inline' || nextToken.hidden) {
                needLf = false
              } else if (
                nextToken.nesting == -1 &&
                nextToken.tag == token.tag
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

  return new Renderer(md.utils)
}

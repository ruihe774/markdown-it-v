'use strict'

var path = require('path')

var generate = require('markdown-it-testgen')

describe('markdown-it', function() {
  var md = require('markdown-it')({
    html: true,
    langPrefix: '',
    typographer: true,
    linkify: true,

    highlight(source, lang, slf) {
      slf.sDom.openTag('highlight-component', { source })
    },
    highlightNoWrappingEls: true,
  })

  require('./inject')(md)

  generate(path.join(__dirname, 'fixtures/options'), md)
})

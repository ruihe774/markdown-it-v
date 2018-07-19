'use strict'

const v = require('../')
module.exports = md => {
    md.use(v)
    const render = md.render
    const renderInline = md.renderInline
    md.render = function (...args) {
        return render.apply(this, args).toHTML()
    }
    md.renderInline = function (...args) {
        return renderInline.apply(this, args).toHTML()
    }
}

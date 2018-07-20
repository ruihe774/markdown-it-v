const SDomRenderer = require('./render-sdom')
const load = require('markdown-it-testgen').load
const p = require('path')
const chai = require("chai")
chai.should()

describe('test rendering in browser', function() {
    const sdr = new SDomRenderer
    before(function() {
        return sdr.open()
    })
    after(function() {
        return sdr.close()
    })
    function testgen(path, options = {}, normalize = x => x, mditOption) {
        load(path, options, function(data) {
            data.meta = data.meta || {}
            var desc = data.meta.desc || p.relative(path, data.file);
            (data.meta.skip ? describe.skip : describe)(desc, function () {
                data.fixtures.forEach(function (fixture) {
                    it(fixture.header && options.header ? fixture.header : 'line ' + (fixture.first.range[0] - 1), function() {
                        const excepted = normalize(fixture.second.text)
                        const p1 = sdr.render(mditOption, fixture.first.text)
                        const p2 = sdr.renderHTML(excepted)
                        return Promise.all([p1, p2]).then(function([actual, excepted]) {
                            actual.react = actual.react.replace(/text-align: (\w+);/g, 'text-align:$1')
                            actual.should.deep.equal({
                                native: excepted,
                                vue: excepted,
                                react: excepted
                            })
                        }).catch(err => {
                            if (err.message.split('\n')[0] !== 'Evaluation failed: Error: `void` tag cannot contain innerHTML') {
                                throw err
                            } else {
                                console.debug('`void` tag contains innerHTML. Skipped.')
                            }
                        })
                    })
                })
            })
        })
    }
    testgen(p.join(__dirname, 'fixtures/commonmark/good.txt'), {}, text => text.replace(/<blockquote>\n<\/blockquote>/g, '<blockquote></blockquote>'), 'commonmark')
    testgen(p.join(__dirname, 'fixtures/markdown-it'), {}, x => x, {
        html: true,
        langPrefix: '',
        typographer: true,
        linkify: true
    })
})

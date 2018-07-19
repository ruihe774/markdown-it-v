'use strict';


var path = require('path');


var generate = require('markdown-it-testgen');


describe('markdown-it', function () {
  var md = require('markdown-it')({
    html: true,
    langPrefix: '',
    typographer: true,
    linkify: true
  });

  require('./inject')(md)

  generate(path.join(__dirname, 'fixtures/markdown-it'), md);
});

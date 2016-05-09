# nodemailer-attachments-parser

[![Build Status](https://travis-ci.org/killmenot/nodemailer-attachments-parser.svg?branch=master)](https://travis-ci.org/killmenot/nodemailer-attachments-parser)
[![Dependency Status](https://gemnasium.com/badges/github.com/killmenot/nodemailer-attachments-parser.svg)](https://gemnasium.com/github.com/killmenot/nodemailer-attachments-parser)
[![npm version](https://badge.fury.io/js/nodemailer-attachments-parser.svg)](https://badge.fury.io/js/nodemailer-attachments-parser)

Process and parse nodemailer's attachments.

Based on [Andris Reinman](https://github.com/andris9)'s work in [mailcomposer](https://github.com/nodemailer/mailcomposer).


## Install

```
npm install nodemailer-attachments-parser
```

## Example

```javascript
'use strict';

var parser = require('nodemailer-attachments-parser');
var attachments;
var mail = {
  attachments = [
    {
      filename: 'text1.txt',
      content: 'hello world!'
    },
    {
      path: '/path/to/file.txt'
    }
  ]
};

// with default options
attachments = parser(mail.attachments);
// { attached: {Array}, related: {Array} }

// using options
var options = {
  findRelated: true
};
attachments = parser(mail.attachments, options);

```

## Options
  * **findRelated** - If true separate related attachments from attached ones. Default: `false`


## Attachments format

It's default nodemailer's format. You can find it here https://github.com/nodemailer/nodemailer#attachments


## Licence

The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

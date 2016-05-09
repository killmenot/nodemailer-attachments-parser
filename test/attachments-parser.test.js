/* globals context, beforeEach, describe, it */
/* jshint expr:true */

'use strict';

var expect = require('chai').expect;
var attachmentsParser = require('../');
var AttachmentsParser = attachmentsParser.AttachmentsParser;
var path = require('path');
var filename = path.join(__dirname, 'fixtures', 'test.txt');

describe('module', function () {
  var parser;
  var attachments;
  var attachment;

  describe('exports', function () {
    it('attachmentsParser should be a function', function () {
      expect(attachmentsParser).to.be.a('function');
    });

    it('AttachmentsParser should be a function', function () {
      expect(AttachmentsParser).to.be.a('function');
    });
  });

  describe('parse()', function () {
    beforeEach(function () {
      parser = new AttachmentsParser();
    });

    it('should be a function', function () {
      expect(parser.parse).to.be.a('function');
    });

    it('should be empty', function () {
      attachments = parser.parse([]);
      expect(attachments.attached).to.eql([]);
      expect(attachments.related).to.eql([]);
    });

    it('filename and content type is derived from path', function () {
      attachments = [{
        path: filename
      }];

      attachment = parser.parse(attachments).attached[0];

      expect(attachment.contentType).to.eql('text/plain');
      expect(attachment.contentDisposition).to.eql('attachment');
      expect(attachment.filename).to.be.equal('test.txt');
      expect(attachment.content.path).to.be.equal(filename);
    });

    it('file on disk as an attachment', function () {
      attachments = [{
        filename: 'note.txt',
        path: filename
      }];

      attachment = parser.parse(attachments).attached[0];

      expect(attachment.contentType).to.eql('text/plain');
      expect(attachment.contentDisposition).to.eql('attachment');
      expect(attachment.filename).to.be.equal('note.txt');
      expect(attachment.content.path).to.be.equal(filename);
    });

    it('use URL as an attachment', function () {
      var url = 'https://raw.github.com/killmenot/nodemailer-attachments-parser/master/LICENSE';

      attachments = [{
        filename: 'license.txt',
        href: url
      }];

      attachment = parser.parse(attachments).attached[0];

      expect(attachment.contentType).to.eql('text/plain');
      expect(attachment.contentDisposition).to.eql('attachment');
      expect(attachment.filename).to.be.equal('license.txt');
      expect(attachment.content.href).to.be.equal(url);
    });

    it('data uri as an attachment', function () {
      attachments = [{
        path: 'data:text/plain;base64,aGVsbG8gd29ybGQ='
      }];

      attachment = parser.parse(attachments).attached[0];

      expect(attachment.contentType).to.eql('text/plain');
      expect(attachment.contentDisposition).to.eql('attachment');
      expect(attachment.filename).to.be.equal('attachment-1.txt');
      expect(attachment.content.toString()).to.be.equal('hello world');
    });

    it('utf-8 string as an attachment', function () {
      attachments = [{
        filename: 'text1.txt',
        content: 'hello world!'
      }];

      attachment = parser.parse(attachments).attached[0];

      expect(attachment.contentType).to.eql('text/plain');
      expect(attachment.contentDisposition).to.eql('attachment');
      expect(attachment.filename).to.be.equal('text1.txt');
      expect(attachment.content.toString()).to.be.equal('hello world!');
    });

    it('binary buffer as an attachment', function () {
      attachments = [{
        filename: 'text2.txt',
        content: new Buffer('hello world!!', 'utf-8')
      }];

      attachment = parser.parse(attachments).attached[0];

      expect(attachment.contentType).to.eql('text/plain');
      expect(attachment.contentDisposition).to.eql('attachment');
      expect(attachment.filename).to.be.equal('text2.txt');
      expect(attachment.content.toString()).to.be.equal('hello world!!');
    });

    it('stream as an attachment', function () {
      attachments = [{
        filename: 'text2.txt',
        content: new Buffer('hello new world', 'utf-8')
      }];

      attachment = parser.parse(attachments).attached[0];

      expect(attachment.contentType).to.eql('text/plain');
      expect(attachment.contentDisposition).to.eql('attachment');
      expect(attachment.filename).to.be.equal('text2.txt');
      expect(attachment.content.toString()).to.be.equal('hello new world');
    });

    it('define custom content type for the attachment', function () {
      attachments = [{
        filename: 'text.bin',
        content: 'hello world!',
        contentType: 'text/plain'
      }];

      attachment = parser.parse(attachments).attached[0];

      expect(attachment.contentType).to.eql('text/plain');
      expect(attachment.contentDisposition).to.eql('attachment');
      expect(attachment.filename).to.be.equal('text.bin');
      expect(attachment.content.toString()).to.be.equal('hello world!');
    });

    it('encoded string as an attachment', function () {
      attachments = [{
        filename: 'text1.txt',
        content: 'aGVsbG8gd29ybGQh=',
        encoding: 'base64'
      }];

      attachment = parser.parse(attachments).attached[0];

      expect(attachment.contentType).to.eql('text/plain');
      expect(attachment.contentDisposition).to.eql('attachment');
      expect(attachment.filename).to.be.equal('text1.txt');
      expect(attachment.content.toString()).to.be.equal('aGVsbG8gd29ybGQh=');
      expect(attachment.encoding).to.be.equal('base64');
    });

    it('define custom content transfer encoding', function () {
      attachments = [{
        content: 'hello world',
        contentTransferEncoding: '7bit'
      }];

      attachment = parser.parse(attachments).attached[0];
      expect(attachment.contentTransferEncoding).to.be.equal('7bit');
    });

    it('define message content type', function () {
      attachments = [{
        contentType: 'message/partial'
      }];

      attachment = parser.parse(attachments).attached[0];
      expect(attachment.contentDisposition).to.eql('inline');
    });

    it('define content id', function () {
      attachments = [{
        cid: 'some-id'
      }];

      attachment = parser.parse(attachments).attached[0];
      expect(attachment.cid).to.eql('some-id');
    });

    it('define raw content', function () {
      attachments = [{
        raw: 'content'
      }];

      attachment = parser.parse(attachments).attached[0];
      expect(attachment.raw).to.eql('content');
    });

    it('define headers', function () {
      attachments = [{
        headers: [{
          key: 'X-Key-Name',
          value: 'val1'
        }]
      }];

      attachment = parser.parse(attachments).attached[0];
      expect(attachment.headers).to.eql([{
        key: 'X-Key-Name',
        value: 'val1'
      }]);
    });

    context('When options.findRelated enabled', function () {
      beforeEach(function () {
        parser = new AttachmentsParser({
          findRelated: true
        });
      });

      it('define content id', function () {
        attachments = [{
          cid: 'some-id'
        }];

        attachments = parser.parse(attachments);
        attachment = attachments.related[0];

        expect(attachments.attached).to.eql([]);
        expect(attachments.related).to.eql([attachment]);
        expect(attachment.cid).to.eql('some-id');

      });
    });
  });

  describe('_processDataUrl()', function () {
    beforeEach(function () {
      parser = new AttachmentsParser();
    });

    it('should be a function', function () {
      expect(parser._processDataUrl).to.be.a('function');
    });

    it('should do nothing when string is invalid data url', function () {
      var element = {
        href: 'data:text'
      };

      parser._processDataUrl(element);
      expect(element).to.equal(element);
    });

    it('should process non base64 data', function () {
      var data = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#00B1FF" width="100" height="100"/></svg>';
      var element = {
        path: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data)
      };

      parser._processDataUrl(element);
      expect(element.content.toString('utf-8')).to.equal(data);
      expect(element.contentType).to.equal('image/svg+xml');
      expect(element.path).to.be.false;
    });

    it('should process base64 data', function () {
      var element = {
        href: 'data:text/plain;base64,SGVsbG8gd29ybGQ='
      };

      parser._processDataUrl(element);
      expect(element.content.toString('ascii')).to.equal('Hello world');
      expect(element.contentType).to.equal('text/plain');
      expect(element.href).to.be.false;
    });
  });
});

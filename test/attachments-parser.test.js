'use strict';

const path = require('path');
const expect = require('chai').expect;
const bufferFrom = require('buffer-from');
const attachmentsParser = require('../');
const AttachmentsParser = attachmentsParser.AttachmentsParser;
const filename = path.join(__dirname, 'fixtures', 'test.txt');

describe('module', () => {
  let parser;
  let attachments;
  let attachment;

  describe('exports', () => {
    it('attachmentsParser should return empty result', () => {
      const actual = attachmentsParser();

      console.log(actual);
    });

    it('attachmentsParser should return parsed result', () => {
      const expected = {
        attached: [],
        related: []
      };

      const actual = attachmentsParser(attachments);

      expect(actual).eql(expected);
    });

    it('AttachmentsParser should be a function', () => {
      expect(attachmentsParser.AttachmentsParser).be.a('function');
    });
  });

  describe('parse()', () => {
    beforeEach(() => {
      parser = new AttachmentsParser();
    });

    it('should be empty', () => {
      attachments = parser.parse([]);

      expect(attachments.attached).eql([]);
      expect(attachments.related).eql([]);
    });

    it('filename and content type is derived from path', () => {
      attachments = [{
        path: filename
      }];

      attachment = parser.parse(attachments).attached[0];

      expect(attachment.contentType).eql('text/plain');
      expect(attachment.contentDisposition).eql('attachment');
      expect(attachment.filename).be.equal('test.txt');
      expect(attachment.content.path).be.equal(filename);
    });

    it('file on disk as an attachment', () => {
      attachments = [{
        filename: 'note.txt',
        path: filename
      }];

      attachment = parser.parse(attachments).attached[0];

      expect(attachment.contentType).eql('text/plain');
      expect(attachment.contentDisposition).eql('attachment');
      expect(attachment.filename).be.equal('note.txt');
      expect(attachment.content.path).be.equal(filename);
    });

    it('use URL as an attachment (as href)', () => {
      const url = 'https://raw.github.com/killmenot/nodemailer-attachments-parser/master/LICENSE';

      attachments = [{
        filename: 'license.txt',
        href: url
      }];

      attachment = parser.parse(attachments).attached[0];

      expect(attachment.contentType).eql('text/plain');
      expect(attachment.contentDisposition).eql('attachment');
      expect(attachment.filename).be.equal('license.txt');
      expect(attachment.content.href).be.equal(url);
    });

    it('use URL as an attachment (as path)', () => {
      const url = 'https://raw.github.com/killmenot/nodemailer-attachments-parser/master/LICENSE';

      attachments = [{
        filename: 'license.txt',
        path: url
      }];

      attachment = parser.parse(attachments).attached[0];

      expect(attachment.contentType).eql('text/plain');
      expect(attachment.contentDisposition).eql('attachment');
      expect(attachment.filename).be.equal('license.txt');
      expect(attachment.content.href).be.equal(url);
    });

    it('data uri as an attachment', () => {
      attachments = [{
        path: 'data:text/plain;base64,aGVsbG8gd29ybGQ='
      }];

      attachment = parser.parse(attachments).attached[0];

      expect(attachment.contentType).eql('text/plain');
      expect(attachment.contentDisposition).eql('attachment');
      expect(attachment.filename).be.equal('attachment-1.txt');
      expect(attachment.content.toString()).be.equal('hello world');
    });

    it('utf-8 string as an attachment', () => {
      attachments = [{
        filename: 'text1.txt',
        content: 'hello world!'
      }];

      attachment = parser.parse(attachments).attached[0];

      expect(attachment.contentType).eql('text/plain');
      expect(attachment.contentDisposition).eql('attachment');
      expect(attachment.filename).be.equal('text1.txt');
      expect(attachment.content.toString()).be.equal('hello world!');
    });

    it('binary buffer as an attachment', () => {
      attachments = [{
        filename: 'text2.txt',
        content: bufferFrom('hello world!!', 'utf-8')
      }];

      attachment = parser.parse(attachments).attached[0];

      expect(attachment.contentType).eql('text/plain');
      expect(attachment.contentDisposition).eql('attachment');
      expect(attachment.filename).be.equal('text2.txt');
      expect(attachment.content.toString()).be.equal('hello world!!');
    });

    it('stream as an attachment', () => {
      attachments = [{
        filename: 'text2.txt',
        content: bufferFrom('hello new world', 'utf-8')
      }];

      attachment = parser.parse(attachments).attached[0];

      expect(attachment.contentType).eql('text/plain');
      expect(attachment.contentDisposition).eql('attachment');
      expect(attachment.filename).be.equal('text2.txt');
      expect(attachment.content.toString()).be.equal('hello new world');
    });

    it('define custom content type for the attachment', () => {
      attachments = [{
        filename: 'text.bin',
        content: 'hello world!',
        contentType: 'text/plain'
      }];

      attachment = parser.parse(attachments).attached[0];

      expect(attachment.contentType).eql('text/plain');
      expect(attachment.contentDisposition).eql('attachment');
      expect(attachment.filename).be.equal('text.bin');
      expect(attachment.content.toString()).be.equal('hello world!');
    });

    it('encoded string as an attachment', () => {
      attachments = [{
        filename: 'text1.txt',
        content: 'aGVsbG8gd29ybGQh=',
        encoding: 'base64'
      }];

      attachment = parser.parse(attachments).attached[0];

      expect(attachment.contentType).eql('text/plain');
      expect(attachment.contentDisposition).eql('attachment');
      expect(attachment.filename).be.equal('text1.txt');
      expect(attachment.content.toString()).be.equal('aGVsbG8gd29ybGQh=');
      expect(attachment.encoding).be.equal('base64');
    });

    it('define custom content transfer encoding', () => {
      attachments = [{
        content: 'hello world',
        contentTransferEncoding: '7bit'
      }];

      attachment = parser.parse(attachments).attached[0];
      expect(attachment.contentTransferEncoding).be.equal('7bit');
    });

    it('define message content type', () => {
      attachments = [{
        contentType: 'message/partial'
      }];

      attachment = parser.parse(attachments).attached[0];
      expect(attachment.contentDisposition).eql('inline');
    });

    it('define content id', () => {
      attachments = [{
        cid: 'some-id'
      }];

      attachment = parser.parse(attachments).attached[0];
      expect(attachment.cid).eql('some-id');
    });

    it('define raw content', () => {
      attachments = [{
        raw: 'content'
      }];

      attachment = parser.parse(attachments).attached[0];
      expect(attachment.raw).eql('content');
    });

    it('define headers', () => {
      attachments = [{
        headers: [{
          key: 'X-Key-Name',
          value: 'val1'
        }]
      }];

      attachment = parser.parse(attachments).attached[0];
      expect(attachment.headers).eql([{
        key: 'X-Key-Name',
        value: 'val1'
      }]);
    });

    context('When options.findRelated enabled', () => {
      beforeEach(() => {
        parser = new AttachmentsParser({
          findRelated: true
        });
      });

      it('define content id', () => {
        attachments = [{
          cid: 'some-id'
        }];

        attachments = parser.parse(attachments);
        attachment = attachments.related[0];

        expect(attachments.attached).eql([]);
        expect(attachments.related).eql([attachment]);
        expect(attachment.cid).eql('some-id');

      });
    });
  });

  describe('_processDataUrl()', () => {
    beforeEach(() => {
      parser = new AttachmentsParser();
    });

    it('should do nothing', () => {
      const element = {};

      parser._processDataUrl(element);
      expect(element).equal(element);
    });

    it('should do nothing when string is invalid data url', () => {
      const element = {
        href: 'data:text'
      };

      parser._processDataUrl(element);
      expect(element).equal(element);
    });

    it('should process non base64 data', () => {
      const data = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#00B1FF" width="100" height="100"/></svg>';
      const element = {
        path: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data)
      };

      parser._processDataUrl(element);

      expect(element.content.toString('utf-8')).equal(data);
      expect(element.contentType).equal('image/svg+xml');
      expect(element.path).equal(false);
    });

    it('should process base64 data', () => {
      const element = {
        href: 'data:text/plain;base64,SGVsbG8gd29ybGQ='
      };

      parser._processDataUrl(element);

      expect(element.content.toString('ascii')).equal('Hello world');
      expect(element.contentType).equal('text/plain');
      expect(element.href).equal(false);
    });
  });
});

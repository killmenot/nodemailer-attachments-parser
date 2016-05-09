'use strict';

var parseDataUrl = require('parse-data-url');
var libmime = require('libmime');

function AttachmentsParser(options) {
  options = options || {};

  /**
   * @param If true separate related attachments from attached ones
   * @type {Boolean}
   */
  this.findRelated = options.findRelated || false;
}

/**
 * List parsed attachments. Resulting attachment objects can be used as input for different modules
 *
 * @returns {Object} An object of arrays (`related` and `attached`)
 */
AttachmentsParser.prototype.parse = function (attachments) {
  var _attachments = [].concat(attachments || []).map(function (attachment, i) {
    var data;
    var isMessageNode = /^message\//i.test(attachment.contentType);

    if (/^data:/i.test(attachment.path || attachment.href)) {
      attachment = this._processDataUrl(attachment);
    }

    data = {
      contentType: attachment.contentType ||
        libmime.detectMimeType(attachment.filename || attachment.path || attachment.href || 'bin'),
      contentDisposition: attachment.contentDisposition || (isMessageNode ? 'inline' : 'attachment'),
      contentTransferEncoding: attachment.contentTransferEncoding
    };

    if (attachment.filename) {
      data.filename = attachment.filename;
    } else if (!isMessageNode && attachment.filename !== false) {
      data.filename = (attachment.path || attachment.href || '').split('/').pop() || 'attachment-' + (i + 1);
      if (data.filename.indexOf('.') < 0) {
        data.filename += '.' + libmime.detectExtension(data.contentType);
      }
    }

    if (/^https?:\/\//i.test(attachment.path)) {
      attachment.href = attachment.path;
      attachment.path = undefined;
    }

    if (attachment.cid) {
      data.cid = attachment.cid;
    }

    if (attachment.raw) {
      data.raw = attachment.raw;
    } else if (attachment.path) {
      data.content = {
        path: attachment.path
      };
    } else if (attachment.href) {
      data.content = {
        href: attachment.href
      };
    } else {
      data.content = attachment.content || '';
    }

    if (attachment.encoding) {
      data.encoding = attachment.encoding;
    }

    if (attachment.headers) {
      data.headers = attachment.headers;
    }

    return data;
  }.bind(this));

  if (!this.findRelated) {
    return {
      attached: _attachments,
      related: []
    };
  } else {
    return {
      attached: _attachments.filter(function (attachment) {
        return !attachment.cid;
      }),
      related: _attachments.filter(function (attachment) {
        return !!attachment.cid;
      })
    };
  }
};

/**
 * Parses data uri and converts it to a Buffer
 *
 * @param {Object} element Content element
 * @return {Object} Parsed element
 */
AttachmentsParser.prototype._processDataUrl = function (element) {
  var parsed = parseDataUrl(element.path || element.href || '');

  if (!parsed) {
    return element;
  }

  element.content = parsed.base64 ? new Buffer(parsed.data, 'base64') : new Buffer(decodeURIComponent(parsed.data));

  if ('path' in element) {
    element.path = false;
  }

  if ('href' in element) {
    element.href = false;
  }

  parsed.mediaType.split(';').forEach(function (item) {
    if (/^\w+\/[^\/]+$/i.test(item)) {
      element.contentType = element.contentType || item.toLowerCase();
    }
  });

  return element;
};

module.exports = function (attachments, options) {
  return new AttachmentsParser(options).parse(attachments);
};
module.exports.AttachmentsParser = AttachmentsParser;

'use strict';

var isMatched = function () {
  return Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector || function () {
    return false;
  };
}();

var stopLinkTags = ['DIV', 'FORM', 'BODY', 'HTML', 'TD', 'TR', 'LI', 'UL'];

function parentLink(node) {
  if (node.tagName == 'A') return node;else if (stopLinkTags.indexOf(node.tagName) >= 0) return;else if (node.parentNode) return parentLink(node.parentNode);
}

var dom = {
  acquireLink: function acquireLink(node) {
    var link = parentLink(node);
    if (link && isMatched.call(link, '[ujs-method], [ujs-remote]')) return link;
  },
  isDisabled: function isDisabled(node) {
    return isMatched.call(node, '[disabled]');
  },
  isRemote: function isRemote(node) {
    return node.hasAttribute('ujs-remote') && node.getAttribute('ujs-remote') != 'false';
  }
};

var csrf = {
  header: 'x-csrf-token',
  method: '_method',
  param: '_csrf_token',
  token: null
};

var csrfNode = document.head.querySelector('meta[name="csrf-token"]');
if (csrfNode) {
  csrf.token = csrfNode.getAttribute('content');
  if (csrfNode.hasAttribute('csrf-param')) csrf.param = csrfNode.getAttribute('csrf-param');
  if (csrfNode.hasAttribute('csrf-header')) csrf.header = csrfNode.getAttribute('csrf-header');
  if (csrfNode.hasAttribute('method-param')) csrf.method = csrfNode.getAttribute('method-param');
} else if (console) {
  console.log('[phoenix_ujs] `meta[name="csrf-token"]` is missing. Please add it into the page');
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





















var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

function noop() {}

function runEvent(target, name, data) {
  var event = document.createEvent('Event');
  event.initEvent(name, true, true);
  event.data = data;
  return target.dispatchEvent(event);
}

function setXHRData(xhr, data, type) {
  if (type == 'json') {
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    data = data === undefined ? {} : data;
    return JSON.stringify(data);
  } else if (type == 'text') {
    xhr.setRequestHeader('Content-type', 'text/plain');
    xhr.setRequestHeader('Accept', 'text/plain');
    return data;
  } else if ((typeof type === 'undefined' ? 'undefined' : _typeof(type)) == 'object') {
    xhr.setRequestHeader('Content-type', type[0]);
    xhr.setRequestHeader('Accept', type[1]);
    return typeof type[2] == 'function' ? type[2](data) : data;
  } else {
    return data;
  }
}

var xhr = function (url, method, options) {
  options = options || {};

  var xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader(csrf.header, csrf.token);

  var headers = options.headers || {};
  Object.keys(headers).forEach(function (k) {
    return xhr.setRequestHeader(k, headers[k]);
  });
  var target = options.target || document;

  var onBeforeSend = options.beforeSend,
      beforeSendArg = { xhr: xhr, options: options },
      onSuccess = options.success || noop,
      onError = options.error || noop,
      onComplete = options.complete || noop;

  if (onBeforeSend && onBeforeSend(beforeSendArg) === false) return xhr;
  if (!runEvent(target, 'ajax:beforeSend', beforeSendArg)) return xhr;

  xhr.addEventListener('load', function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      runEvent(target, 'ajax:success', { xhr: xhr });
      onSuccess(xhr);
    } else if (xhr.status < 200 || xhr.status >= 400) {
      runEvent(target, 'ajax:error', { xhr: xhr });
      onError(xhr);
    }

    runEvent(target, 'ajax:complete', { xhr: xhr });
    onComplete(xhr);
  });

  xhr.send(setXHRData(xhr, options.data, options.type));

  return xhr;
};

function addParam(form, name, value) {
  var input = document.createElement('input');
  input.setAttribute('type', 'hidden');
  input.setAttribute('name', name);
  input.setAttribute('value', value);
  form.appendChild(input);
}

function submit(url, method) {
  var form = document.createElement('form');
  form.method = 'POST';
  form.action = url;
  form.style.display = 'none';

  addParam(form, csrf.param, csrf.token);
  if (method != 'POST') addParam(form, csrf.method, method);

  document.body.appendChild(form);
  form.submit();
}

var handleLinkClick = function (link, e) {
  var method = (link.getAttribute('ujs-method') || 'GET').toUpperCase();

  if (dom.isRemote(link)) {
    xhr(link.href, method, { target: link });
    return true;
  } else if (method != 'GET') {
    submit(link.href, method);
    return true;
  }

  return false;
};

var QUERY_METHODS = ['GET', 'HEAD'];
var toQuery = function toQuery(data) {
  return Array.from(data).map(function (e) {
    return encodeURIComponent(e[0]) + "=" + encodeURIComponent(e[1]);
  }).join('&');
};

var handleFormSubmit = function (form) {
  if (dom.isRemote(form)) {
    var url = void 0;
    var data = new FormData(form);
    var options = { target: form };
    if (QUERY_METHODS.indexOf(form.method.toUpperCase()) === -1) {
      url = form.action;
      options.data = data;
    } else {
      url = form.action + (form.action.indexOf('?') === -1 ? '?' : '&') + toQuery(data);
    }

    xhr(url, form.method, options);
    return true;
  }
  return false;
};

var UJS = {
  confirm: function confirm(message) {
    return window.confirm(message);
  },
  csrf: csrf,
  xhr: xhr
};

var askConfirmOn = function askConfirmOn(node) {
  return node.hasAttribute('ujs-confirm') ? UJS.confirm(node.getAttribute('ujs-confirm')) : true;
};

document.addEventListener('click', function (e) {
  // Only left click allowed. Firefox triggers click event on right click/contextmenu.
  if (e.button !== 0) return;

  var link = dom.acquireLink(e.target);
  if (!link) return;
  if (dom.isDisabled(link) || !askConfirmOn(link) || handleLinkClick(link)) {
    e.preventDefault();
  }
}, false);

document.addEventListener('submit', function (e) {
  var form = e.target;

  if (dom.isDisabled(form) || !askConfirmOn(form) || handleFormSubmit(form)) {
    e.preventDefault();
  }
});

document.addEventListener('load', function ujsInit() {
  // executes only once
  document.removeEventListener('load', ujsInit, false);
  // make sure that all forms have actual up-to-date tokens (cached forms contain old ones)
  document.querySelectorAll('form input[name="' + csrf.param + '"]').forEach(function (input) {
    input.value = csrf.token;
  });
}, false);

module.exports = UJS;

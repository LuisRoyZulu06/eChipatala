var UJS = (function () {
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

return UJS;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi4uL3NyYy91anMvZG9tLmpzIiwiLi4vc3JjL3Vqcy9jc3JmLmpzIiwiLi4vc3JjL3Vqcy94aHIuanMiLCIuLi9zcmMvdWpzL2xpbmsuanMiLCIuLi9zcmMvdWpzL2Zvcm0uanMiLCIuLi9zcmMvdWpzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBpc01hdGNoZWQgPSAoZnVuY3Rpb24oKSB7XG4gIHJldHVybiBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzIHx8XG4gICAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgRWxlbWVudC5wcm90b3R5cGUubW96TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICBFbGVtZW50LnByb3RvdHlwZS5vTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgRWxlbWVudC5wcm90b3R5cGUud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgZnVuY3Rpb24oKSB7IHJldHVybiBmYWxzZSB9XG59KSgpO1xuXG5jb25zdCBzdG9wTGlua1RhZ3MgPSBbJ0RJVicsICdGT1JNJywgJ0JPRFknLCAnSFRNTCcsICdURCcsICdUUicsICdMSScsICdVTCddO1xuXG5mdW5jdGlvbiBwYXJlbnRMaW5rKG5vZGUpIHtcbiAgaWYobm9kZS50YWdOYW1lID09ICdBJykgcmV0dXJuIG5vZGU7XG4gIGVsc2UgaWYoc3RvcExpbmtUYWdzLmluZGV4T2Yobm9kZS50YWdOYW1lKSA+PSAwKSByZXR1cm47XG4gIGVsc2UgaWYobm9kZS5wYXJlbnROb2RlKSByZXR1cm4gcGFyZW50TGluayhub2RlLnBhcmVudE5vZGUpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGFjcXVpcmVMaW5rOiBmdW5jdGlvbihub2RlKSB7XG4gICAgdmFyIGxpbmsgPSBwYXJlbnRMaW5rKG5vZGUpO1xuICAgIGlmKGxpbmsgJiYgaXNNYXRjaGVkLmNhbGwobGluaywgJ1t1anMtbWV0aG9kXSwgW3Vqcy1yZW1vdGVdJykpIHJldHVybiBsaW5rO1xuICB9LFxuICBpc0Rpc2FibGVkOiBub2RlID0+IGlzTWF0Y2hlZC5jYWxsKG5vZGUsICdbZGlzYWJsZWRdJyksXG4gIGlzUmVtb3RlOiBub2RlID0+IG5vZGUuaGFzQXR0cmlidXRlKCd1anMtcmVtb3RlJykgJiYgbm9kZS5nZXRBdHRyaWJ1dGUoJ3Vqcy1yZW1vdGUnKSAhPSAnZmFsc2UnXG59O1xuIiwidmFyIGNzcmYgPSB7XG4gIGhlYWRlcjogJ3gtY3NyZi10b2tlbicsXG4gIG1ldGhvZDogJ19tZXRob2QnLFxuICBwYXJhbTogJ19jc3JmX3Rva2VuJyxcbiAgdG9rZW46IG51bGxcbn07XG5cbmxldCBjc3JmTm9kZSA9IGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvcignbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpO1xuaWYoY3NyZk5vZGUpIHtcbiAgY3NyZi50b2tlbiA9IGNzcmZOb2RlLmdldEF0dHJpYnV0ZSgnY29udGVudCcpO1xuICBpZihjc3JmTm9kZS5oYXNBdHRyaWJ1dGUoJ2NzcmYtcGFyYW0nKSkgY3NyZi5wYXJhbSA9IGNzcmZOb2RlLmdldEF0dHJpYnV0ZSgnY3NyZi1wYXJhbScpO1xuICBpZihjc3JmTm9kZS5oYXNBdHRyaWJ1dGUoJ2NzcmYtaGVhZGVyJykpIGNzcmYuaGVhZGVyID0gY3NyZk5vZGUuZ2V0QXR0cmlidXRlKCdjc3JmLWhlYWRlcicpO1xuICBpZihjc3JmTm9kZS5oYXNBdHRyaWJ1dGUoJ21ldGhvZC1wYXJhbScpKSBjc3JmLm1ldGhvZCA9IGNzcmZOb2RlLmdldEF0dHJpYnV0ZSgnbWV0aG9kLXBhcmFtJyk7XG59IGVsc2UgaWYoY29uc29sZSkge1xuICBjb25zb2xlLmxvZygnW3Bob2VuaXhfdWpzXSBgbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXWAgaXMgbWlzc2luZy4gUGxlYXNlIGFkZCBpdCBpbnRvIHRoZSBwYWdlJyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNzcmY7XG4iLCJpbXBvcnQgY3NyZiBmcm9tIFwiLi9jc3JmXCI7XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fTtcblxuZnVuY3Rpb24gcnVuRXZlbnQodGFyZ2V0LCBuYW1lLCBkYXRhKSB7XG4gIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICBldmVudC5pbml0RXZlbnQobmFtZSwgdHJ1ZSwgdHJ1ZSk7XG4gIGV2ZW50LmRhdGEgPSBkYXRhO1xuICByZXR1cm4gdGFyZ2V0LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xufVxuXG5mdW5jdGlvbiBzZXRYSFJEYXRhKHhociwgZGF0YSwgdHlwZSkge1xuICBpZih0eXBlID09ICdqc29uJykge1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgIGRhdGEgPSAoZGF0YSA9PT0gdW5kZWZpbmVkKSA/IHt9IDogZGF0YTtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG5cbiAgfSBlbHNlIGlmKHR5cGUgPT0gJ3RleHQnKSB7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICd0ZXh0L3BsYWluJyk7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsICd0ZXh0L3BsYWluJyk7XG4gICAgcmV0dXJuIGRhdGE7XG5cbiAgfSBlbHNlIGlmKHR5cGVvZiB0eXBlID09ICdvYmplY3QnKSB7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsIHR5cGVbMF0pO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2NlcHQnLCB0eXBlWzFdKTtcbiAgICByZXR1cm4gKHR5cGVvZiB0eXBlWzJdID09ICdmdW5jdGlvbicpID8gdHlwZVsyXShkYXRhKSA6IGRhdGE7XG5cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih1cmwsIG1ldGhvZCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIHhoci5vcGVuKG1ldGhvZCwgdXJsKTtcbiAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ1gtUmVxdWVzdGVkLVdpdGgnLCAnWE1MSHR0cFJlcXVlc3QnKTtcbiAgeGhyLnNldFJlcXVlc3RIZWFkZXIoY3NyZi5oZWFkZXIsIGNzcmYudG9rZW4pO1xuXG4gIGxldCBoZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzIHx8IHt9O1xuICBPYmplY3Qua2V5cyhoZWFkZXJzKS5mb3JFYWNoKGsgPT4geGhyLnNldFJlcXVlc3RIZWFkZXIoaywgaGVhZGVyc1trXSkpO1xuICB2YXIgdGFyZ2V0ID0gb3B0aW9ucy50YXJnZXQgfHwgZG9jdW1lbnQ7XG5cbiAgdmFyIG9uQmVmb3JlU2VuZCA9IG9wdGlvbnMuYmVmb3JlU2VuZCxcbiAgICBiZWZvcmVTZW5kQXJnID0geyB4aHI6IHhociwgb3B0aW9uczogb3B0aW9ucyB9LFxuICAgIG9uU3VjY2VzcyA9IG9wdGlvbnMuc3VjY2VzcyB8fCBub29wLFxuICAgIG9uRXJyb3IgPSBvcHRpb25zLmVycm9yIHx8IG5vb3AsXG4gICAgb25Db21wbGV0ZSA9IG9wdGlvbnMuY29tcGxldGUgfHwgbm9vcDtcblxuICBpZihvbkJlZm9yZVNlbmQgJiYgb25CZWZvcmVTZW5kKGJlZm9yZVNlbmRBcmcpID09PSBmYWxzZSkgcmV0dXJuIHhocjtcbiAgaWYoIXJ1bkV2ZW50KHRhcmdldCwgJ2FqYXg6YmVmb3JlU2VuZCcsIGJlZm9yZVNlbmRBcmcpKSByZXR1cm4geGhyO1xuXG4gIHhoci5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gKCkge1xuICAgIGlmKHhoci5zdGF0dXMgPj0gMjAwICYmIHhoci5zdGF0dXMgPCAzMDApIHtcbiAgICAgIHJ1bkV2ZW50KHRhcmdldCwgJ2FqYXg6c3VjY2VzcycsIHsgeGhyOiB4aHIgfSk7XG4gICAgICBvblN1Y2Nlc3MoeGhyKTtcbiAgICB9IGVsc2UgaWYoeGhyLnN0YXR1cyA8IDIwMCB8fCB4aHIuc3RhdHVzID49IDQwMCkge1xuICAgICAgcnVuRXZlbnQodGFyZ2V0LCAnYWpheDplcnJvcicsIHsgeGhyOiB4aHIgfSk7XG4gICAgICBvbkVycm9yKHhocik7XG4gICAgfVxuXG4gICAgcnVuRXZlbnQodGFyZ2V0LCAnYWpheDpjb21wbGV0ZScsIHsgeGhyOiB4aHIgfSk7XG4gICAgb25Db21wbGV0ZSh4aHIpO1xuICB9KTtcblxuICB4aHIuc2VuZChzZXRYSFJEYXRhKHhociwgb3B0aW9ucy5kYXRhLCBvcHRpb25zLnR5cGUpKTtcblxuICByZXR1cm4geGhyO1xufVxuIiwiaW1wb3J0IGNzcmYgZnJvbSBcIi4vY3NyZlwiO1xuaW1wb3J0IGRvbSBmcm9tIFwiLi9kb21cIjtcbmltcG9ydCB4aHIgZnJvbSBcIi4veGhyXCI7XG5cbmZ1bmN0aW9uIGFkZFBhcmFtKGZvcm0sIG5hbWUsIHZhbHVlKSB7XG4gIHZhciBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gIGlucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsICdoaWRkZW4nKTtcbiAgaW5wdXQuc2V0QXR0cmlidXRlKCduYW1lJywgbmFtZSk7XG4gIGlucHV0LnNldEF0dHJpYnV0ZSgndmFsdWUnLCB2YWx1ZSk7XG4gIGZvcm0uYXBwZW5kQ2hpbGQoaW5wdXQpO1xufVxuXG5mdW5jdGlvbiBzdWJtaXQodXJsLCBtZXRob2QpIHtcbiAgdmFyIGZvcm0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb3JtJyk7XG4gIGZvcm0ubWV0aG9kID0gJ1BPU1QnO1xuICBmb3JtLmFjdGlvbiA9IHVybDtcbiAgZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG4gIGFkZFBhcmFtKGZvcm0sIGNzcmYucGFyYW0sIGNzcmYudG9rZW4pO1xuICBpZihtZXRob2QgIT0gJ1BPU1QnKSBhZGRQYXJhbShmb3JtLCBjc3JmLm1ldGhvZCwgbWV0aG9kKTtcblxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGZvcm0pO1xuICBmb3JtLnN1Ym1pdCgpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihsaW5rLCBlKSB7XG4gIHZhciBtZXRob2QgPSAobGluay5nZXRBdHRyaWJ1dGUoJ3Vqcy1tZXRob2QnKSB8fCAnR0VUJykudG9VcHBlckNhc2UoKTtcblxuICBpZihkb20uaXNSZW1vdGUobGluaykpIHtcbiAgICB4aHIobGluay5ocmVmLCBtZXRob2QsIHsgdGFyZ2V0OiBsaW5rIH0pO1xuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSBpZihtZXRob2QgIT0gJ0dFVCcpIHtcbiAgICBzdWJtaXQobGluay5ocmVmLCBtZXRob2QpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuIiwiaW1wb3J0IHhociBmcm9tIFwiLi94aHJcIjtcbmltcG9ydCBkb20gZnJvbSBcIi4vZG9tXCI7XG5cbmNvbnN0IFFVRVJZX01FVEhPRFMgPSBbJ0dFVCcsICdIRUFEJ107XG5jb25zdCB0b1F1ZXJ5ID0gZGF0YSA9PiBBcnJheS5mcm9tKGRhdGEpLm1hcChlID0+IGVuY29kZVVSSUNvbXBvbmVudChlWzBdKSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KGVbMV0pKS5qb2luKCcmJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGZvcm0pIHtcbiAgaWYoZG9tLmlzUmVtb3RlKGZvcm0pKSB7XG4gICAgbGV0IHVybDtcbiAgICBsZXQgZGF0YSA9IG5ldyBGb3JtRGF0YShmb3JtKTtcbiAgICBsZXQgb3B0aW9ucyA9IHsgdGFyZ2V0OiBmb3JtIH07XG4gICAgaWYoUVVFUllfTUVUSE9EUy5pbmRleE9mKGZvcm0ubWV0aG9kLnRvVXBwZXJDYXNlKCkpID09PSAtMSkge1xuICAgICAgdXJsID0gZm9ybS5hY3Rpb247XG4gICAgICBvcHRpb25zLmRhdGEgPSBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB1cmwgPSBmb3JtLmFjdGlvbiArIChmb3JtLmFjdGlvbi5pbmRleE9mKCc/JykgPT09IC0xID8gJz8nIDogJyYnKSArIHRvUXVlcnkoZGF0YSk7XG4gICAgfVxuXG4gICAgeGhyKHVybCwgZm9ybS5tZXRob2QsIG9wdGlvbnMpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbiIsImltcG9ydCBkb20gZnJvbSBcIi4vdWpzL2RvbVwiO1xuaW1wb3J0IGhhbmRsZUxpbmtDbGljayBmcm9tIFwiLi91anMvbGlua1wiO1xuaW1wb3J0IGhhbmRsZUZvcm1TdWJtaXQgZnJvbSBcIi4vdWpzL2Zvcm1cIjtcbmltcG9ydCB4aHIgZnJvbSBcIi4vdWpzL3hoclwiO1xuaW1wb3J0IGNzcmYgZnJvbSBcIi4vdWpzL2NzcmZcIjtcblxudmFyIFVKUyA9IHtcbiAgY29uZmlybTogKG1lc3NhZ2UpID0+IHdpbmRvdy5jb25maXJtKG1lc3NhZ2UpLFxuICBjc3JmOiBjc3JmLFxuICB4aHI6IHhoclxufVxuXG5sZXQgYXNrQ29uZmlybU9uID0gKG5vZGUpID0+IG5vZGUuaGFzQXR0cmlidXRlKCd1anMtY29uZmlybScpID8gVUpTLmNvbmZpcm0obm9kZS5nZXRBdHRyaWJ1dGUoJ3Vqcy1jb25maXJtJykpIDogdHJ1ZVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgLy8gT25seSBsZWZ0IGNsaWNrIGFsbG93ZWQuIEZpcmVmb3ggdHJpZ2dlcnMgY2xpY2sgZXZlbnQgb24gcmlnaHQgY2xpY2svY29udGV4dG1lbnUuXG4gIGlmKGUuYnV0dG9uICE9PSAwKSByZXR1cm47XG5cbiAgdmFyIGxpbmsgPSBkb20uYWNxdWlyZUxpbmsoZS50YXJnZXQpO1xuICBpZighbGluaykgcmV0dXJuO1xuICBpZihkb20uaXNEaXNhYmxlZChsaW5rKSB8fCAhYXNrQ29uZmlybU9uKGxpbmspIHx8IGhhbmRsZUxpbmtDbGljayhsaW5rKSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfVxufSwgZmFsc2UpO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBmdW5jdGlvbihlKSB7XG4gIHZhciBmb3JtID0gZS50YXJnZXQ7XG5cbiAgaWYoZG9tLmlzRGlzYWJsZWQoZm9ybSkgfHwgIWFza0NvbmZpcm1Pbihmb3JtKSB8fCBoYW5kbGVGb3JtU3VibWl0KGZvcm0pKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG59KTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uIHVqc0luaXQoKSB7XG4gIC8vIGV4ZWN1dGVzIG9ubHkgb25jZVxuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgdWpzSW5pdCwgZmFsc2UpO1xuICAvLyBtYWtlIHN1cmUgdGhhdCBhbGwgZm9ybXMgaGF2ZSBhY3R1YWwgdXAtdG8tZGF0ZSB0b2tlbnMgKGNhY2hlZCBmb3JtcyBjb250YWluIG9sZCBvbmVzKVxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdmb3JtIGlucHV0W25hbWU9XCInICsgY3NyZi5wYXJhbSArICdcIl0nKS5mb3JFYWNoKGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgaW5wdXQudmFsdWUgPSBjc3JmLnRva2VuO1xuICB9KTtcbn0sIGZhbHNlKTtcblxuZXhwb3J0IGRlZmF1bHQgVUpTO1xuIl0sIm5hbWVzIjpbImlzTWF0Y2hlZCIsIkVsZW1lbnQiLCJwcm90b3R5cGUiLCJtYXRjaGVzIiwibWF0Y2hlc1NlbGVjdG9yIiwibW96TWF0Y2hlc1NlbGVjdG9yIiwibXNNYXRjaGVzU2VsZWN0b3IiLCJvTWF0Y2hlc1NlbGVjdG9yIiwid2Via2l0TWF0Y2hlc1NlbGVjdG9yIiwic3RvcExpbmtUYWdzIiwicGFyZW50TGluayIsIm5vZGUiLCJ0YWdOYW1lIiwiaW5kZXhPZiIsInBhcmVudE5vZGUiLCJsaW5rIiwiY2FsbCIsImhhc0F0dHJpYnV0ZSIsImdldEF0dHJpYnV0ZSIsImNzcmYiLCJjc3JmTm9kZSIsImRvY3VtZW50IiwiaGVhZCIsInF1ZXJ5U2VsZWN0b3IiLCJ0b2tlbiIsInBhcmFtIiwiaGVhZGVyIiwibWV0aG9kIiwiY29uc29sZSIsImxvZyIsIm5vb3AiLCJydW5FdmVudCIsInRhcmdldCIsIm5hbWUiLCJkYXRhIiwiZXZlbnQiLCJjcmVhdGVFdmVudCIsImluaXRFdmVudCIsImRpc3BhdGNoRXZlbnQiLCJzZXRYSFJEYXRhIiwieGhyIiwidHlwZSIsInNldFJlcXVlc3RIZWFkZXIiLCJ1bmRlZmluZWQiLCJKU09OIiwic3RyaW5naWZ5IiwidXJsIiwib3B0aW9ucyIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsImhlYWRlcnMiLCJrZXlzIiwiZm9yRWFjaCIsImsiLCJvbkJlZm9yZVNlbmQiLCJiZWZvcmVTZW5kIiwiYmVmb3JlU2VuZEFyZyIsIm9uU3VjY2VzcyIsInN1Y2Nlc3MiLCJvbkVycm9yIiwiZXJyb3IiLCJvbkNvbXBsZXRlIiwiY29tcGxldGUiLCJhZGRFdmVudExpc3RlbmVyIiwic3RhdHVzIiwic2VuZCIsImFkZFBhcmFtIiwiZm9ybSIsInZhbHVlIiwiaW5wdXQiLCJjcmVhdGVFbGVtZW50Iiwic2V0QXR0cmlidXRlIiwiYXBwZW5kQ2hpbGQiLCJzdWJtaXQiLCJhY3Rpb24iLCJzdHlsZSIsImRpc3BsYXkiLCJib2R5IiwiZSIsInRvVXBwZXJDYXNlIiwiZG9tIiwiaXNSZW1vdGUiLCJocmVmIiwiUVVFUllfTUVUSE9EUyIsInRvUXVlcnkiLCJBcnJheSIsImZyb20iLCJtYXAiLCJlbmNvZGVVUklDb21wb25lbnQiLCJqb2luIiwiRm9ybURhdGEiLCJVSlMiLCJtZXNzYWdlIiwid2luZG93IiwiY29uZmlybSIsImFza0NvbmZpcm1PbiIsImJ1dHRvbiIsImFjcXVpcmVMaW5rIiwiaXNEaXNhYmxlZCIsImhhbmRsZUxpbmtDbGljayIsInByZXZlbnREZWZhdWx0IiwiaGFuZGxlRm9ybVN1Ym1pdCIsInVqc0luaXQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicXVlcnlTZWxlY3RvckFsbCJdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsSUFBSUEsWUFBYSxZQUFXO1NBQ25CQyxRQUFRQyxTQUFSLENBQWtCQyxPQUFsQixJQUNMRixRQUFRQyxTQUFSLENBQWtCRSxlQURiLElBRUxILFFBQVFDLFNBQVIsQ0FBa0JHLGtCQUZiLElBR0xKLFFBQVFDLFNBQVIsQ0FBa0JJLGlCQUhiLElBSUxMLFFBQVFDLFNBQVIsQ0FBa0JLLGdCQUpiLElBS0xOLFFBQVFDLFNBQVIsQ0FBa0JNLHFCQUxiLElBTUwsWUFBVztXQUFTLEtBQVA7R0FOZjtDQURjLEVBQWhCOztBQVVBLElBQU1DLGVBQWUsQ0FBQyxLQUFELEVBQVEsTUFBUixFQUFnQixNQUFoQixFQUF3QixNQUF4QixFQUFnQyxJQUFoQyxFQUFzQyxJQUF0QyxFQUE0QyxJQUE1QyxFQUFrRCxJQUFsRCxDQUFyQjs7QUFFQSxTQUFTQyxVQUFULENBQW9CQyxJQUFwQixFQUEwQjtNQUNyQkEsS0FBS0MsT0FBTCxJQUFnQixHQUFuQixFQUF3QixPQUFPRCxJQUFQLENBQXhCLEtBQ0ssSUFBR0YsYUFBYUksT0FBYixDQUFxQkYsS0FBS0MsT0FBMUIsS0FBc0MsQ0FBekMsRUFBNEMsT0FBNUMsS0FDQSxJQUFHRCxLQUFLRyxVQUFSLEVBQW9CLE9BQU9KLFdBQVdDLEtBQUtHLFVBQWhCLENBQVA7OztBQUczQixVQUFlO2VBQ0EscUJBQVNILElBQVQsRUFBZTtRQUN0QkksT0FBT0wsV0FBV0MsSUFBWCxDQUFYO1FBQ0dJLFFBQVFmLFVBQVVnQixJQUFWLENBQWVELElBQWYsRUFBcUIsNEJBQXJCLENBQVgsRUFBK0QsT0FBT0EsSUFBUDtHQUhwRDtjQUtEO1dBQVFmLFVBQVVnQixJQUFWLENBQWVMLElBQWYsRUFBcUIsWUFBckIsQ0FBUjtHQUxDO1lBTUg7V0FBUUEsS0FBS00sWUFBTCxDQUFr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

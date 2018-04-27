/**
 * Remove an item from an array
 */
export function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}

/**
 * find an item by key-value
 */
export function findOne(arr, key, value) {
  if (arr.length) {
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      if (item[key] === value) {
        return item;
      }
    }
  }
  return undefined;
}

/**
 * Mix properties into target object.
 */
export function extend(to, _from) {
  for (const key in _from) {
    if (Object.prototype.hasOwnProperty.call(_from, key)) {
      to[key] = _from[key];
    }
  }
  return to;
}

/**
 * Merge an Array of Objects into a single Object.
 */
export function toObject(arr) {
  const res = {};
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res;
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
export function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 * Convert a value to a string that is actually rendered.
 */
export function toString(val) {
  return val == null ? '' : typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
}

/**
 * Convert a input value to a number for persistence.
 * If the conversion fails, return original string.
 */
export function toNumber(val) {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
}

/* istanbul ignore next */
function polyfillBind(fn, ctx) {
  function boundFn(a) {
    const l = arguments.length;
    return l ? (l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a)) : fn.call(ctx);
  }

  boundFn._length = fn.length;
  return boundFn;
}

function nativeBind(fn, ctx) {
  return fn.bind(ctx);
}

export const bind = Function.prototype.bind ? nativeBind : polyfillBind;

/**
 * Convert an Array-like object to a real Array.
 */
export function toArray(list, start = 0) {
  //   start = start || 0;
  let i = list.length - start;
  const ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret;
}

function polyfillAssign(target, ...args) {
  for (let i = 0, j = args.length; i < j; i++) {
    const source = args[i] || {};
    for (const prop in source) {
      if (Object.prototype.hasOwnProperty.call(source, prop)) {
        const value = source[prop];
        if (value !== undefined) {
          target[prop] = value;
        }
      }
    }
  }
  return target;
}

export const assign = Object.assign ? Object.assign : polyfillAssign;

export function render(tpl, data) {
  const code = `var p=[];with(this){p.push('${tpl
    .replace(/[\r\t\n]/g, ' ')
    .split('<%')
    .join('\t')
    .replace(/((^|%>)[^\t]*)'/g, '$1\r')
    .replace(/\t=(.*?)%>/g, "',$1,'")
    .split('\t')
    .join("');")
    .split('%>')
    .join("p.push('")
    .split('\r')
    .join("\\'")}');}return p.join('');`;
  return new Function(code).apply(data);
}

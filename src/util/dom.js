export function hasClass(el, cls) {
  if (!el || !cls) {
    return false;
  }
  if (cls.indexOf(' ') !== -1) {
    throw new Error('className should not contain space.');
  }
  if (el.classList) {
    return el.classList.contains(cls);
  }
  return ` ${el.className} `.indexOf(` ${cls} `) > -1;
}

export function addClass(el, cls) {
  if (!el) {
    return;
  }
  let curClass = el.className;
  const classes = (cls || '').split(' ');
  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i];
    if (!clsName) {
      continue;
    }

    if (el.classList) {
      el.classList.add(clsName);
    } else if (hasClass(el, clsName)) {
      curClass += ` ${clsName}`;
    }
  }
  if (!el.classList) {
    el.className = curClass;
  }
}

export function removeClass(el, cls) {
  if (!el || !cls) {
    return;
  }
  const classes = cls.split(' ');
  let curClass = ` ${el.className} `;

  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i];
    if (!clsName) {
      continue;
    }

    if (el.classList) {
      el.classList.remove(clsName);
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(` ${clsName} `, ' ');
    }
  }
  if (!el.classList) {
    el.className = String.prototype.trim.call(curClass);
  }
}

export function parseDom(htmlStr) {
  const objE = document.createElement('div');
  objE.innerHTML = htmlStr;
  return objE.childNodes[0];
}

/**
 * Query an element selector if it's not an element already.
 */
export function query(el) {
  if (typeof el === 'string') {
    const selected = document.querySelector(el);
    if (!selected) {
      return document.createElement('div');
    }
    return selected;
  } else {
    return el;
  }
}

const docStyle = document.documentElement.style;
let engine;
if (window.opera && Object.prototype.toString.call(window.opera) === '[object Opera]') {
  engine = 'presto';
} else if ('MozAppearance' in docStyle) {
  engine = 'gecko';
} else if ('WebkitAppearance' in docStyle) {
  engine = 'webkit';
} else if (typeof navigator.cpuClass === 'string') {
  engine = 'trident';
}
export const vendorPrefix = {
  trident: 'ms',
  gecko: 'Moz',
  webkit: 'Webkit',
  presto: 'O'
}[engine];
const helperElem = document.createElement('div');
let undef;
const perspectiveProperty = `${vendorPrefix}Perspective`;
const transformProperty = `${vendorPrefix}Transform`;

export const renderScroll = (function() {
  if (helperElem.style[perspectiveProperty] !== undef) {
    return function(content, left, top, zoom) {
      content.style[transformProperty] = `translate3d(${-left}px,${-top}px,0) scale(${zoom})`;
    };
  }
  if (helperElem.style[transformProperty] !== undef) {
    return function(content, left, top, zoom) {
      content.style[transformProperty] = `translate(${-left}px,${-top}px) scale(${zoom})`;
    };
  }
  return function(content, left, top, zoom) {
    content.style.marginLeft = left ? `${-left / zoom}px` : '';
    content.style.marginTop = top ? `${-top / zoom}px` : '';
    content.style.zoom = zoom || '';
  };
})();

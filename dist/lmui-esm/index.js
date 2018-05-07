const inBrowser = typeof window !== 'undefined';
const UA = inBrowser && window.navigator.userAgent.toLowerCase();
const isIE = UA && /msie|trident/.test(UA);
const isIE9 = UA && UA.indexOf('msie 9.0') > 0;
const isEdge = UA && UA.indexOf('edge/') > 0;
const isAndroid = UA && UA.indexOf('android') > 0;
const isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);
const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

let supportsPassive = false;
if (inBrowser) {
  try {
    const opts = {};
    Object.defineProperty(opts, 'passive', {
      get() {
        /* istanbul ignore next */
        supportsPassive = true;
      }
    }); // https://github.com/facebook/flow/issues/285
    window.addEventListener('test-passive', null, opts);
  } catch (e) {}
}

/**
 * Remove an item from an array
 */
function remove(arr, item) {
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
function findOne(arr, key, value) {
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

const bind = Function.prototype.bind ? nativeBind : polyfillBind;

/**
 * Convert an Array-like object to a real Array.
 */
function toArray(list, start = 0) {
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

const assign = Object.assign ? Object.assign : polyfillAssign;

function render(tpl, data) {
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

function hasClass(el, cls) {
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

function addClass(el, cls) {
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

function removeClass(el, cls) {
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

function parseDom(htmlStr) {
  const objE = document.createElement('div');
  objE.innerHTML = htmlStr;
  return objE.childNodes[0];
}

/**
 * Query an element selector if it's not an element already.
 */
function query(el) {
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
const vendorPrefix = {
  trident: 'ms',
  gecko: 'Moz',
  webkit: 'Webkit',
  presto: 'O'
}[engine];
const helperElem = document.createElement('div');
let undef;
const perspectiveProperty = `${vendorPrefix}Perspective`;
const transformProperty = `${vendorPrefix}Transform`;

const renderScroll = (function() {
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

// let target;

function remove$1(target, event, handler, capture = false) {
  target.removeEventListener(event, handler, capture);
}

function createOnceHandler(target, event, handler, capture) {
  // const _target = target; // save current target element in closure
  return function onceHandler() {
    const res = handler(...arguments);
    if (res !== null) {
      remove$1(event, onceHandler, capture, target);
    }
  };
}

function add(target, event, handler, once = false, capture = false, passive = false) {
  if (once) {
    handler = createOnceHandler(target, event, handler, capture);
  }
  target.addEventListener(event, handler, supportsPassive ? { capture, passive } : capture);
}

function addDOMListeners(on, instance) {
  for (const name in on) {
    if (Object.prototype.hasOwnProperty.call(on, name)) {
      const event = on[name];
      const target = instance[event.target];
      const handler = bind(instance[event.handler], instance);
      add(target, event.name, handler, event.once, event.capture, event.passive);
    }
  }
}

// import { assign } from '@util';
const strats = {
  events: function(baseEvents = [], inheritEvents = []) {
    const events = baseEvents.slice();
    for (let i = 0; i < inheritEvents.length; i++) {
      const event = inheritEvents[i];
      if (events.indexOf(baseEvents) === -1) {
        events.push(event);
      }
    }
    return events;
  }
};

const defaultStrat = function(baseVal, inheritVal) {
  return inheritVal === undefined ? baseVal : inheritVal;
};

function mergeOptions(base, inherit) {
  const options = {};
  const mergeField = (key) => {
    const strat = strats[key] || defaultStrat; // 动态生成属性合并策略 这些策略都一次在这个文件中进行了定义
    options[key] = strat(base[key], inherit[key], key);
  };
  for (const key in base) {
    if (Object.prototype.hasOwnProperty.call(base, key)) {
      mergeField(key);
    }
  }
  for (const key in inherit) {
    if (Object.prototype.hasOwnProperty.call(inherit, key) && !Object.prototype.hasOwnProperty.call(base, key)) {
      mergeField(key);
    }
  }

  return options;
}

/**
 * @namespace
 * @name ClassManager
 */

let uid = 0;
/**
 * 一个对象类管理器，将所有instance按照list方式管理
 */
class InstanceManager {
  constructor() {
    this.className = 'InstanceManager';
    this._instances = [];
  }

  /**
   * 添加一个实例
   */
  add(instance) {
    instance._uid = uid++;
    this._instances.push(instance);
    return instance;
  }

  /**
   * 删除一个实例
   */
  remove(instance) {
    remove(this._instances, instance);
    return instance;
  }

  /**
   * 通过id查找一个实例（目前没有使用场景，暂未实现）
   */
  getInstance(id) {
    return findOne(this._instances, '_uid', id);
  }

  /**
   * 清空所有实例（目前没有使用场景，暂未实现）
   */
  clear() {}
}

const instanceManager = new InstanceManager();

/**
 * 基础Class
 */
class ClassBase {
  constructor(options) {
    this.$options = options || Object.create(null); // 这里模仿一下vue 将options放置到$options中
    // assign(this, options);
    this.initState();
    this.register();
  }

  initState() {
    const { $options } = this;
    this.className = $options.className || 'ClassBase';
  }

  /**
   * 获取类名
   */
  className() {
    return this.className;
  }

  /**
   * 获取实例id
   */
  uid() {
    return this._uid;
  }

  /**
   * 在管理器中注册当前对象
   */
  register() {
    instanceManager.add(this);
  }

  /**
   * 在管理器中注销当前对象
   */
  deregister() {
    instanceManager.remove(this);
  }
}

/**
 * 事件Class
 */
class EventClass extends ClassBase {
  constructor(options) {
    super(options);
    this._handlers = {};
    this._eventCache = {};
    this.initEvents();
  }

  initEvents() {
    const opts = this.$options;
    if (opts.events) {
      this.createEvent(opts.events);
    }
  }

  /**
   * 绑定监听一次的事件
   */
  one(eventName, handler, context) {
    if (!eventName || !handler) {
      return this;
    }
    const { _handlers } = this;
    if (!_handlers[eventName]) {
      _handlers[eventName] = [];
    }
    _handlers[eventName].push({
      context: context || this,
      handler: handler,
      one: true
    });
    return this;
  }

  /**
   * 绑定监听事件
   */
  bind(eventName, handler, context) {
    if (!eventName || !handler) {
      return this;
    }
    const { _handlers } = this;
    if (!_handlers[eventName]) {
      _handlers[eventName] = [];
    }
    _handlers[eventName].push({
      context: context || this,
      handler: handler,
      one: false
    });
    return this;
  }

  // 接触绑定
  unbind(eventName, handler) {
    const { _handlers } = this;
    if (!eventName) {
      this._handlers = {};
      return this;
    }
    if (handler) {
      if (_handlers[eventName]) {
        const newList = [];
        for (let i = 0, l = _handlers[eventName].length; i < l; i++) {
          if (_handlers[eventName][i]['handler'] !== handler) {
            newList.push(_handlers[eventName][i]);
          }
        }
        _handlers[eventName] = newList;
      }
      if (_handlers[eventName] && _handlers[eventName].length === 0) {
        delete _handlers[eventName];
      }
    } else {
      delete _handlers[eventName];
    }
    return this;
  }

  /**
   * 派发事件
   */
  dispatch(eventName, ...args) {
    let falseNum = 0;
    if (!eventName) {
      return falseNum === 0;
    }
    const _handler = this._handlers[eventName];
    if (_handler) {
      // const args = Array.prototype.slice.call(arguments, 1);
      let len = _handler.length;
      for (let i = 0; i < len;) {
        if (_handler[i]['handler'].apply(_handler[i]['context'], args) === false) {
          falseNum++;
        }
        if (_handler[i]['one']) {
          _handler.splice(i, 1);
          len--;
        } else {
          i++;
        }
      }
    }
    return falseNum === 0;
  }

  /**
   * 指定上下文派发事件
   */
  dispatchWithContext(eventName, context, ...args) {
    let falseNum = 0;
    if (!eventName) {
      return falseNum === 0;
    }
    const _handler = this._handlers[eventName];
    if (_handler) {
      // const context = arguments[arguments.length - 1];
      // const args = Array.prototype.slice.call(arguments, 1, arguments.length - 1);
      let len = _handler.length;
      for (let i = 0; i < len;) {
        if (_handler[i]['handler'].apply(context, args) === false) {
          falseNum++;
        }
        if (_handler[i]['one']) {
          _handler.splice(i, 1);
          len--;
        } else {
          i++;
        }
      }
    }
    return falseNum === 0;
  }

  /**
   * 动态添加自定义事件缓存 eventNames 仅仅支持字符串类型数据，空格分割的函数名称，建议事件名都添加 on/before/after 等明显前缀
   */
  createEvent(eventList, ...args) {
    // if (typeof eventNames !== 'string') {
    //   return;
    // }
    const me = this;
    const cache = me._eventCache;
    // const eventList = eventList;
    const len = eventList.length;
    for (let i = 0; i < len; i++) {
      const eventName = eventList[i];
      cache[eventName] = cache[eventName] || [];
      me[eventName] = (function(ename) {
        return function(fn) {
          if (Object.prototype.toString.call(fn) === '[object Function]') {
            me.bind(ename, fn);
            return me;
          }
          return me.dispatch(...[ename].concat(Array.prototype.slice.call(args, 0)));
        };
      })(eventName);
    }
  }
}

const classOptions = {
  className: 'BaseView', // 组件类名
  events: ['onCreate', 'onDestory'], // 组件事件
  template: '', // 组件模板
  // components: null, // 组件列表 { className : options }
  el: null, // 组件渲染所挂载的父亲dom 可以是dom也可以使用选择器，最终会被解释成this.parentElement
  cntr: null // 组件最外层dom，可以是dom也可以使选择器，如果为空，则会使用template渲染出的最外层，最终会被解释成this.element
};

/**
 * View Class 显示类
 */
class BaseView extends EventClass {
  constructor(options) {
    options = mergeOptions(classOptions, options);
    super(options);
    this.beforeCreate();
    this.mount();
  }

  /**
   * 创建之前调用，基本用来初始化数据
   */
  beforeCreate() {}

  /**
   * 挂载函数，需要重写
   */
  mount() {
    const { $options } = this;
    const { autoOpen, on } = $options;
    // this.el = el && query(el);
    this.beforeRender();
    this.render();
    this.aferRender();
    addDOMListeners(on, this);
    window.setTimeout(() => {
      this.dispatch('onCreate');
      autoOpen && this.open && this.open();
    }, 0);
  }

  /**
   * 渲染前执行
   */
  beforeRender() {}

  /**
   * 生成container字符串，挂载到el节点
   */
  render() {
    const { $options } = this;
    const { el, cntr, template } = $options;
    let element = cntr && query(cntr);
    if (!element) {
      element = parseDom(render(template, $options));
    }
    const parentElement = el && query(el);
    if (parentElement && element) {
      parentElement.appendChild(element);
    }
    this.parentElement = parentElement;
    this.element = element;
  }

  /**
   * 渲染后执行
   */
  aferRender() {}

  /**
   * 销毁
   */
  destory() {
    this.dispatch('onDestory');
  }
}

/**
 * PopupManager
 */
const initZ = 300;
const popManager = {
  // 初始z值
  zIndex: initZ,
  // 是否模态
  modalFade: true,
  // 弹出层实例对象
  instances: {},
  // 弹出层实例对象
  popStack: [],
  // 是否显示了遮罩层
  hasOverlay: false,
  // 遮罩层dom对象
  overlayDom: null,
  // uid获取实例
  getInstance: function(uid) {
    return this.instances[uid];
  },
  // 注册弹出对象
  register: function(instance) {
    if (instance) {
      this.instances[instance.uid()] = instance;
    }
  },
  // 注销弹出对象
  deregister: function(uid) {
    if (uid) {
      this.instances[uid] = null;
      delete this.instances[uid];
    }
  },
  // 获取zIndex
  nextZIndex: function() {
    return this.zIndex++;
  },
  // 背景dom被点击 关闭最新创建popup
  currentInstance: function() {
    if (this.popStack.length <= 0) {
      return;
    }
    const currentPop = this.popStack[this.popStack.length - 1];
    if (!currentPop) {
      return;
    }
    const instance = this.getInstance(currentPop.uid);
    return instance;
    // const { $options } = instance;
    // const { closeOnClickModal, closeOnPressEscape } = $options;
    // if (type === 'closeOnClickModal' && closeOnClickModal) {
    //   instance && instance.close();
    // } else if (type === 'closeOnPressEscape' && closeOnPressEscape) {
    //   instance && instance.close();
    // } else {
    //   instance && instance.close();
    // }
  },
  // 打开一个遮罩层
  openOverlay: function(uid, zIndex, dom, modalClass, modalFade) {
    if (uid === undefined /* || zIndex === undefined */) {
      return;
    }
    // 判断uid唯一性
    for (let i = 0, popLength = this.popStack.length; i < popLength; i++) {
      const popItem = this.popStack[i];
      if (popItem.uid === uid) {
        return;
      }
    }
    this.modalFade = modalFade;
    const overlayDom = this.getOverlay();
    addClass(overlayDom, "lmui-overlay");
    if (this.modalFade && !this.hasOverlay) {
      addClass(overlayDom, "lmui-overlay-enter");
    }
    if (modalClass) {
      const classArr = modalClass.trim().split(/\s+/);
      const classArrLength = classArr.length;
      for (let calssIndex = 0; calssIndex < classArrLength; calssIndex++) {
        const classItem = classArr[calssIndex];
        addClass(overlayDom, classItem);
      }
    }
    // window.setTimeout(() => {
    //   removeClass(overlayDom, 'lmui-overlay-enter');
    // }, 300);
    if (dom && dom.parentNode && dom.parentNode.nodeType !== 11) {
      dom.parentNode.appendChild(overlayDom);
    } else {
      document.body.appendChild(overlayDom);
    }
    overlayDom.style.zIndex = zIndex || initZ;
    overlayDom.style.display = "";
    this.popStack.push({
      uid: uid,
      zIndex: zIndex || initZ,
      modalClass: modalClass
    });
  },
  // 关闭一个遮罩层
  closeOverlay: function(uid) {
    const { popStack } = this;
    const overlayDom = this.getOverlay();
    if (popStack.length > 0) {
      const currentPop = popStack[popStack.length - 1];
      if (currentPop.uid === uid) {
        if (currentPop.modalClass) {
          const classArr = currentPop.modalClass.trim().split(/\s+/);
          const classArrLength = classArr.length;
          for (let i = 0; i < classArrLength; i++) {
            const item = classArr[i];
            removeClass(overlayDom, item);
          }
        }
        popStack.pop();
        if (popStack.length > 0) {
          const pop = popStack[popStack.length - 1];
          if (pop.fixOverlay) {
            overlayDom.style.zIndex = initZ;
          } else {
            overlayDom.style.zIndex = popStack[popStack.length - 1].zIndex;
          }
        }
      } else {
        for (let i = popStack.length - 1; i >= 0; i--) {
          if (popStack[i].uid === uid) {
            popStack.splice(i, 1);
            break;
          }
        }
      }
    }
    if (popStack.length === 0) {
      if (this.modalFade) {
        addClass(overlayDom, "lmui-overlay-leave");
      }
      const me = this;
      window.setTimeout(() => {
        if (popStack.length === 0) {
          if (overlayDom.parentNode) {
            overlayDom.parentNode.removeChild(overlayDom);
          }
          overlayDom.style.display = "none";
          // 为了避免在300ms内调用新的getOverlay这里需要强调为me.
          me.overlayDom = null;
        }
        removeClass(overlayDom, "lmui-overlay-enter lmui-overlay-leave");
      }, 300);
    }
  },
  // 获取遮罩层dom 如果没有则创建
  getOverlay: function() {
    let { overlayDom } = this;
    if (overlayDom) {
      this.hasOverlay = true;
    } else {
      this.hasOverlay = false;
      overlayDom = document.createElement("div");
      this.overlayDom = overlayDom;
      overlayDom.addEventListener("touchmove", event => {
        event.preventDefault();
        event.stopPropagation();
      });
      overlayDom.addEventListener("click", () => {
        const instance = this.currentInstance();
        if (instance) {
          const { $options } = instance;
          const { closeOnClickModal } = $options;
          closeOnClickModal && instance.close();
        }
      });
    }
    return overlayDom;
  }
};

window.addEventListener("keydown", event => {
  if (event.keyCode === 27) {
    const instance = popManager.currentInstance();
    if (instance) {
      const { $options } = instance;
      const { closeOnPressEscape } = $options;
      closeOnPressEscape && instance.close();
    }
  }
});

// 默认配置
const defaultOptions = {
  // 外包容器
  el: document.body,
  // 延时打开
  openDelay: 0,
  // 延时关闭
  closeDelay: 0,
  // 默认zIndex值
  zIndex: 0,
  // 是否是模态
  modal: false,
  // 模态遮罩动画是否开启
  modalFade: true,
  // 模态遮罩是否添加到body上
  modalAppendToBody: true,
  // 是否锁定滚动
  lockScroll: false,
  // 键盘Esc触发关闭
  closeOnPressEscape: false,
  // 点击模态遮罩是否触发关闭
  closeOnClickModal: false,
  // 是否关闭时销毁
  destoryOnClose: true,
  // 模态遮罩className
  modalClass: '',
  // 自动关闭时间
  timeout: 0,
  // overlay的zIndex固定
  fixOverlay: false,
  // 创建就打开
  autoOpen: true
};

const classOptions$1 = {
  className: 'Popbase',
  events: ['onBeforeShow', 'onShow', 'onBeforeOpen', 'onOpen', 'onBeforeClose', 'onClose']
};

class Popbase extends BaseView {
  constructor(options) {
    options = mergeOptions(assign({}, defaultOptions, classOptions$1), options);
    super(options);
    popManager.register(this);
  }

  show() {
    this.open();
  }

  // 显示pop
  open() {
    const { $options } = this;
    let { openDelay } = $options;
    // 如果已经开启状态 或者 onBeforeShow 返回 false 则不会打开
    if (this.isOpened || this.dispatch('onBeforeOpen') === false || this.dispatch('onBeforeShow') === false) {
      return;
    }
    if (this._closeTimer) {
      window.clearTimeout(this._closeTimer);
      this._closeTimer = null;
    }
    window.clearTimeout(this._openTimer);
    openDelay = Number(openDelay);
    if (openDelay > 0) {
      // 执行延迟打开逻辑
      const me = this;
      this._openTimer = window.setTimeout(() => {
        me._openTimer = null;
        me._doOpen();
      }, openDelay);
    } else {
      this._doOpen();
    }
  }

  // 执行显示pop
  _doOpen() {
    const { $options, element } = this;
    const { modalAppendToBody, modalClass, modalFade, el, lockScroll, timeout, modal, zIndex } = $options;
    if (this.willShow && !this.willShow()) {
      return;
    }
    this.isOpening = true;
    if (zIndex) {
      popManager.zIndex = zIndex;
    }
    if (modal) {
      if (this.isClosing) {
        // 如果正在执行关闭，则立刻关闭
        popManager.closePop(this.uid());
        this.isClosing = false;
      }
      const { fixOverlay } = this;
      const nextZIndex = popManager.nextZIndex();
      // 打开遮罩层
      popManager.openOverlay(
        this.uid(),
        fixOverlay ? undefined : nextZIndex,
        modalAppendToBody ? undefined : el,
        modalClass,
        modalFade
      );
      if (lockScroll) {
        // 滚动锁定
        if (!this.bodyOverflow) {
          // this.bodyPaddingRight = document.body.style.paddingRight;
          this.bodyOverflow = document.body.style.overflow;
        }
        // scrollBarWidth = getScrollBarWidth();
        // var bodyHasOverflow = document.documentElement.clientHeight < document.body.scrollHeight;
        // if (scrollBarWidth > 0 && bodyHasOverflow) {
        //     document.body.style.paddingRight = scrollBarWidth + 'px';
        // }
        document.body.style.overflow = 'hidden';
      }
    }
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'absolute';
    }
    this.isOpened = true;
    element.style.zIndex = popManager.nextZIndex();
    // 各个子类自己定义_onOpen
    this._onOpen && this._onOpen();
    this.dispatch('onOpen');
    this.dispatch('onShow');
    if (timeout) {
      // 如果有定时关闭
      this._timeout = window.setTimeout(() => {
        this.close();
        this._timeout = null;
      }, timeout);
    }
    if (!this.transition) {
      // 如果有过渡
      this._doAfterOpen();
    }
  }

  // 打开完毕后操作
  _doAfterOpen() {
    this.isOpening = false;
  }

  // 关闭
  close() {
    const { $options } = this;
    let { closeDelay } = $options;
    if (!this.isOpened || this.dispatch('onBeforeClose') === false) {
      return;
    }
    if (this._openTimer !== null) {
      window.clearTimeout(this._openTimer);
      this._openTimer = null;
    }
    window.clearTimeout(this._closeTimer);
    window.clearTimeout(this._timeout);
    closeDelay = Number(closeDelay);
    if (closeDelay > 0) {
      this._closeTimer = window.setTimeout(() => {
        this._closeTimer = null;
        this._doClose();
      }, closeDelay);
    } else {
      this._doClose();
    }
  }

  // 执行关闭
  _doClose() {
    const { $options } = this;
    const { modal, lockScroll } = $options;
    if (this.willClose && !this.willClose()) {
      return;
    }
    this.isClosing = true;
    if (lockScroll) {
      window.setTimeout(() => {
        if (modal && this.bodyOverflow !== 'hidden') {
          document.body.style.overflow = this.bodyOverflow;
          // document.body.style.paddingRight = this.bodyPaddingRight;
        }
        this.bodyOverflow = null;
        // this.bodyPaddingRight = null;
      }, 300);
    }
    this._onClose && this._onClose();
    this.isOpened = false;
    this.dispatch('onClose');
    if (!this.transition) {
      this._doAfterClose();
    }
  }

  // 关闭完毕后操作
  _doAfterClose() {
    const { $options } = this;
    const { destoryOnClose } = $options;
    popManager.closeOverlay(this.uid());
    this.isClosing = false;
    if (destoryOnClose) {
      this.destory();
    }
  }

  // 销毁
  destory() {
    this.dispatch('onDestory');
    this.deregister();
    popManager.deregister(this.uid());
    popManager.closeOverlay(this.uid());
    if (this.modal && this.bodyOverflow !== null && this.bodyOverflow !== 'hidden') {
      document.body.style.overflow = this.bodyOverflow;
      // document.body.style.paddingRight = this.bodyPaddingRight;
    }
    this.bodyOverflow = null;
    // this.bodyPaddingRight = null;
    if (this.element) {
      this.element.remove();
    }
    delete this.element;
  }
}

var tpl = '<div class="lmui-popup lmui-popup-<%=placement%> <%=containerClass%>" style="width:<%=width%>;height:<%=height%>"> <%=content%> </div>';

const defaultOptions$1 = {
  // 外包容器class
  containerClass: 'lmui-popup-normal',
  // 位置 left right top bottom
  placement: 'bottom',
  // 长度
  width: 'auto',
  // 宽度
  height: 'auto',
  // 弹出内容
  content: '',
  // 关闭class
  closeClass: 'close',
  // 内容定位方式
  contentPosition: '', // h v hv
  // 是否是模态
  modal: true,
  // 模态关闭
  backClose: true,
  // overlay的zIndex固定
  fixOverlay: true,
  // 是否关闭时销毁
  destoryOnClose: false
};

const classOptions$2 = {
  className: 'Popup',
  template: tpl,
  on: [
    {
      name: 'click',
      handler: 'handleClose',
      target: 'element'
    }
  ]
};

class Popup extends Popbase {
  constructor(options) {
    options = mergeOptions(assign({}, defaultOptions$1, classOptions$2), options);
    super(options);
  }

  aferRender() {
    const { $options, element } = this;
    const { contentPosition, closeClass, on } = $options;
    if (contentPosition) {
      const clist = element.children;
      for (let i = 0; i < clist.length; i++) {
        addClass(clist[i], `lmui-popup-${contentPosition}`);
      }
    }
  }

  _onOpen() {
    const { $options, element } = this;
    const { placement } = $options;
    this.transition = true;
    element.style.display = 'block';
    addClass(element, `lmui-popup-${placement}-enter`);
    window.setTimeout(() => {
      this.transition = false;
      this._doAfterOpen();
    }, 300);
  }

  _onClose() {
    const { $options, element } = this;
    const { placement } = $options;
    this.transition = true;
    addClass(element, `lmui-popup-${placement}-leave`);
    window.setTimeout(() => {
      removeClass(element, `lmui-popup-${placement}-enter lmui-popup-${placement}-leave`);
      element.style.display = 'none';
      this.transition = false;
      this._doAfterClose();
    }, 300);
  }

  handleClose(event) {
    const { $options } = this;
    const { closeClass } = $options;
    if (event.target.className.indexOf(closeClass) >= 0) {
      this.close();
      return false;
    }
  }
}

var tpl$1 = '<div class=lmui-actionsheet> <ul class=lmui-actionsheet-container> <% for(var i = 0; i < data.length; i++) { %> <li class=lmui-actionsheet-item data-index="<%=i%>"> <%=data[i].text%> </li> <% } %> <% if(cancelText) { %> <li class=lmui-actionsheet-item> <%=cancelText%> </li> <% } %> </ul> </div> ';

const defaultOptions$2 = {
  // 外包容器class
  containerClass: 'lmui-actionsheet-normal',
  // 位置 left right top bottom
  placement: 'bottom',
  // 长度
  width: '100%',
  // 关闭class
  closeClass: 'lmui-actionsheet-item',
  // 是否是模态
  modal: true,
  // 模态关闭
  backClose: true,
  // overlay的zIndex固定
  fixOverlay: true,
  // 是否关闭时销毁
  destoryOnClose: true,
  // 配置数据
  data: [],
  // 取消按钮配置
  cancelText: '取消'
};

const classOptions$3 = {
  className: 'Actionsheet',
  events: ['onBtnClick'],
  on: [
    {
      name: 'click',
      handler: 'handleItemClick',
      target: 'element'
    }
  ]
};

class Actionsheet extends Popup {
  constructor(options) {
    options = mergeOptions(assign({}, defaultOptions$2, classOptions$3), options);
    super(options);
  }

  beforeRender() {
    const { $options } = this;
    $options.content = render(tpl$1, $options);
  }

  handleItemClick(event) {
    const { $options } = this;
    const { data, closeClass } = $options;
    if (event.target.dataset.index) {
      const index = parseInt(event.target.dataset.index, 10);
      if (this.dispatch('onBtnClick', index, data[index]) !== false) {
        this.close();
      }
    }
    if (event.target.className.indexOf(closeClass) >= 0) {
      this.close();
      return false;
    }
  }
}

var tpl$2 = '<button class="lmui-button lmui-button--default lmui-button--large is-plain"> <label class=lmui-button-text>default</label> </button> ';

const defaultOptions$3 = {
  // 外包容器class
  containerClass: 'lmui-button-normal'
};

const classOptions$4 = {
  className: 'Button',
  events: ['onButtonClick'],
  template: tpl$2,
  on: [
    {
      name: 'click',
      handler: 'handleButtonClick',
      target: 'element'
    }
  ]
};

class Button extends BaseView {
  constructor(options) {
    options = mergeOptions(assign({}, defaultOptions$3, classOptions$4), options);
    super(options);
  }

  handleButtonClick() {
    this.dispatch('onButtonClick');
  }
}

var tpl$3 = '<div class="lmui-checklist <%=containerClass%>"> <% if (title) { %> <label class=lmui-checklist-title><%=title%></label> <% } %> <% for (var i = 0; i < data.length; i++) { %> <a class=lmui-cell> <div class=lmui-cell-left></div> <div class=lmui-cell-wrapper> <div class=lmui-cell-title> <label class=lmui-checklist-label> <span class=lmui-checkbox> <input type=checkbox class=lmui-checkbox-input value="<%=data[i].value%>" data-index="<%=i%>" <% if(data[i].disabled) { %> disabled=disabled <% } %> <% if(data[i].checked) { %> checked=true <% } %> > <span class=lmui-checkbox-core></span> </span> <span class=lmui-checkbox-label><%=data[i].label%></span> </label> </div> <div class=lmui-cell-value> <span></span> </div> </div> <div class=lmui-cell-right></div> </a> <% } %> </div> ';

const defaultOptions$4 = {
  // 外包容器class
  containerClass: 'lmui-checkList',
  title: '',
  data: null, // { label: 'label', value: 'value', disabled: false, checked: true }
  max: Infinity
};

const classOptions$5 = {
  className: 'CheckList',
  events: ['onChange'],
  template: tpl$3,
  on: [
    {
      name: 'change',
      handler: 'handleChange',
      target: 'element'
    }
  ]
};

class CheckList extends BaseView {
  constructor(options) {
    options = mergeOptions(assign({}, defaultOptions$4, classOptions$5), options);
    super(options);
  }

  aferRender() {
    const { element } = this;
    this.forms = toArray(element.getElementsByTagName('input'));
    this.setData();
  }

  setData(newDate) {
    const { $options, forms } = this;
    let { data } = $options;
    if (newDate) {
      data = newDate;
    }
    this.formDate = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const form = forms[i];
      form.checked = item.checked;
      form.disabled = item.disabled;
      form.value = item.value;
      if (item.checked) {
        this.formDate.push(item);
      }
    }
    this.checkMax();
    this.dispatch('onChange', this.formDate.slice());
  }

  handleChange(event) {
    const { checked, disabled, value } = event.target;
    const { $options, formDate } = this;
    const { data } = $options;
    const index = parseInt(event.target.dataset.index, 10);
    const item = data[index];
    item.checked = checked;
    item.disabled = disabled;
    item.value = value;
    checked ? formDate.push(item) : remove(formDate, item);
    this.checkMax();
    this.dispatch('onChange', formDate.slice());
  }

  checkMax() {
    const { $options, element, forms, formDate } = this;
    const { data, max } = $options;
    const { length } = data;
    if (formDate.length >= max) {
      addClass(element, 'is-limit');
      for (let i = 0; i < length; i++) {
        const form = forms[i];
        const item = data[i];
        if (!item.checked && !item.disabled) {
          form.disabled = true;
        }
      }
    } else {
      removeClass(element, 'is-limit');
      for (let i = 0; i < length; i++) {
        const form = forms[i];
        const item = data[i];
        if (!item.checked && !item.disabled) {
          form.disabled = false;
        }
      }
    }
  }
}

var tpl$4 = '<svg class="lmui-contentloader <%=containerClass%>" viewBox="0 0 <%=width%> <%=height%>" version=1.1 preserveAspectRatio="<%=preserveAspectRatio%>"> <rect clip-path=url(#y5xmiii26he) x=0 y=0 width="<%=width%>" height="<%=height%>" style=fill:url(&quot;#cey3myfufcs&quot;)></rect> <defs> <clipPath id=y5xmiii26he> <rect x=70 y=15 rx=4 ry=4 width=117 height=6.4></rect> <rect x=70 y=35 rx=3 ry=3 width=85 height=6.4></rect> <rect x=0 y=80 rx=3 ry=3 width=350 height=6.4></rect> <rect x=0 y=100 rx=3 ry=3 width=380 height=6.4></rect> <rect x=0 y=120 rx=3 ry=3 width=201 height=6.4></rect> <circle cx=30 cy=30 r=30></circle> </clipPath> <linearGradient id=cey3myfufcs> <stop offset=-1.89817 stop-color="<%=primaryColor%>"> <% if (animate) { %><animate attributeName=offset values="-2; 1" dur=2s repeatCount=indefinite></animate><% } %> </stop> <stop offset=-1.39817 stop-color="<%=secondaryColor%>"> <% if (animate) { %><animate attributeName=offset values="-1.5; 1.5" dur=2s repeatCount=indefinite></animate><% } %> </stop> <stop offset=-0.898168 stop-color="<%=primaryColor%>"> <% if (animate) { %><animate attributeName=offset values="-1; 2" dur=2s repeatCount=indefinite></animate><% } %> </stop> </linearGradient> </defs> </svg> ';

const defaultOptions$5 = {
  // 外包容器class
  containerClass: 'lmui-contentloader-normal',
  width: 400,
  height: 130,
  speed: 2,
  preserveAspectRatio: 'xMidYMid meet',
  primaryColor: '#f9f9f9',
  secondaryColor: '#ecebeb',
  // uniqueKey: {
  //   type: String
  // },
  animate: true
};

const classOptions$6 = {
  className: 'ContentLoader',
  template: tpl$4
};

class ContentLoader extends BaseView {
  constructor(options) {
    options = mergeOptions(assign({}, defaultOptions$5, classOptions$6), options);
    super(options);
  }
}

var tpl$5 = '<div class="lmui-dialog <%=containerClass%> lmui-dialog-<%=placement%>" style="width:<%=width%>;height:<%=height%>"> <div class=lmui-dialog-head> <% if (title) { %> <div class=lmui-dialog-title><%=title%></div> <% } %> </div> <div class=lmui-dialog-body><%=content%></div> <% if (button && button.length) { %> <div class=lmui-dialog-foot> <% for (var i = 0; i < btns.length; i++) { %> <a href=javascript:void(0) class="lmui-dialog-button <%=btns[i].classnames%>" data-action=btn data-retid="<%=btns[i].id%>"><%=btns[i].text%></a> <% } %> </div> <% } %> </div> ';

const defaultOptions$6 = {
  // 外包容器class
  containerClass: 'lmui-dialog-normal', // 外包容器className
  // 弹出
  placement: 'center', // center top bottom
  // 长度
  width: 'auto',
  // 宽度
  height: 'auto',
  // 弹出内容
  content: '',
  // 关闭class
  closeClass: 'close',
  // 是否是模态
  modal: true,
  // 键盘Esc触发关闭
  closeOnPressEscape: false,
  // 点击模态遮罩是否触发关闭
  closeOnClickModal: false,
  // 自动关闭时间
  timeout: 0,
  // 对话框标题
  title: '',
  // 对话按钮组
  button: ['*我知道了']
};

const classOptions$7 = {
  className: 'Dialog',
  events: ['onBtnClick'],
  template: tpl$5,
  on: [
    {
      name: 'click',
      handler: 'handleBtnClick',
      target: 'element'
    }
  ]
};

class Dialog extends Popbase {
  constructor(options) {
    options = mergeOptions(assign({}, defaultOptions$6, classOptions$7), options);
    super(options);
  }

  beforeRender() {
    const { $options } = this;
    const { btnCssMap } = Dialog.config;
    const { button } = $options;
    const size = button.length;
    $options.btns = [];
    for (let i = 0; i < size; i++) {
      let text = button[i];
      let classnames = btnCssMap[text.slice(0, 1)];
      text = classnames ? text.slice(1) : text;
      classnames = classnames ? `${btnCssMap['def']} ${classnames}` : `${btnCssMap['def']}`;
      $options.btns.push({
        text: text,
        classnames: classnames,
        id: i + 1
      });
    }
  }

  _onOpen() {
    const { $options, element } = this;
    const { placement } = $options;
    this.transition = true;
    element.style.display = 'block';
    addClass(element, `lmui-dialog-${placement}-enter`);
    window.setTimeout(() => {
      this.transition = false;
      this._doAfterOpen();
    }, 300);
  }

  _onClose() {
    const { $options, element } = this;
    const { placement } = $options;
    this.transition = true;
    addClass(element, `lmui-dialog-${placement}-leave`);
    window.setTimeout(() => {
      removeClass(element, `lmui-popup-${placement}-enter lmui-popup-${placement}-leave`);
      element.style.display = 'none';
      this.transition = false;
      this._doAfterClose();
    }, 300);
  }

  handleBtnClick(event) {
    const { $options } = this;
    const { closeClass } = $options;
    if (event.target.className.indexOf(closeClass) >= 0) {
      if (this.dispatch('onBtnClick', 0) !== false) {
        this.close();
      }
      return false;
    }
    if (
      (event.target.dataset && event.target.dataset.action === 'btn') ||
      event.target.getAttribute('data-action') === 'btn'
    ) {
      this.dispatch(
        'onBtnClick',
        event.target.dataset ? event.target.dataset.retid : event.target.getAttribute('data-retid')
      );
    }
  }
}

Dialog.config = {
  btnCssMap: {
    'def': 'btn',
    '~': 'btn-default',
    '#': 'btn-normal',
    '*': 'btn-primary',
    '$': 'btn-success',
    '%': 'btn-info',
    '@': 'btn-link',
    '^': 'btn-warning',
    '!': 'btn-danger'
  }
};

var tpl$6 = '<header class="lmui-header <%=containerClass%><% if(fixed) { %> is-fixed<% } %>"> <div class="lmui-header-button is-left"> <% if (data && data.left) { %> <a href="<%=data.left.link%>" class=router-link-active data-id="<%=data.left.id%>"> <button class="lmui-button lmui-button--default lmui-button--normal"> <% if (data.left.icon) { %> <span class=lmui-button-icon><i class="<%=data.left.icon%>"></i></span> <% } else if (data.left.img) { %> <span class=lmui-button-icon><img src="<%=data.left.img%>"></span> <% } %> <label class=mint-button-text><%=data.left.text%></label> </button> </a> <% } %> </div> <h1 class=lmui-header-title><%=title%></h1> <div class="lmui-header-button is-right"> <% if (data && data.right) { %> <% for(var i = 0; i < data.right.length; i++) { %> <a href="<%=data.right[i].link%>" class=router-link-active data-id="<%=data.right[i].id%>"> <button class="lmui-button lmui-button--default lmui-button--normal"> <% if (data.right[i].icon) { %> <span class=lmui-button-icon><i class="<%=data.right[i].icon%>"></i></span> <% } else if (data.right[i].img) { %> <span class=lmui-button-icon><img src="<%=data.right[i].img%>"></span> <% } %> <label class=mint-button-text><%=data.right[i].text%></label> </button> </a> <% } %> <% } %> </div> </header> ';

const defaultOptions$7 = {
  // 外包容器class
  containerClass: "lmui-header-normal",
  title: "",
  fixed: false,
  data: null
};

const classOptions$8 = {
  className: "Header",
  events: ["onButtonClick"],
  template: tpl$6,
  on: [
    {
      name: "click",
      handler: "handleButtonClick",
      target: "element"
    }
  ]
};

class Header extends BaseView {
  constructor(options) {
    options = mergeOptions(assign({}, defaultOptions$7, classOptions$8), options);
    super(options);
  }
  aferRender() {
    const { $options, element } = this;
    this.titleEls = toArray(element.getElementsByTagName("h1"));
  }
  handleButtonClick(event) {
    let { target } = event;
    const { element } = this;
    while (!hasClass(target, "router-link-active") && target !== element) {
      target = target.parentNode;
    }
    if (target !== element) {
      const nReturn = this.dispatch(
        "onButtonClick",
        target.dataset ? target.dataset.id : target.getAttribute("data-id")
      );
      if (nReturn === false) {
        event.preventDefault();
      }
    }
  }
  setTitle(title) {
    const { $options, titleEls } = this;
    const { data } = $options;
    const [titleEl] = titleEls;
    titleEl.innerHTML = data.title = title;
  }
}

const time =
  Date.now ||
  function() {
    return +new Date();
  };
const desiredFrames = 60;
const millisecondsPerSecond = 1000;
let running = {};
let counter = 1;

const Animate = {
  /**
   * A requestAnimationFrame wrapper / polyfill.
   *
   * @param callback {Function} The callback to be invoked before the next repaint.
   * @param root {HTMLElement} The root element for the repaint
   */
  requestAnimationFrame: (function() {
    // Check for request animation Frame support
    const requestFrame =
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame;
    let isNative = !!requestFrame;

    if (requestFrame && !/requestAnimationFrame\(\)\s*\{\s*\[native code\]\s*\}/i.test(requestFrame.toString())) {
      isNative = false;
    }

    if (isNative) {
      return function(callback, root) {
        requestFrame(callback, root);
      };
    }

    const TARGET_FPS = 60;
    let requests = {};
    let rafHandle = 1;
    let intervalHandle = null;
    let lastActive = +new Date();

    return function(callback, root) {
      const callbackHandle = rafHandle++;

      // Store callback
      requests[callbackHandle] = callback;

      // Create timeout at first request
      if (intervalHandle === null) {
        intervalHandle = setInterval(() => {
          const now = +new Date();
          const currentRequests = requests;

          // Reset data structure before executing callbacks
          requests = {};

          for (const key in currentRequests) {
            if (Object.prototype.hasOwnProperty.call(currentRequests, key)) {
              currentRequests[key](now);
              lastActive = now;
            }
          }

          // Disable the timeout when nothing happens for a certain
          // period of time
          if (now - lastActive > 2500) {
            clearInterval(intervalHandle);
            intervalHandle = null;
          }
        }, 1000 / TARGET_FPS);
      }

      return callbackHandle;
    };
  })(),

  /**
   * Stops the given animation.
   *
   * @param id {Integer} Unique animation ID
   * @return {Boolean} Whether the animation was stopped (aka, was running before)
   */
  stop: function(id) {
    const cleared = running[id] != null;
    if (cleared) {
      running[id] = null;
    }

    return cleared;
  },

  /**
   * Whether the given animation is still running.
   *
   * @param id {Integer} Unique animation ID
   * @return {Boolean} Whether the animation is still running
   */
  isRunning: function(id) {
    return running[id] != null;
  },

  /**
   * Start the animation.
   *
   * @param stepCallback {Function} Pointer to function which is executed on every step.
   *   Signature of the method should be `function(percent, now, virtual) { return continueWithAnimation; }`
   * @param verifyCallback {Function} Executed before every animation step.
   *   Signature of the method should be `function() { return continueWithAnimation; }`
   * @param completedCallback {Function}
   *   Signature of the method should be `function(droppedFrames, finishedAnimation) {}`
   * @param duration {Integer} Milliseconds to run the animation
   * @param easingMethod {Function} Pointer to easing function
   *   Signature of the method should be `function(percent) { return modifiedValue; }`
   * @param root {Element ? document.body} Render root, when available. Used for internal
   *   usage of requestAnimationFrame.
   * @return {Integer} Identifier of animation. Can be used to stop it any time.
   */
  start: function(stepCallback, verifyCallback, completedCallback, duration, easingMethod, root) {
    const start = time();
    let lastFrame = start;
    let percent = 0;
    let dropCounter = 0;
    const id = counter++;

    if (!root) {
      root = document.body;
    }

    // Compacting running db automatically every few new animations
    if (id % 20 === 0) {
      const newRunning = {};
      for (const usedId in running) {
        if (Object.prototype.hasOwnProperty.call(running, usedId)) {
          newRunning[usedId] = true;
        }
      }
      running = newRunning;
    }

    // This is the internal step method which is called every few milliseconds
    const step = function(virtual) {
      // Normalize virtual value
      const render = virtual !== true;

      // Get current time
      const now = time();

      // Verification is executed before next animation step
      if (!running[id] || (verifyCallback && !verifyCallback(id))) {
        running[id] = null;
        completedCallback &&
          completedCallback(desiredFrames - dropCounter / ((now - start) / millisecondsPerSecond), id, false);
        return;
      }

      // For the current rendering to apply let's update omitted steps in memory.
      // This is important to bring internal state variables up-to-date with progress in time.
      if (render) {
        const droppedFrames = Math.round((now - lastFrame) / (millisecondsPerSecond / desiredFrames)) - 1;
        for (let j = 0; j < Math.min(droppedFrames, 4); j++) {
          step(true);
          dropCounter++;
        }
      }

      // Compute percent value
      if (duration) {
        percent = (now - start) / duration;
        if (percent > 1) {
          percent = 1;
        }
      }

      // Execute step callback, then...
      const value = easingMethod ? easingMethod(percent) : percent;
      if ((stepCallback(value, now, render) === false || percent === 1) && render) {
        running[id] = null;
        completedCallback &&
          completedCallback(
            desiredFrames - dropCounter / ((now - start) / millisecondsPerSecond),
            id,
            percent === 1 || duration == null
          );
      } else if (render) {
        lastFrame = now;
        Animate.requestAnimationFrame(step, root);
      }
    };

    // Mark as running
    running[id] = true;

    // Init first step
    Animate.requestAnimationFrame(step, root);

    // Return unique animation ID
    return id;
  }
};

const NOOP = () => {};

/**
 * A pure logic 'component' for 'virtual' scrolling/zooming.
 */
const Scroller = function(callback, options) {
  this.__callback = callback;

  this.options = {
    /** Enable scrolling on x-axis */
    scrollingX: true,

    /** Enable scrolling on y-axis */
    scrollingY: true,

    /** Enable animations for deceleration, snap back, zooming and scrolling */
    animating: true,

    /** duration for animations triggered by scrollTo/zoomTo */
    animationDuration: 250,

    /** Enable bouncing (content can be slowly moved outside and jumps back after releasing) */
    bouncing: true,

    /** Enable locking to the main axis if user moves only slightly on one of them at start */
    locking: true,

    /** Enable pagination mode (switching between full page content panes) */
    paging: false,

    /** Enable snapping of content to a configured pixel grid */
    snapping: false,

    /** Enable zooming of content via API, fingers and mouse wheel */
    zooming: false,

    /** Minimum zoom level */
    minZoom: 0.5,

    /** Maximum zoom level */
    maxZoom: 3,

    /** Multiply or decrease scrolling speed **/
    speedMultiplier: 1,

    /** Callback that is fired on the later of touch end or deceleration end,
            provided that another scrolling action has not begun. Used to know
            when to fade out a scrollbar. */
    scrollingComplete: NOOP,

    /** This configures the amount of change applied to deceleration when reaching boundaries  **/
    penetrationDeceleration: 0.03,

    /** This configures the amount of change applied to acceleration when reaching boundaries  **/
    penetrationAcceleration: 0.08
  };

  for (const key in options) {
    if (Object.prototype.hasOwnProperty.call(options, key)) {
      this.options[key] = options[key];
    }
  }
};

// Easing Equations (c) 2003 Robert Penner, all rights reserved.
// Open source under the BSD License.

/**
 * @param pos {Number} position between 0 (start of effect) and 1 (end of effect)
 **/
const easeOutCubic = function(pos) {
  return Math.pow(pos - 1, 3) + 1;
};

/**
 * @param pos {Number} position between 0 (start of effect) and 1 (end of effect)
 **/
const easeInOutCubic = function(pos) {
  if ((pos /= 0.5) < 1) {
    return 0.5 * Math.pow(pos, 3);
  }

  return 0.5 * (Math.pow(pos - 2, 3) + 2);
};

const members = {
  /*
    ---------------------------------------------------------------------------
        INTERNAL FIELDS :: STATUS
    ---------------------------------------------------------------------------
    */

  /** {Boolean} Whether only a single finger is used in touch handling */
  __isSingleTouch: false,

  /** {Boolean} Whether a touch event sequence is in progress */
  __isTracking: false,

  /** {Boolean} Whether a deceleration animation went to completion. */
  __didDecelerationComplete: false,

  /**
   * {Boolean} Whether a gesture zoom/rotate event is in progress. Activates when
   * a gesturestart event happens. This has higher priority than dragging.
   */
  __isGesturing: false,

  /**
   * {Boolean} Whether the user has moved by such a distance that we have enabled
   * dragging mode. Hint: It's only enabled after some pixels of movement to
   * not interrupt with clicks etc.
   */
  __isDragging: false,

  /**
   * {Boolean} Not touching and dragging anymore, and smoothly animating the
   * touch sequence using deceleration.
   */
  __isDecelerating: false,

  /**
   * {Boolean} Smoothly animating the currently configured change
   */
  __isAnimating: false,

  /*
    ---------------------------------------------------------------------------
        INTERNAL FIELDS :: DIMENSIONS
    ---------------------------------------------------------------------------
    */

  /** {Integer} Available outer left position (from document perspective) */
  __clientLeft: 0,

  /** {Integer} Available outer top position (from document perspective) */
  __clientTop: 0,

  /** {Integer} Available outer width */
  __clientWidth: 0,

  /** {Integer} Available outer height */
  __clientHeight: 0,

  /** {Integer} Outer width of content */
  __contentWidth: 0,

  /** {Integer} Outer height of content */
  __contentHeight: 0,

  /** {Integer} Snapping width for content */
  __snapWidth: 100,

  /** {Integer} Snapping height for content */
  __snapHeight: 100,

  /** {Integer} Height to assign to refresh area */
  __refreshHeight: null,

  /** {Boolean} Whether the refresh process is enabled when the event is released now */
  __refreshActive: false,

  /** {Function} Callback to execute on activation. This is for signalling the user about a refresh is about to happen when he release */
  __refreshActivate: null,

  /** {Function} Callback to execute on deactivation. This is for signalling the user about the refresh being cancelled */
  __refreshDeactivate: null,

  /** {Function} Callback to execute to start the actual refresh. Call {@link #refreshFinish} when done */
  __refreshStart: null,

  /** {Number} Zoom level */
  __zoomLevel: 1,

  /** {Number} Scroll position on x-axis */
  __scrollLeft: 0,

  /** {Number} Scroll position on y-axis */
  __scrollTop: 0,

  /** {Integer} Maximum allowed scroll position on x-axis */
  __maxScrollLeft: 0,

  /** {Integer} Maximum allowed scroll position on y-axis */
  __maxScrollTop: 0,

  /* {Number} Scheduled left position (final position when animating) */
  __scheduledLeft: 0,

  /* {Number} Scheduled top position (final position when animating) */
  __scheduledTop: 0,

  /* {Number} Scheduled zoom level (final scale when animating) */
  __scheduledZoom: 0,

  /*
    ---------------------------------------------------------------------------
        INTERNAL FIELDS :: LAST POSITIONS
    ---------------------------------------------------------------------------
    */

  /** {Number} Left position of finger at start */
  __lastTouchLeft: null,

  /** {Number} Top position of finger at start */
  __lastTouchTop: null,

  /** {Date} Timestamp of last move of finger. Used to limit tracking range for deceleration speed. */
  __lastTouchMove: null,

  /** {Array} List of positions, uses three indexes for each state: left, top, timestamp */
  __positions: null,

  /*
    ---------------------------------------------------------------------------
        INTERNAL FIELDS :: DECELERATION SUPPORT
    ---------------------------------------------------------------------------
    */

  /** {Integer} Minimum left scroll position during deceleration */
  __minDecelerationScrollLeft: null,

  /** {Integer} Minimum top scroll position during deceleration */
  __minDecelerationScrollTop: null,

  /** {Integer} Maximum left scroll position during deceleration */
  __maxDecelerationScrollLeft: null,

  /** {Integer} Maximum top scroll position during deceleration */
  __maxDecelerationScrollTop: null,

  /** {Number} Current factor to modify horizontal scroll position with on every step */
  __decelerationVelocityX: null,

  /** {Number} Current factor to modify vertical scroll position with on every step */
  __decelerationVelocityY: null,

  /*
    ---------------------------------------------------------------------------
        PUBLIC API
    ---------------------------------------------------------------------------
    */

  /**
   * Configures the dimensions of the client (outer) and content (inner) elements.
   * Requires the available space for the outer element and the outer size of the inner element.
   * All values which are falsy (null or zero etc.) are ignored and the old value is kept.
   *
   * @param clientWidth {Integer ? null} Inner width of outer element
   * @param clientHeight {Integer ? null} Inner height of outer element
   * @param contentWidth {Integer ? null} Outer width of inner element
   * @param contentHeight {Integer ? null} Outer height of inner element
   */
  setDimensions: function(clientWidth, clientHeight, contentWidth, contentHeight) {
    const me = this;

    // Only update values which are defined
    if (clientWidth === +clientWidth) {
      me.__clientWidth = clientWidth;
    }

    if (clientHeight === +clientHeight) {
      me.__clientHeight = clientHeight;
    }

    if (contentWidth === +contentWidth) {
      me.__contentWidth = contentWidth;
    }

    if (contentHeight === +contentHeight) {
      me.__contentHeight = contentHeight;
    }

    // Refresh maximums
    me.__computeScrollMax();

    // Refresh scroll position
    me.scrollTo(me.__scrollLeft, me.__scrollTop, true);
  },

  /**
   * Sets the client coordinates in relation to the document.
   *
   * @param left {Integer ? 0} Left position of outer element
   * @param top {Integer ? 0} Top position of outer element
   */
  setPosition: function(left, top) {
    const me = this;

    me.__clientLeft = left || 0;
    me.__clientTop = top || 0;
  },

  /**
   * Configures the snapping (when snapping is active)
   *
   * @param width {Integer} Snapping width
   * @param height {Integer} Snapping height
   */
  setSnapSize: function(width, height) {
    const me = this;

    me.__snapWidth = width;
    me.__snapHeight = height;
  },

  /**
   * Activates pull-to-refresh. A special zone on the top of the list to start a list refresh whenever
   * the user event is released during visibility of this zone. This was introduced by some apps on iOS like
   * the official Twitter client.
   *
   * @param height {Integer} Height of pull-to-refresh zone on top of rendered list
   * @param activateCallback {Function} Callback to execute on activation. This is for signalling the user about a refresh is about to happen when he release.
   * @param deactivateCallback {Function} Callback to execute on deactivation. This is for signalling the user about the refresh being cancelled.
   * @param startCallback {Function} Callback to execute to start the real async refresh action. Call {@link #finishPullToRefresh} after finish of refresh.
   */
  activatePullToRefresh: function(height, activateCallback, deactivateCallback, startCallback) {
    const me = this;

    me.__refreshHeight = height;
    me.__refreshActivate = activateCallback;
    me.__refreshDeactivate = deactivateCallback;
    me.__refreshStart = startCallback;
  },

  /**
   * Starts pull-to-refresh manually.
   */
  triggerPullToRefresh: function() {
    // Use publish instead of scrollTo to allow scrolling to out of boundary position
    // We don't need to normalize scrollLeft, zoomLevel, etc. here because we only y-scrolling when pull-to-refresh is enabled
    this.__publish(this.__scrollLeft, -this.__refreshHeight, this.__zoomLevel, true);

    if (this.__refreshStart) {
      this.__refreshStart();
    }
  },

  /**
   * Signalizes that pull-to-refresh is finished.
   */
  finishPullToRefresh: function() {
    const me = this;

    me.__refreshActive = false;
    if (me.__refreshDeactivate) {
      me.__refreshDeactivate();
    }

    me.scrollTo(me.__scrollLeft, me.__scrollTop, true);
  },

  /**
   * Returns the scroll position and zooming values
   *
   * @return {Map} `left` and `top` scroll position and `zoom` level
   */
  getValues: function() {
    const me = this;

    return {
      left: me.__scrollLeft,
      top: me.__scrollTop,
      zoom: me.__zoomLevel
    };
  },

  /**
   * Returns the maximum scroll values
   *
   * @return {Map} `left` and `top` maximum scroll values
   */
  getScrollMax: function() {
    const me = this;

    return {
      left: me.__maxScrollLeft,
      top: me.__maxScrollTop
    };
  },

  /**
   * Zooms to the given level. Supports optional animation. Zooms
   * the center when no coordinates are given.
   *
   * @param level {Number} Level to zoom to
   * @param animate {Boolean ? false} Whether to use animation
   * @param originLeft {Number ? null} Zoom in at given left coordinate
   * @param originTop {Number ? null} Zoom in at given top coordinate
   * @param callback {Function ? null} A callback that gets fired when the zoom is complete.
   */
  zoomTo: function(level, animate, originLeft, originTop, callback) {
    const me = this;

    if (!me.options.zooming) {
      throw new Error('Zooming is not enabled!');
    }

    // Add callback if exists
    if (callback) {
      me.__zoomComplete = callback;
    }

    // Stop deceleration
    if (me.__isDecelerating) {
      Animate.stop(me.__isDecelerating);
      me.__isDecelerating = false;
    }

    const oldLevel = me.__zoomLevel;

    // Normalize input origin to center of viewport if not defined
    if (originLeft == null) {
      originLeft = me.__clientWidth / 2;
    }

    if (originTop == null) {
      originTop = me.__clientHeight / 2;
    }

    // Limit level according to configuration
    level = Math.max(Math.min(level, me.options.maxZoom), me.options.minZoom);

    // Recompute maximum values while temporary tweaking maximum scroll ranges
    me.__computeScrollMax(level);

    // Recompute left and top coordinates based on new zoom level
    let left = (originLeft + me.__scrollLeft) * level / oldLevel - originLeft;
    let top = (originTop + me.__scrollTop) * level / oldLevel - originTop;

    // Limit x-axis
    if (left > me.__maxScrollLeft) {
      left = me.__maxScrollLeft;
    } else if (left < 0) {
      left = 0;
    }

    // Limit y-axis
    if (top > me.__maxScrollTop) {
      top = me.__maxScrollTop;
    } else if (top < 0) {
      top = 0;
    }

    // Push values out
    me.__publish(left, top, level, animate);
  },

  /**
   * Zooms the content by the given factor.
   *
   * @param factor {Number} Zoom by given factor
   * @param animate {Boolean ? false} Whether to use animation
   * @param originLeft {Number ? 0} Zoom in at given left coordinate
   * @param originTop {Number ? 0} Zoom in at given top coordinate
   * @param callback {Function ? null} A callback that gets fired when the zoom is complete.
   */
  zoomBy: function(factor, animate, originLeft, originTop, callback) {
    const me = this;

    me.zoomTo(me.__zoomLevel * factor, animate, originLeft, originTop, callback);
  },

  /**
   * Scrolls to the given position. Respect limitations and snapping automatically.
   *
   * @param left {Number?null} Horizontal scroll position, keeps current if value is <code>null</code>
   * @param top {Number?null} Vertical scroll position, keeps current if value is <code>null</code>
   * @param animate {Boolean?false} Whether the scrolling should happen using an animation
   * @param zoom {Number?null} Zoom level to go to
   */
  scrollTo: function(left, top, animate, zoom) {
    const me = this;

    // Stop deceleration
    if (me.__isDecelerating) {
      Animate.stop(me.__isDecelerating);
      me.__isDecelerating = false;
    }

    // Correct coordinates based on new zoom level
    if (zoom != null && zoom !== me.__zoomLevel) {
      if (!me.options.zooming) {
        throw new Error('Zooming is not enabled!');
      }

      left *= zoom;
      top *= zoom;

      // Recompute maximum values while temporary tweaking maximum scroll ranges
      me.__computeScrollMax(zoom);
    } else {
      // Keep zoom when not defined
      zoom = me.__zoomLevel;
    }

    if (!me.options.scrollingX) {
      left = me.__scrollLeft;
    } else if (me.options.paging) {
      left = Math.round(left / me.__clientWidth) * me.__clientWidth;
    } else if (me.options.snapping) {
      left = Math.round(left / me.__snapWidth) * me.__snapWidth;
    }

    if (!me.options.scrollingY) {
      top = me.__scrollTop;
    } else if (me.options.paging) {
      top = Math.round(top / me.__clientHeight) * me.__clientHeight;
    } else if (me.options.snapping) {
      top = Math.round(top / me.__snapHeight) * me.__snapHeight;
    }

    // Limit for allowed ranges
    left = Math.max(Math.min(me.__maxScrollLeft, left), 0);
    top = Math.max(Math.min(me.__maxScrollTop, top), 0);

    // Don't animate when no change detected, still call publish to make sure
    // that rendered position is really in-sync with internal data
    if (left === me.__scrollLeft && top === me.__scrollTop) {
      animate = false;
    }

    // Publish new values
    if (!me.__isTracking) {
      me.__publish(left, top, zoom, animate);
    }
  },

  /**
   * Scroll by the given offset
   *
   * @param left {Number ? 0} Scroll x-axis by given offset
   * @param top {Number ? 0} Scroll x-axis by given offset
   * @param animate {Boolean ? false} Whether to animate the given change
   */
  scrollBy: function(left, top, animate) {
    const me = this;

    const startLeft = me.__isAnimating ? me.__scheduledLeft : me.__scrollLeft;
    const startTop = me.__isAnimating ? me.__scheduledTop : me.__scrollTop;

    me.scrollTo(startLeft + (left || 0), startTop + (top || 0), animate);
  },

  /*
    ---------------------------------------------------------------------------
        EVENT CALLBACKS
    ---------------------------------------------------------------------------
    */

  /**
   * Mouse wheel handler for zooming support
   */
  doMouseZoom: function(wheelDelta, timeStamp, pageX, pageY) {
    const me = this;
    const change = wheelDelta > 0 ? 0.97 : 1.03;

    return me.zoomTo(me.__zoomLevel * change, false, pageX - me.__clientLeft, pageY - me.__clientTop);
  },

  /**
   * Touch start handler for scrolling support
   */
  doTouchStart: function(touches, timeStamp) {
    // Array-like check is enough here
    if (touches.length == null) {
      throw new Error(`Invalid touch list: ${touches}`);
    }

    if (timeStamp instanceof Date) {
      timeStamp = timeStamp.valueOf();
    }
    if (typeof timeStamp !== 'number') {
      throw new Error(`Invalid timestamp value: ${timeStamp}`);
    }

    const me = this;

    // Reset interruptedAnimation flag
    me.__interruptedAnimation = true;

    // Stop deceleration
    if (me.__isDecelerating) {
      Animate.stop(me.__isDecelerating);
      me.__isDecelerating = false;
      me.__interruptedAnimation = true;
    }

    // Stop animation
    if (me.__isAnimating) {
      Animate.stop(me.__isAnimating);
      me.__isAnimating = false;
      me.__interruptedAnimation = true;
    }

    // Use center point when dealing with two fingers
    let currentTouchLeft;
    let currentTouchTop;
    const isSingleTouch = touches.length === 1;
    if (isSingleTouch) {
      currentTouchLeft = touches[0].pageX;
      currentTouchTop = touches[0].pageY;
    } else {
      currentTouchLeft = Math.abs(touches[0].pageX + touches[1].pageX) / 2;
      currentTouchTop = Math.abs(touches[0].pageY + touches[1].pageY) / 2;
    }

    // Store initial positions
    me.__initialTouchLeft = currentTouchLeft;
    me.__initialTouchTop = currentTouchTop;

    // Store current zoom level
    me.__zoomLevelStart = me.__zoomLevel;

    // Store initial touch positions
    me.__lastTouchLeft = currentTouchLeft;
    me.__lastTouchTop = currentTouchTop;

    // Store initial move time stamp
    me.__lastTouchMove = timeStamp;

    // Reset initial scale
    me.__lastScale = 1;

    // Reset locking flags
    me.__enableScrollX = !isSingleTouch && me.options.scrollingX;
    me.__enableScrollY = !isSingleTouch && me.options.scrollingY;

    // Reset tracking flag
    me.__isTracking = true;

    // Reset deceleration complete flag
    me.__didDecelerationComplete = false;

    // Dragging starts directly with two fingers, otherwise lazy with an offset
    me.__isDragging = !isSingleTouch;

    // Some features are disabled in multi touch scenarios
    me.__isSingleTouch = isSingleTouch;

    // Clearing data structure
    me.__positions = [];
  },

  /**
   * Touch move handler for scrolling support
   */
  doTouchMove: function(touches, timeStamp, scale) {
    // Array-like check is enough here
    if (touches.length == null) {
      throw new Error(`Invalid touch list: ${touches}`);
    }

    if (timeStamp instanceof Date) {
      timeStamp = timeStamp.valueOf();
    }
    if (typeof timeStamp !== 'number') {
      throw new Error(`Invalid timestamp value: ${timeStamp}`);
    }

    const me = this;

    // Ignore event when tracking is not enabled (event might be outside of element)
    if (!me.__isTracking) {
      return;
    }

    let currentTouchLeft;
    let currentTouchTop;

    // Compute move based around of center of fingers
    if (touches.length === 2) {
      currentTouchLeft = Math.abs(touches[0].pageX + touches[1].pageX) / 2;
      currentTouchTop = Math.abs(touches[0].pageY + touches[1].pageY) / 2;
    } else {
      currentTouchLeft = touches[0].pageX;
      currentTouchTop = touches[0].pageY;
    }

    const positions = me.__positions;

    // Are we already is dragging mode?
    if (me.__isDragging) {
      // Compute move distance
      const moveX = currentTouchLeft - me.__lastTouchLeft;
      const moveY = currentTouchTop - me.__lastTouchTop;

      // Read previous scroll position and zooming
      let scrollLeft = me.__scrollLeft;
      let scrollTop = me.__scrollTop;
      let level = me.__zoomLevel;

      // Work with scaling
      if (scale != null && me.options.zooming) {
        const oldLevel = level;

        // Recompute level based on previous scale and new scale
        level = level / me.__lastScale * scale;

        // Limit level according to configuration
        level = Math.max(Math.min(level, me.options.maxZoom), me.options.minZoom);

        // Only do further compution when change happened
        if (oldLevel !== level) {
          // Compute relative event position to container
          const currentTouchLeftRel = currentTouchLeft - me.__clientLeft;
          const currentTouchTopRel = currentTouchTop - me.__clientTop;

          // Recompute left and top coordinates based on new zoom level
          scrollLeft = (currentTouchLeftRel + scrollLeft) * level / oldLevel - currentTouchLeftRel;
          scrollTop = (currentTouchTopRel + scrollTop) * level / oldLevel - currentTouchTopRel;

          // Recompute max scroll values
          me.__computeScrollMax(level);
        }
      }

      if (me.__enableScrollX) {
        scrollLeft -= moveX * this.options.speedMultiplier;
        const maxScrollLeft = me.__maxScrollLeft;

        if (scrollLeft > maxScrollLeft || scrollLeft < 0) {
          // Slow down on the edges
          if (me.options.bouncing) {
            scrollLeft += moveX / 2 * this.options.speedMultiplier;
          } else if (scrollLeft > maxScrollLeft) {
            scrollLeft = maxScrollLeft;
          } else {
            scrollLeft = 0;
          }
        }
      }

      // Compute new vertical scroll position
      if (me.__enableScrollY) {
        scrollTop -= moveY * this.options.speedMultiplier;
        const maxScrollTop = me.__maxScrollTop;

        if (scrollTop > maxScrollTop || scrollTop < 0) {
          // Slow down on the edges
          if (me.options.bouncing) {
            scrollTop += moveY / 2 * this.options.speedMultiplier;

            // Support pull-to-refresh (only when only y is scrollable)
            if (!me.__enableScrollX && me.__refreshHeight != null) {
              if (!me.__refreshActive && scrollTop <= -me.__refreshHeight) {
                me.__refreshActive = true;
                if (me.__refreshActivate) {
                  me.__refreshActivate();
                }
              } else if (me.__refreshActive && scrollTop > -me.__refreshHeight) {
                me.__refreshActive = false;
                if (me.__refreshDeactivate) {
                  me.__refreshDeactivate();
                }
              }
            }
          } else if (scrollTop > maxScrollTop) {
            scrollTop = maxScrollTop;
          } else {
            scrollTop = 0;
          }
        }
      }

      // Keep list from growing infinitely (holding min 10, max 20 measure points)
      if (positions.length > 60) {
        positions.splice(0, 30);
      }

      // Track scroll movement for decleration
      positions.push(scrollLeft, scrollTop, timeStamp);

      // Sync scroll position
      me.__publish(scrollLeft, scrollTop, level);

      // Otherwise figure out whether we are switching into dragging mode now.
    } else {
      const minimumTrackingForScroll = me.options.locking ? 3 : 0;
      const minimumTrackingForDrag = 5;

      const distanceX = Math.abs(currentTouchLeft - me.__initialTouchLeft);
      const distanceY = Math.abs(currentTouchTop - me.__initialTouchTop);

      me.__enableScrollX = me.options.scrollingX && distanceX >= minimumTrackingForScroll;
      me.__enableScrollY = me.options.scrollingY && distanceY >= minimumTrackingForScroll;

      positions.push(me.__scrollLeft, me.__scrollTop, timeStamp);

      me.__isDragging =
        (me.__enableScrollX || me.__enableScrollY) &&
        (distanceX >= minimumTrackingForDrag || distanceY >= minimumTrackingForDrag);
      if (me.__isDragging) {
        me.__interruptedAnimation = false;
      }
    }

    // Update last touch positions and time stamp for next event
    me.__lastTouchLeft = currentTouchLeft;
    me.__lastTouchTop = currentTouchTop;
    me.__lastTouchMove = timeStamp;
    me.__lastScale = scale;
  },

  /**
   * Touch end handler for scrolling support
   */
  doTouchEnd: function(timeStamp) {
    if (timeStamp instanceof Date) {
      timeStamp = timeStamp.valueOf();
    }
    if (typeof timeStamp !== 'number') {
      throw new Error(`Invalid timestamp value: ${timeStamp}`);
    }

    const me = this;

    // Ignore event when tracking is not enabled (no touchstart event on element)
    // This is required as this listener ('touchmove') sits on the document and not on the element itme.
    if (!me.__isTracking) {
      return;
    }

    // Not touching anymore (when two finger hit the screen there are two touch end events)
    me.__isTracking = false;

    // Be sure to reset the dragging flag now. Here we also detect whether
    // the finger has moved fast enough to switch into a deceleration animation.
    if (me.__isDragging) {
      // Reset dragging flag
      me.__isDragging = false;

      // Start deceleration
      // Verify that the last move detected was in some relevant time frame
      if (me.__isSingleTouch && me.options.animating && timeStamp - me.__lastTouchMove <= 100) {
        // Then figure out what the scroll position was about 100ms ago
        const positions = me.__positions;
        const endPos = positions.length - 1;
        let startPos = endPos;

        // Move pointer to position measured 100ms ago
        for (let i = endPos; i > 0 && positions[i] > me.__lastTouchMove - 100; i -= 3) {
          startPos = i;
        }

        // If start and stop position is identical in a 100ms timeframe,
        // we cannot compute any useful deceleration.
        if (startPos !== endPos) {
          // Compute relative movement between these two points
          const timeOffset = positions[endPos] - positions[startPos];
          const movedLeft = me.__scrollLeft - positions[startPos - 2];
          const movedTop = me.__scrollTop - positions[startPos - 1];

          // Based on 50ms compute the movement to apply for each render step
          me.__decelerationVelocityX = movedLeft / timeOffset * (1000 / 60);
          me.__decelerationVelocityY = movedTop / timeOffset * (1000 / 60);

          // How much velocity is required to start the deceleration
          const minVelocityToStartDeceleration = me.options.paging || me.options.snapping ? 4 : 1;

          // Verify that we have enough velocity to start deceleration
          if (
            Math.abs(me.__decelerationVelocityX) > minVelocityToStartDeceleration ||
            Math.abs(me.__decelerationVelocityY) > minVelocityToStartDeceleration
          ) {
            // Deactivate pull-to-refresh when decelerating
            if (!me.__refreshActive) {
              me.__startDeceleration(timeStamp);
            }
          } else {
            me.options.scrollingComplete();
          }
        } else {
          me.options.scrollingComplete();
        }
      } else if (timeStamp - me.__lastTouchMove > 100) {
        me.options.scrollingComplete();
      }
    }

    // If this was a slower move it is per default non decelerated, but this
    // still means that we want snap back to the bounds which is done here.
    // This is placed outside the condition above to improve edge case stability
    // e.g. touchend fired without enabled dragging. This should normally do not
    // have modified the scroll positions or even showed the scrollbars though.
    if (!me.__isDecelerating) {
      if (me.__refreshActive && me.__refreshStart) {
        // Use publish instead of scrollTo to allow scrolling to out of boundary position
        // We don't need to normalize scrollLeft, zoomLevel, etc. here because we only y-scrolling when pull-to-refresh is enabled
        me.__publish(me.__scrollLeft, -me.__refreshHeight, me.__zoomLevel, true);

        if (me.__refreshStart) {
          me.__refreshStart();
        }
      } else {
        if (me.__interruptedAnimation || me.__isDragging) {
          me.options.scrollingComplete();
        }
        me.scrollTo(me.__scrollLeft, me.__scrollTop, true, me.__zoomLevel);

        // Directly signalize deactivation (nothing todo on refresh?)
        if (me.__refreshActive) {
          me.__refreshActive = false;
          if (me.__refreshDeactivate) {
            me.__refreshDeactivate();
          }
        }
      }
    }

    // Fully cleanup list
    me.__positions.length = 0;
  },

  /*
    ---------------------------------------------------------------------------
        PRIVATE API
    ---------------------------------------------------------------------------
    */

  /**
   * Applies the scroll position to the content element
   *
   * @param left {Number} Left scroll position
   * @param top {Number} Top scroll position
   * @param animate {Boolean?false} Whether animation should be used to move to the new coordinates
   */
  __publish: function(left, top, zoom, animate) {
    const me = this;

    // Remember whether we had an animation, then we try to continue based on the current "drive" of the animation
    const wasAnimating = me.__isAnimating;
    if (wasAnimating) {
      Animate.stop(wasAnimating);
      me.__isAnimating = false;
    }

    if (animate && me.options.animating) {
      // Keep scheduled positions for scrollBy/zoomBy functionality
      me.__scheduledLeft = left;
      me.__scheduledTop = top;
      me.__scheduledZoom = zoom;

      const oldLeft = me.__scrollLeft;
      const oldTop = me.__scrollTop;
      const oldZoom = me.__zoomLevel;

      const diffLeft = left - oldLeft;
      const diffTop = top - oldTop;
      const diffZoom = zoom - oldZoom;

      const step = function(percent, now, render) {
        if (render) {
          me.__scrollLeft = oldLeft + diffLeft * percent;
          me.__scrollTop = oldTop + diffTop * percent;
          me.__zoomLevel = oldZoom + diffZoom * percent;

          // Push values out
          if (me.__callback) {
            me.__callback(me.__scrollLeft, me.__scrollTop, me.__zoomLevel);
          }
        }
      };

      const verify = function(id) {
        return me.__isAnimating === id;
      };

      const completed = function(renderedFramesPerSecond, animationId, wasFinished) {
        if (animationId === me.__isAnimating) {
          me.__isAnimating = false;
        }
        if (me.__didDecelerationComplete || wasFinished) {
          me.options.scrollingComplete();
        }

        if (me.options.zooming) {
          me.__computeScrollMax();
          if (me.__zoomComplete) {
            me.__zoomComplete();
            me.__zoomComplete = null;
          }
        }
      };

      // When continuing based on previous animation we choose an ease-out animation instead of ease-in-out
      me.__isAnimating = Animate.start(
        step,
        verify,
        completed,
        me.options.animationDuration,
        wasAnimating ? easeOutCubic : easeInOutCubic
      );
    } else {
      me.__scheduledLeft = me.__scrollLeft = left;
      me.__scheduledTop = me.__scrollTop = top;
      me.__scheduledZoom = me.__zoomLevel = zoom;

      // Push values out
      if (me.__callback) {
        me.__callback(left, top, zoom);
      }

      // Fix max scroll ranges
      if (me.options.zooming) {
        me.__computeScrollMax();
        if (me.__zoomComplete) {
          me.__zoomComplete();
          me.__zoomComplete = null;
        }
      }
    }
  },

  /**
   * Recomputes scroll minimum values based on client dimensions and content dimensions.
   */
  __computeScrollMax: function(zoomLevel) {
    const me = this;

    if (zoomLevel == null) {
      zoomLevel = me.__zoomLevel;
    }

    me.__maxScrollLeft = Math.max(me.__contentWidth * zoomLevel - me.__clientWidth, 0);
    me.__maxScrollTop = Math.max(me.__contentHeight * zoomLevel - me.__clientHeight, 0);
  },

  /*
    ---------------------------------------------------------------------------
        ANIMATION (DECELERATION) SUPPORT
    ---------------------------------------------------------------------------
    */

  /**
   * Called when a touch sequence end and the speed of the finger was high enough
   * to switch into deceleration mode.
   */
  __startDeceleration: function(timeStamp) {
    const me = this;

    if (me.options.paging) {
      const scrollLeft = Math.max(Math.min(me.__scrollLeft, me.__maxScrollLeft), 0);
      const scrollTop = Math.max(Math.min(me.__scrollTop, me.__maxScrollTop), 0);
      const clientWidth = me.__clientWidth;
      const clientHeight = me.__clientHeight;

      // We limit deceleration not to the min/max values of the allowed range, but to the size of the visible client area.
      // Each page should have exactly the size of the client area.
      me.__minDecelerationScrollLeft = Math.floor(scrollLeft / clientWidth) * clientWidth;
      me.__minDecelerationScrollTop = Math.floor(scrollTop / clientHeight) * clientHeight;
      me.__maxDecelerationScrollLeft = Math.ceil(scrollLeft / clientWidth) * clientWidth;
      me.__maxDecelerationScrollTop = Math.ceil(scrollTop / clientHeight) * clientHeight;
    } else {
      me.__minDecelerationScrollLeft = 0;
      me.__minDecelerationScrollTop = 0;
      me.__maxDecelerationScrollLeft = me.__maxScrollLeft;
      me.__maxDecelerationScrollTop = me.__maxScrollTop;
    }

    // Wrap class method
    const step = function(percent, now, render) {
      me.__stepThroughDeceleration(render);
    };

    // How much velocity is required to keep the deceleration running
    const minVelocityToKeepDecelerating = me.options.snapping ? 4 : 0.001;

    // Detect whether it's still worth to continue animating steps
    // If we are already slow enough to not being user perceivable anymore, we stop the whole process here.
    const verify = function() {
      const shouldContinue =
        Math.abs(me.__decelerationVelocityX) >= minVelocityToKeepDecelerating ||
        Math.abs(me.__decelerationVelocityY) >= minVelocityToKeepDecelerating;
      if (!shouldContinue) {
        me.__didDecelerationComplete = true;
      }
      return shouldContinue;
    };

    const completed = function(renderedFramesPerSecond, animationId, wasFinished) {
      me.__isDecelerating = false;
      if (me.__didDecelerationComplete) {
        me.options.scrollingComplete();
      }

      // Animate to grid when snapping is active, otherwise just fix out-of-boundary positions
      me.scrollTo(me.__scrollLeft, me.__scrollTop, me.options.snapping);
    };

    // Start animation and switch on flag
    me.__isDecelerating = Animate.start(step, verify, completed);
  },

  /**
   * Called on every step of the animation
   *
   * @param inMemory {Boolean?false} Whether to not render the current step, but keep it in memory only. Used internally only!
   */
  __stepThroughDeceleration: function(render) {
    const me = this;

    //
    // COMPUTE NEXT SCROLL POSITION
    //

    // Add deceleration to scroll position
    let scrollLeft = me.__scrollLeft + me.__decelerationVelocityX;
    let scrollTop = me.__scrollTop + me.__decelerationVelocityY;

    //
    // HARD LIMIT SCROLL POSITION FOR NON BOUNCING MODE
    //

    if (!me.options.bouncing) {
      const scrollLeftFixed = Math.max(
        Math.min(me.__maxDecelerationScrollLeft, scrollLeft),
        me.__minDecelerationScrollLeft
      );
      if (scrollLeftFixed !== scrollLeft) {
        scrollLeft = scrollLeftFixed;
        me.__decelerationVelocityX = 0;
      }

      const scrollTopFixed = Math.max(
        Math.min(me.__maxDecelerationScrollTop, scrollTop),
        me.__minDecelerationScrollTop
      );
      if (scrollTopFixed !== scrollTop) {
        scrollTop = scrollTopFixed;
        me.__decelerationVelocityY = 0;
      }
    }

    //
    // UPDATE SCROLL POSITION
    //

    if (render) {
      me.__publish(scrollLeft, scrollTop, me.__zoomLevel);
    } else {
      me.__scrollLeft = scrollLeft;
      me.__scrollTop = scrollTop;
    }

    //
    // SLOW DOWN
    //

    // Slow down velocity on every iteration
    if (!me.options.paging) {
      // This is the factor applied to every iteration of the animation
      // to slow down the process. This should emulate natural behavior where
      // objects slow down when the initiator of the movement is removed
      const frictionFactor = 0.95;

      me.__decelerationVelocityX *= frictionFactor;
      me.__decelerationVelocityY *= frictionFactor;
    }

    //
    // BOUNCING SUPPORT
    //

    if (me.options.bouncing) {
      let scrollOutsideX = 0;
      let scrollOutsideY = 0;

      // This configures the amount of change applied to deceleration/acceleration when reaching boundaries
      const { penetrationDeceleration, penetrationAcceleration } = me.options;

      // Check limits
      if (scrollLeft < me.__minDecelerationScrollLeft) {
        scrollOutsideX = me.__minDecelerationScrollLeft - scrollLeft;
      } else if (scrollLeft > me.__maxDecelerationScrollLeft) {
        scrollOutsideX = me.__maxDecelerationScrollLeft - scrollLeft;
      }

      if (scrollTop < me.__minDecelerationScrollTop) {
        scrollOutsideY = me.__minDecelerationScrollTop - scrollTop;
      } else if (scrollTop > me.__maxDecelerationScrollTop) {
        scrollOutsideY = me.__maxDecelerationScrollTop - scrollTop;
      }

      // Slow down until slow enough, then flip back to snap position
      if (scrollOutsideX !== 0) {
        if (scrollOutsideX * me.__decelerationVelocityX <= 0) {
          me.__decelerationVelocityX += scrollOutsideX * penetrationDeceleration;
        } else {
          me.__decelerationVelocityX = scrollOutsideX * penetrationAcceleration;
        }
      }

      if (scrollOutsideY !== 0) {
        if (scrollOutsideY * me.__decelerationVelocityY <= 0) {
          me.__decelerationVelocityY += scrollOutsideY * penetrationDeceleration;
        } else {
          me.__decelerationVelocityY = scrollOutsideY * penetrationAcceleration;
        }
      }
    }
  }
};

// Copy over members to prototype
for (const key in members) {
  if (Object.prototype.hasOwnProperty.call(members, key)) {
    Scroller.prototype[key] = members[key];
  }
}

var tpl$7 = '<div class="lmui-picker <%=containerClass%>"> <div class=lmui-picker-indicator> <div class=lmui-picker-group> <% for(var i = 0; i < data.length; i++) { %> <div class=lmui-picker-item> <%=data[i].text%> </div> <% } %> </div> </div> <div class=lmui-picker-mask></div> </div> ';

const defaultOptions$8 = {
  // 外包容器class
  containerClass: 'lmui-picker-container',
  // 是否支持横向滚动
  scrollingX: false,
  // 是否支持竖向滚动
  scrollingY: true,
  // 是否开启补间动画（减速，回弹，缩放和滚动动画）
  animating: true,
  // 动画时长
  animationDuration: 250,
  // 是否开启弹性（无弹性不下拉刷新）
  bouncing: true,
  // 是否锁定（如果用户在开始时只轻微移动其中一个，则启用锁定到主轴）
  locking: true,
  // 是否启用翻页模式类似于轮播图
  paging: true,
  // 是否捕捉用户可用的整数像素值
  snapping: true,
  // 是否开启缩放功能
  zooming: false,
  // 缩放最小值
  minZoom: 0.5,
  // 缩放最大值
  maxZoom: 3,
  // 数据
  data: [],
  // 默认被选中的index
  defaultIndex: 0
};

const classOptions$9 = {
  className: 'Picker',
  events: ['onChange'],
  template: tpl$7
};

class Picker extends BaseView {
  constructor(options) {
    options = mergeOptions(assign(defaultOptions$8, classOptions$9), options);
    super(options);
  }

  aferRender() {
    const { $options } = this;
    const { defaultIndex, data } = $options;
    this.indicator = this.element.firstElementChild;
    this.group = this.indicator.firstElementChild;
    this.group.style[`${vendorPrefix}TransformOrigin`] = 'left top';
    $options.scrollingComplete = () => {
      const { top } = this.scrollerCore.getValues();
      const height = this.indicator.clientHeight;
      if (top % height === 0) {
        const index = parseInt(top / height, 10);
        if (this.currentIndex !== index) {
          this.currentIndex = index;
          this.dispatch('onChange', index, data[index]);
        }
      }
    };
    this.scrollerCore = new Scroller((left, top, zoom) => {
      renderScroll(this.group, left, top, zoom);
    }, $options);
    this._initEvent();
    this.reflow();
    this.setCurrent(defaultIndex);
  }

  _initEvent() {
    window.addEventListener(
      'resize',
      () => {
        this.reflow();
      },
      false
    );
    // touch devices bind touch events
    if ('ontouchstart' in window) {
      this.element.addEventListener(
        'touchstart',
        (e) => {
          // Don't react if initial down happens on a form element
          if (e.touches[0] && e.touches[0].target && e.touches[0].target.tagName.match(/input|textarea|select/i)) {
            return;
          }
          // reflow since the element may have changed
          this.reflow();
          this.scrollerCore.doTouchStart(e.touches, e.timeStamp);
        },
        false
      );
      this.element.addEventListener(
        'touchmove',
        (e) => {
          e.preventDefault();
          this.scrollerCore.doTouchMove(e.touches, e.timeStamp, e.scale);
        },
        false
      );
      this.element.addEventListener(
        'touchend',
        (e) => {
          this.scrollerCore.doTouchEnd(e.timeStamp);
        },
        false
      );
      this.element.addEventListener(
        'touchcancel',
        (e) => {
          this.scrollerCore.doTouchEnd(e.timeStamp);
        },
        false
      );
      // non-touch bind mouse events
    } else {
      let mousedown = false;
      this.element.addEventListener(
        'mousedown',
        (e) => {
          if (e.target.tagName.match(/input|textarea|select/i)) {
            return;
          }
          this.scrollerCore.doTouchStart(
            [
              {
                pageX: e.pageX,
                pageY: e.pageY
              }
            ],
            e.timeStamp
          );
          mousedown = true;
          // reflow since the element may have changed
          this.reflow();
          e.preventDefault();
        },
        false
      );
      document.addEventListener(
        'mousemove',
        (e) => {
          if (!mousedown) {
            return;
          }
          this.scrollerCore.doTouchMove(
            [
              {
                pageX: e.pageX,
                pageY: e.pageY
              }
            ],
            e.timeStamp
          );
          mousedown = true;
        },
        false
      );
      document.addEventListener(
        'mouseup',
        (e) => {
          if (!mousedown) {
            return;
          }
          this.scrollerCore.doTouchEnd(e.timeStamp);
          mousedown = false;
        },
        false
      );
      this.element.addEventListener(
        'mousewheel',
        (e) => {
          if (this.zooming) {
            this.scrollerCore.doMouseZoom(e.wheelDelta, e.timeStamp, e.pageX, e.pageY);
            e.preventDefault();
          }
        },
        false
      );
    }
  }

  reflow() {
    // set the right scroller dimensions
    this.scrollerCore.setDimensions(
      this.indicator.clientWidth,
      this.indicator.clientHeight,
      this.group.offsetWidth,
      this.group.offsetHeight
    );
    // refresh the position for zooming purposes
    const rect = this.indicator.getBoundingClientRect();
    this.scrollerCore.setPosition(rect.left + this.indicator.clientLeft, rect.top + this.indicator.clientTop);
  }

  setCurrent(index) {
    const { $options } = this;
    const { data } = $options;
    const size = data.length || 0;
    if (index >= 0 && index < size && this.currentIndex !== index) {
      const height = this.indicator.clientHeight;
      this.scrollerCore.scrollTo(0, height * index);
      this.currentIndex = index;
      this.dispatch('onChange', index, data[index]);
    }
  }

  setData(data) {
    this.data = data;
    const htmls = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      htmls.push(`<div class="lmui-picker-item">${item.text}</div>`);
    }
    this.group.innerHTML = htmls.join('');
    this.reflow();
  }
}

var tpl$8 = '<div class=lmui-popover-root> <div class="lmui-popover lmui-popover-<%=placement%> <%=containerClass%>"> <div class=lmui-popover-content> <div class=lmui-popover-arrow></div> <div class=lmui-popover-inner> <%=content%> </div> </div> </div> </div> ';

const defaultOptions$9 = {
  // 目标元素dom
  target: null,
  // 触发行为 hover focus click
  action: 'hover',
  // distance 根元素具体target的距离
  distance: 4,
  // 是否默认打开
  autoOpen: false,
  // 外包容器class
  containerClass: 'lmui-popover-normal',
  // 位置 top left right bottom topLeft topRight bottomLeft bottomRight leftTop leftBottom rightTop rightBottom
  placement: 'top',
  // 长度
  width: 'auto',
  // 宽度
  height: 'auto',
  // 弹出内容
  content: '',
  // 关闭class
  closeClass: 'close',
  // 是否是模态
  modal: false,
  // 模态关闭
  backClose: false,
  // overlay的zIndex固定
  fixOverlay: true,
  // 是否关闭时销毁
  destoryOnClose: false
};

const classOptions$10 = {
  className: 'Popover',
  template: tpl$8
};

class Popover extends Popbase {
  constructor(options) {
    options = mergeOptions(assign(defaultOptions$9, classOptions$10), options);
    super(options);
  }

  aferRender() {
    // const { element } = this;
    this.el = this.element;
    this.element = this.element.firstElementChild;
    const { $options } = this;
    const { target, action } = $options;
    if (action === 'click') {
      target.addEventListener(
        'click',
        (e) => {
          this.open();
        },
        false
      );
      window.addEventListener(
        'click',
        (e) => {
          if (e.target !== target) {
            this.close();
          }
        },
        false
      );
    } else if (action === 'focus') {
      target.addEventListener(
        'focus',
        (e) => {
          this.open();
        },
        false
      );
      target.addEventListener(
        'blur',
        (e) => {
          this.close();
        },
        false
      );
    } else {
      target.addEventListener(
        'mouseenter',
        (e) => {
          this.open();
        },
        false
      );
      target.addEventListener(
        'mouseleave',
        (e) => {
          this.close();
        },
        false
      );
    }
  }

  _position() {
    const { $options, element } = this;
    const { placement, distance, target } = $options;
    const targetRect = target.getClientRects()[0];
    const elementRect = element.getClientRects()[0];
    if (placement.indexOf('right') === 0) {
      element.style.left = `${targetRect.right + distance}px`;
      element.style.top = `${targetRect.top + targetRect.height / 2}px`;
    } else if (placement.indexOf('bottom') === 0) {
      element.style.left = `${targetRect.left + targetRect.width / 2}px`;
      element.style.top = `${targetRect.top + targetRect.height + distance}px`;
    } else if (placement.indexOf('left') === 0) {
      element.style.left = `${targetRect.left - elementRect.width - distance}px`;
      element.style.top = `${targetRect.top + targetRect.height / 2}px`;
    } else {
      // top
      element.style.left = `${targetRect.left + targetRect.width / 2}px`;
      element.style.top = `${targetRect.top - elementRect.height - distance}px`;
    }
  }

  _onOpen() {
    const { $options, element } = this;
    const { placement } = $options;
    this._position();
    addClass(element, `lmui-popover-${placement}-enter`);
  }

  _onClose() {
    const { $options, element } = this;
    const { placement } = $options;
    removeClass(element, `lmui-popover-${placement}-enter`);
  }
}

var tpl$9 = '<div class="lmui-radiolist <%=containerClass%>"> <% if (title) { %> <label class=lmui-radiolist-title><%=title%></label> <% } %> <% for (var i = 0; i < data.length; i++) { %> <a class=lmui-cell> <div class=lmui-cell-left></div> <div class=lmui-cell-wrapper> <div class=lmui-cell-title> <label class=lmui-radiolist-label> <span class=lmui-radio> <input type=radio class=lmui-radio-input value="<%=data[i].value%>" data-index="<%=i%>" <% if(data[i].disabled) { %> disabled=disabled <% } %> <% if(data[i].checked) { %> checked=true <% } %> > <span class=lmui-radio-core></span> </span> <span class=lmui-radio-label><%=data[i].label%></span> </label> </div> <div class=lmui-cell-value> <span></span> </div> </div> <div class=lmui-cell-right></div> </a> <% } %> </div> ';

const defaultOptions$10 = {
  // 外包容器class
  containerClass: 'lmui-radioList',
  title: '',
  data: null // { label: 'label', value: 'value', disabled: false, checked: true }
};

const classOptions$11 = {
  className: 'RadioList',
  events: ['onChange'],
  template: tpl$9,
  on: [
    {
      name: 'change',
      handler: 'handleChange',
      target: 'element'
    }
  ],
  currentValue: []
};

class CheckList$1 extends BaseView {
  constructor(options) {
    options = mergeOptions(assign({}, defaultOptions$10, classOptions$11), options);
    super(options);
  }

  aferRender() {
    const { element } = this;
    this.forms = toArray(element.getElementsByTagName('input'));
    this.setData();
  }

  setData(newDate) {
    const { $options, forms, _uid } = this;
    let { data } = $options;
    if (newDate) {
      data = newDate;
    }
    this.formDate = null;
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const form = forms[i];
      form.name = _uid;
      form.disabled = item.disabled;
      form.value = item.value;
      if (!this.formDate && item.checked) {
        form.checked = item.checked;
        this.formData = assign({}, item);
      } else {
        form.checked = item.checked = false;
      }
    }
    this.dispatch('onChange', assign({}, this.formDate));
  }

  handleChange(event) {
    const { checked, disabled, value } = event.target;
    const { $options } = this;
    const { data } = $options;
    const index = parseInt(event.target.dataset.index, 10);
    const item = data[index];
    item.checked = checked;
    item.disabled = disabled;
    item.value = value;
    this.formData = assign({}, item);
    this.dispatch('onChange', assign({}, this.formData));
  }
}

var tpl$10 = '<div class=lmui-scroller> <div class=lmui-scroller-container> <div class=lmui-scroller-refresh style="height:<%=pullToRefreshHeight%>px;margin-top:-<%=pullToRefreshHeight%>px"> <%=refreshContent%> </div> <div class=lmui-scroller-content> <%=content%> </div> </div> </div> ';

const defaultOptions$11 = {
  // 外包容器
  el: document.body,
  // 滚动内容
  content: '',
  // 下拉刷新容器文案
  refreshContent: '下拉刷新',
  // 是否支持横向滚动
  scrollingX: false,
  // 是否支持竖向滚动
  scrollingY: true,
  // 是否开启补间动画（减速，回弹，缩放和滚动动画）
  animating: true,
  // 动画时长
  animationDuration: 250,
  // 是否开启弹性（无弹性不下拉刷新）
  bouncing: true,
  // 是否锁定（如果用户在开始时只轻微移动其中一个，则启用锁定到主轴）
  locking: true,
  // 是否启用翻页模式类似于轮播图
  paging: false,
  // 是否捕捉用户可用的整数像素值
  snapping: false,
  // 是否开启缩放功能
  zooming: false,
  // 缩放最小值
  minZoom: 0.5,
  // 缩放最大值
  maxZoom: 3,
  // 启用下拉刷新
  pullToRefresh: false,
  // 下拉刷新高度（像素）
  pullToRefreshHeight: 50
};

const classOptions$12 = {
  className: 'Scroller',
  events: ['onScroll', 'onScrollOver', 'onRefreshLess', 'onRefresh', 'onRefreshMore'],
  template: tpl$10
};

class Scroller$1 extends BaseView {
  constructor(options) {
    options = mergeOptions(assign(defaultOptions$11, classOptions$12), options);
    super(options);
  }

  aferRender() {
    const { $options } = this;
    const { pullToRefresh, pullToRefreshHeight } = $options;
    this.container = this.element.firstElementChild;
    [this.refresh, this.content] = this.container.children;
    this.content.style[`${vendorPrefix}TransformOrigin`] = 'left top';
    this.scrollerCore = new Scroller((left, top, zoom) => {
      this.dispatch('onScroll', left, top, zoom);
      renderScroll(this.container, left, top, zoom);
    }, $options);
    if (pullToRefresh) {
      this.scrollerCore.activatePullToRefresh(
        pullToRefreshHeight,
        () => {
          this.dispatch('onRefreshMore');
        },
        () => {
          this.dispatch('onRefreshLess');
        },
        () => {
          this.dispatch('onRefresh');
        }
      );
    }
    this._initEvent();
    this.reflow();
  }

  _initEvent() {
    const { element } = this;
    // reflow handling
    window.addEventListener(
      'resize',
      () => {
        this.reflow();
      },
      false
    );
    // touch devices bind touch events
    if ('ontouchstart' in window) {
      element.addEventListener(
        'touchstart',
        (e) => {
          // Don't react if initial down happens on a form element
          if (e.touches[0] && e.touches[0].target && e.touches[0].target.tagName.match(/input|textarea|select/i)) {
            return;
          }
          // reflow since the container may have changed
          this.reflow();
          this.scrollerCore.doTouchStart(e.touches, e.timeStamp);
        },
        false
      );
      element.addEventListener(
        'touchmove',
        (e) => {
          e.preventDefault();
          this.scrollerCore.doTouchMove(e.touches, e.timeStamp, e.scale);
        },
        false
      );
      element.addEventListener(
        'touchend',
        (e) => {
          this.scrollerCore.doTouchEnd(e.timeStamp);
        },
        false
      );
      element.addEventListener(
        'touchcancel',
        (e) => {
          this.scrollerCore.doTouchEnd(e.timeStamp);
        },
        false
      );
      // non-touch bind mouse events
    } else {
      let mousedown = false;
      element.addEventListener(
        'mousedown',
        (e) => {
          if (e.target.tagName.match(/input|textarea|select/i)) {
            return;
          }
          this.scrollerCore.doTouchStart(
            [
              {
                pageX: e.pageX,
                pageY: e.pageY
              }
            ],
            e.timeStamp
          );
          mousedown = true;
          // reflow since the container may have changed
          this.reflow();
          e.preventDefault();
        },
        false
      );
      document.addEventListener(
        'mousemove',
        (e) => {
          if (!mousedown) {
            return;
          }
          this.scrollerCore.doTouchMove(
            [
              {
                pageX: e.pageX,
                pageY: e.pageY
              }
            ],
            e.timeStamp
          );
          mousedown = true;
        },
        false
      );
      document.addEventListener(
        'mouseup',
        (e) => {
          if (!mousedown) {
            return;
          }
          this.scrollerCore.doTouchEnd(e.timeStamp);
          mousedown = false;
        },
        false
      );
      this.element.addEventListener(
        'mousewheel',
        (e) => {
          if (this.zooming) {
            this.scrollerCore.doMouseZoom(e.wheelDelta, e.timeStamp, e.pageX, e.pageY);
            e.preventDefault();
          }
        },
        false
      );
    }
  }

  finishPullToRefresh() {
    this.pullToRefresh && this.scrollerCore.finishPullToRefresh();
  }

  reflow() {
    const { $options, element, container } = this;
    const { pullToRefresh, pullToRefreshHeight } = $options;
    // set the right scroller dimensions
    this.scrollerCore.setDimensions(
      element.clientWidth,
      element.clientHeight,
      this.container.offsetWidth,
      pullToRefresh ? container.offsetHeight - pullToRefreshHeight : container.offsetHeight
    );
    // refresh the position for zooming purposes
    const rect = container.getBoundingClientRect();
    this.scrollerCore.setPosition(rect.left + element.clientLeft, rect.top + element.clientTop);
  }
}

var tpl$11 = '<div class=lmui-spin> <div class="lmui-spin-container <%=containerClass%> <%=type%>"> <svg class=loadding viewBox="0 0 200 200"> <circle cx=100 cy=100 r=95></circle> <g class=right> <path d=m85,132l61,-74 /> <path d=m85,132l-36,-42 /> </g> <g class=wrong> <path d=m100,100l-34,-34 /> <path d=m100,100l34,34 /> <path d=m100,100l-34,34 /> <path d=m100,100l34,-34 /> </g> </svg> </div> <p class=lmui-spin-text <% if(!text) { %> style=display:none <% } %>> <%=text%> </p> </div> ';

const defaultOptions$12 = {
  // 是否默认打开
  autoShow: true,
  // 外包容器class
  elementClass: 'lmui-spin-normal',
  // overlay的zIndex固定
  fixOverlay: true,
  // 说明文案
  text: '',
  // 类型
  type: ''
};

const classOptions$13 = {
  className: 'Spin',
  template: tpl$11
};

class Spin extends Popbase {
  constructor(options) {
    options = mergeOptions(assign(defaultOptions$12, classOptions$13), options);
    super(options);
  }

  _onOpen() {
    this.transition = true;
    addClass(this.element, 'lmui-spin-enter');
    window.setTimeout(() => {
      this.transition = false;
      this._doAfterOpen();
    }, 300);
  }

  _onClose() {
    this.transition = true;
    removeClass(this.element, 'lmui-spin-enter');
    window.setTimeout(() => {
      this.transition = false;
      this._doAfterClose();
    }, 300);
  }

  setType(type) {
    addClass(this.element.firstElementChild, type);
    removeClass(this.element.firstElementChild, this.type);
    this.type = type;
  }

  setText(text) {
    if (text) {
      this.element.lastElementChild.style.display = 'block';
    } else {
      this.element.lastElementChild.style.display = 'none';
    }
    this.element.lastElementChild.innerHTML = text;
    this.text = text;
  }
}

var tpl$12 = '<label class=lmui-switch> <input type=checkbox class=lmui-switch-input <% if(data.disabled) { %> disabled=disabled <% } %> <% if(data.checked) { %> checked=true <% } %> > <span class=lmui-switch-core></span> <div class=lmui-switch-label> <label>false</label> </div> </label> ';

const defaultOptions$13 = {
  // 外包容器class
  containerClass: 'lmui-switch',
  title: '',
  data: { disabled: false, checked: false } // { label: 'label', value: 'value', disabled: false, checked: true }
};

const classOptions$14 = {
  className: 'Switch',
  events: ['onChange'],
  template: tpl$12,
  on: [
    {
      name: 'change',
      handler: 'handleChange',
      target: 'element'
    }
  ]
};

class Switch extends BaseView {
  constructor(options) {
    options = mergeOptions(assign({}, defaultOptions$13, classOptions$14), options);
    super(options);
  }

  aferRender() {
    const { element, $options } = this;
    const { data } = $options;
    this.forms = toArray(element.getElementsByTagName('input'));
    this.setData(data);
  }

  handleChange(event) {
    const { checked, disabled } = event.target;
    const { formData } = this;
    formData.checked = checked;
    formData.disabled = disabled;
    this.dispatch('onChange', assign({}, formData));
  }

  setData(data) {
    const { $options, forms } = this;
    const [form] = forms;
    $options.data = data;
    form.disabled = data.disabled;
    form.checked = data.checked;
    this.formData = assign({}, data);
    this.dispatch('onChange', assign({}, this.formData));
  }
}

var tpl$13 = '<div class=lmui-tooltip-root> <div class="lmui-tooltip lmui-tooltip-<%=placement%> <%=containerClass%>"> <div class=lmui-tooltip-content> <div class=lmui-tooltip-arrow></div> <div class=lmui-tooltip-inner> <%=content%> </div> </div> </div> </div> ';

const defaultOptions$14 = {
  // 外包容器class
  containerClass: 'lmui-tooltip-normal'
};

const classOptions$15 = {
  className: 'Tooltip',
  template: tpl$13
};

class Tooltip extends Popover {
  constructor(options) {
    options = mergeOptions(assign(defaultOptions$14, classOptions$15), options);
    super(options);
  }

  _onOpen() {
    const { $options, element } = this;
    const { placement } = $options;
    this._position();
    addClass(element, `lmui-tooltip-${placement}-enter`);
  }

  _onClose() {
    const { $options, element } = this;
    const { placement } = $options;
    removeClass(element, `lmui-tooltip-${placement}-enter`);
  }
}

var index = {
  Actionsheet: Actionsheet,
  Button: Button,
  CheckList: CheckList,
  ContentLoader: ContentLoader,
  Dialog: Dialog,
  Picker: Picker,
  Popover: Popover,
  Popup: Popup,
  RadioList: CheckList$1,
  Header: Header,
  Scroller: Scroller$1,
  Spin: Spin,
  Switch: Switch,
  Tooltip: Tooltip,
  instanceManager: instanceManager,
  toast: function(content, timeout, callback, config) {
    if (Object.prototype.toString.call(timeout) === '[object Function]') {
      config = callback;
      callback = timeout;
      timeout = null;
    }
    config = config || {};
    const defaultOption = {
      // width: '85%',
      containerClass: 'lmui-toast',
      content: content,
      timeout: +timeout || 2000,
      button: []
    };
    return new Dialog(assign(defaultOption, config)).onClose(callback);
  },
  alert: function(content, button, config) {
    config = config || {};
    const defaultOption = {
      width: '85%',
      containerClass: 'lmui-alert',
      content: content,
      button: button || ['~我知道了']
    };
    return new Dialog(assign(defaultOption, config));
  }
};

export default index;

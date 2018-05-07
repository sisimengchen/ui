/**
 * @namespace
 * @name ClassManager
 */
import { mergeOptions, remove, findOne, render, parseDom, query, addDOMListeners } from '@util';

let uid = 0;
/**
 * 一个对象类管理器，将所有instance按照list方式管理
 */
export class InstanceManager {
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

export const instanceManager = new InstanceManager();

/**
 * 基础Class
 */
export class ClassBase {
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
export class EventClass extends ClassBase {
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
export class BaseView extends EventClass {
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

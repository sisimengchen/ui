'use strict';
import { mergeOptions, assign } from '@util';
import { BaseView } from '../../components/eventclass/index';
import popManager from '../../components/popmanager/index';
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

const classOptions = {
  className: 'Popbase',
  events: ['onBeforeShow', 'onShow', 'onBeforeOpen', 'onOpen', 'onBeforeClose', 'onClose']
};

export default class Popbase extends BaseView {
  constructor(options) {
    options = mergeOptions(assign({}, defaultOptions, classOptions), options);
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
    delete this;
  }
}

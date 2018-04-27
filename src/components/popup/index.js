'use strict';
import style from './index.less';
import { mergeOptions, assign, addClass, removeClass } from '@util';
import Popbase from '@components/popbase/index';
import tpl from './index.html';
const defaultOptions = {
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

const classOptions = {
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

export default class Popup extends Popbase {
  constructor(options) {
    options = mergeOptions(assign({}, defaultOptions, classOptions), options);
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

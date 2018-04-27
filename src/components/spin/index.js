'use strict';
import style from './index.less';
import { mergeOptions, assign, addClass, removeClass, render } from '@util';
import Popbase from '@components/popbase/index';
import tpl from './index.html';
const defaultOptions = {
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

const classOptions = {
  className: 'Spin',
  template: tpl
};

export default class Spin extends Popbase {
  constructor(options) {
    options = mergeOptions(assign(defaultOptions, classOptions), options);
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

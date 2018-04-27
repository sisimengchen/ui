'use strict';
import style from './index.less';
import { mergeOptions, assign, addClass, removeClass } from '@util';
import Popbase from '@components/popbase/index';
import tpl from './index.html';
const defaultOptions = {
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

const classOptions = {
  className: 'Popover',
  template: tpl
};

export default class Popover extends Popbase {
  constructor(options) {
    options = mergeOptions(assign(defaultOptions, classOptions), options);
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

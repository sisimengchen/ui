'use strict';
import style from './index.less';
import { mergeOptions, assign, addClass, removeClass } from '@util';
import Popbase from '@components/popbase/index';
import tpl from './index.html';
const defaultOptions = {
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

const classOptions = {
  className: 'Dialog',
  events: ['onBtnClick'],
  template: tpl,
  on: [
    {
      name: 'click',
      handler: 'handleBtnClick',
      target: 'element'
    }
  ]
};

export default class Dialog extends Popbase {
  constructor(options) {
    options = mergeOptions(assign({}, defaultOptions, classOptions), options);
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

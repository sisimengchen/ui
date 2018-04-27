'use strict';
import style from './index.less';
import { BaseView } from '@components/eventclass/index';
import { mergeOptions, assign } from '@util';
import tpl from './index.html';
const defaultOptions = {
  // 外包容器class
  containerClass: 'lmui-button-normal'
};

const classOptions = {
  className: 'Button',
  events: ['onButtonClick'],
  template: tpl,
  on: [
    {
      name: 'click',
      handler: 'handleButtonClick',
      target: 'element'
    }
  ]
};

export default class Button extends BaseView {
  constructor(options) {
    options = mergeOptions(assign({}, defaultOptions, classOptions), options);
    super(options);
  }

  handleButtonClick() {
    this.dispatch('onButtonClick');
  }
}

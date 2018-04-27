'use strict';
import style from './index.less';
import { mergeOptions, assign, addClass, removeClass, parseDom, render } from '@util';
import Popover from '@components/popover/index';
import tpl from './index.html';

const defaultOptions = {
  // 外包容器class
  containerClass: 'lmui-tooltip-normal'
};

const classOptions = {
  className: 'Tooltip',
  template: tpl
};

export default class Tooltip extends Popover {
  constructor(options) {
    options = mergeOptions(assign(defaultOptions, classOptions), options);
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

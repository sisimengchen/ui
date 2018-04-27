'use strict';
import style from './index.less';
import { mergeOptions, assign, render } from '@util';
import { BaseView } from '@components/eventclass/index';
import tpl from './index.html';
const defaultOptions = {
  // 外包容器
  warp: document.body,
  // 百分比
  percent: 0,
  // 内容模板函数
  format: (percent) => {
    `${percent}%`;
  }
};

const classOptions = {
  className: 'Progress'
};

export default class Progress extends BaseView {
  constructor(options) {
    options = mergeOptions(assign(defaultOptions, classOptions), options);
    super(options);
  }

  _initDom() {
    this.container = document.createElement('div');
    this.container.className = 'lmui-progress';
    this.container.innerHTML = render(tpl, this);
    this.warp.appendChild(this.container);
  }

  setPercent(percent) {
    this.percent = percent;
  }
}

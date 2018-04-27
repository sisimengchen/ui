'use strict';
// import style from './index.less';
import { BaseView } from '@components/eventclass/index';
import { mergeOptions, assign } from '@util';
import tpl from './index.html';
const defaultOptions = {
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

const classOptions = {
  className: 'ContentLoader',
  template: tpl
};

export default class ContentLoader extends BaseView {
  constructor(options) {
    options = mergeOptions(assign({}, defaultOptions, classOptions), options);
    super(options);
  }
}

'use strict';
// import baseStyle from '../../style/base.less';
import style from './index.less';
import { mergeOptions, assign, render } from '@util';
import Popup from '../../components/popup/index';
import tpl from './index.html';
const defaultOptions = {
  // 外包容器class
  containerClass: 'lmui-actionsheet-normal',
  // 位置 left right top bottom
  placement: 'bottom',
  // 长度
  width: '100%',
  // 关闭class
  closeClass: 'lmui-actionsheet-item',
  // 是否是模态
  modal: true,
  // 模态关闭
  backClose: true,
  // overlay的zIndex固定
  fixOverlay: true,
  // 是否关闭时销毁
  destoryOnClose: true,
  // 配置数据
  data: [],
  // 取消按钮配置
  cancelText: '取消'
};

const classOptions = {
  className: 'Actionsheet',
  events: ['onBtnClick'],
  on: [
    {
      name: 'click',
      handler: 'handleItemClick',
      target: 'element'
    }
  ]
};

export default class Actionsheet extends Popup {
  constructor(options) {
    options = mergeOptions(assign({}, defaultOptions, classOptions), options);
    super(options);
  }

  beforeRender() {
    const { $options } = this;
    $options.content = render(tpl, $options);
  }

  handleItemClick(event) {
    const { $options } = this;
    const { data, closeClass } = $options;
    if (event.target.dataset.index) {
      const index = parseInt(event.target.dataset.index, 10);
      if (this.dispatch('onBtnClick', index, data[index]) !== false) {
        this.close();
      }
    }
    if (event.target.className.indexOf(closeClass) >= 0) {
      this.close();
      return false;
    }
  }
}

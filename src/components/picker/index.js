'use strict';
import style from './index.less';
import { BaseView } from '@components/eventclass/index';
import { mergeOptions, assign, vendorPrefix, renderScroll } from '@util';
import ScrollerCore from '../../util/scroller';
import tpl from './index.html';
const defaultOptions = {
  // 外包容器class
  containerClass: 'lmui-picker-container',
  // 是否支持横向滚动
  scrollingX: false,
  // 是否支持竖向滚动
  scrollingY: true,
  // 是否开启补间动画（减速，回弹，缩放和滚动动画）
  animating: true,
  // 动画时长
  animationDuration: 250,
  // 是否开启弹性（无弹性不下拉刷新）
  bouncing: true,
  // 是否锁定（如果用户在开始时只轻微移动其中一个，则启用锁定到主轴）
  locking: true,
  // 是否启用翻页模式类似于轮播图
  paging: true,
  // 是否捕捉用户可用的整数像素值
  snapping: true,
  // 是否开启缩放功能
  zooming: false,
  // 缩放最小值
  minZoom: 0.5,
  // 缩放最大值
  maxZoom: 3,
  // 数据
  data: [],
  // 默认被选中的index
  defaultIndex: 0
};

const classOptions = {
  className: 'Picker',
  events: ['onChange'],
  template: tpl
};

export default class Picker extends BaseView {
  constructor(options) {
    options = mergeOptions(assign(defaultOptions, classOptions), options);
    super(options);
  }

  aferRender() {
    const { $options } = this;
    const { defaultIndex, data } = $options;
    this.indicator = this.element.firstElementChild;
    this.group = this.indicator.firstElementChild;
    this.group.style[`${vendorPrefix}TransformOrigin`] = 'left top';
    $options.scrollingComplete = () => {
      const { top } = this.scrollerCore.getValues();
      const height = this.indicator.clientHeight;
      if (top % height === 0) {
        const index = parseInt(top / height, 10);
        if (this.currentIndex !== index) {
          this.currentIndex = index;
          this.dispatch('onChange', index, data[index]);
        }
      }
    };
    this.scrollerCore = new ScrollerCore((left, top, zoom) => {
      renderScroll(this.group, left, top, zoom);
    }, $options);
    this._initEvent();
    this.reflow();
    this.setCurrent(defaultIndex);
  }

  _initEvent() {
    window.addEventListener(
      'resize',
      () => {
        this.reflow();
      },
      false
    );
    // touch devices bind touch events
    if ('ontouchstart' in window) {
      this.element.addEventListener(
        'touchstart',
        (e) => {
          // Don't react if initial down happens on a form element
          if (e.touches[0] && e.touches[0].target && e.touches[0].target.tagName.match(/input|textarea|select/i)) {
            return;
          }
          // reflow since the element may have changed
          this.reflow();
          this.scrollerCore.doTouchStart(e.touches, e.timeStamp);
        },
        false
      );
      this.element.addEventListener(
        'touchmove',
        (e) => {
          e.preventDefault();
          this.scrollerCore.doTouchMove(e.touches, e.timeStamp, e.scale);
        },
        false
      );
      this.element.addEventListener(
        'touchend',
        (e) => {
          this.scrollerCore.doTouchEnd(e.timeStamp);
        },
        false
      );
      this.element.addEventListener(
        'touchcancel',
        (e) => {
          this.scrollerCore.doTouchEnd(e.timeStamp);
        },
        false
      );
      // non-touch bind mouse events
    } else {
      let mousedown = false;
      this.element.addEventListener(
        'mousedown',
        (e) => {
          if (e.target.tagName.match(/input|textarea|select/i)) {
            return;
          }
          this.scrollerCore.doTouchStart(
            [
              {
                pageX: e.pageX,
                pageY: e.pageY
              }
            ],
            e.timeStamp
          );
          mousedown = true;
          // reflow since the element may have changed
          this.reflow();
          e.preventDefault();
        },
        false
      );
      document.addEventListener(
        'mousemove',
        (e) => {
          if (!mousedown) {
            return;
          }
          this.scrollerCore.doTouchMove(
            [
              {
                pageX: e.pageX,
                pageY: e.pageY
              }
            ],
            e.timeStamp
          );
          mousedown = true;
        },
        false
      );
      document.addEventListener(
        'mouseup',
        (e) => {
          if (!mousedown) {
            return;
          }
          this.scrollerCore.doTouchEnd(e.timeStamp);
          mousedown = false;
        },
        false
      );
      this.element.addEventListener(
        'mousewheel',
        (e) => {
          if (this.zooming) {
            this.scrollerCore.doMouseZoom(e.wheelDelta, e.timeStamp, e.pageX, e.pageY);
            e.preventDefault();
          }
        },
        false
      );
    }
  }

  reflow() {
    // set the right scroller dimensions
    this.scrollerCore.setDimensions(
      this.indicator.clientWidth,
      this.indicator.clientHeight,
      this.group.offsetWidth,
      this.group.offsetHeight
    );
    // refresh the position for zooming purposes
    const rect = this.indicator.getBoundingClientRect();
    this.scrollerCore.setPosition(rect.left + this.indicator.clientLeft, rect.top + this.indicator.clientTop);
  }

  setCurrent(index) {
    const { $options } = this;
    const { data } = $options;
    const size = data.length || 0;
    if (index >= 0 && index < size && this.currentIndex !== index) {
      const height = this.indicator.clientHeight;
      this.scrollerCore.scrollTo(0, height * index);
      this.currentIndex = index;
      this.dispatch('onChange', index, data[index]);
    }
  }

  setData(data) {
    this.data = data;
    const htmls = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      htmls.push(`<div class="lmui-picker-item">${item.text}</div>`);
    }
    this.group.innerHTML = htmls.join('');
    this.reflow();
  }
}

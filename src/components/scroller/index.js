'use strict';
import style from './index.less';
import { BaseView } from '@components/eventclass/index';
import { mergeOptions, assign, vendorPrefix, renderScroll } from '@util';
import ScrollerCore from '../../util/scroller';
import tpl from './index.html';
const defaultOptions = {
  // 外包容器
  el: document.body,
  // 滚动内容
  content: '',
  // 下拉刷新容器文案
  refreshContent: '下拉刷新',
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
  paging: false,
  // 是否捕捉用户可用的整数像素值
  snapping: false,
  // 是否开启缩放功能
  zooming: false,
  // 缩放最小值
  minZoom: 0.5,
  // 缩放最大值
  maxZoom: 3,
  // 启用下拉刷新
  pullToRefresh: false,
  // 下拉刷新高度（像素）
  pullToRefreshHeight: 50
};

const classOptions = {
  className: 'Scroller',
  events: ['onScroll', 'onScrollOver', 'onRefreshLess', 'onRefresh', 'onRefreshMore'],
  template: tpl
};

export default class Scroller extends BaseView {
  constructor(options) {
    options = mergeOptions(assign(defaultOptions, classOptions), options);
    super(options);
  }

  aferRender() {
    const { $options } = this;
    const { pullToRefresh, pullToRefreshHeight } = $options;
    this.container = this.element.firstElementChild;
    [this.refresh, this.content] = this.container.children;
    this.content.style[`${vendorPrefix}TransformOrigin`] = 'left top';
    this.scrollerCore = new ScrollerCore((left, top, zoom) => {
      this.dispatch('onScroll', left, top, zoom);
      renderScroll(this.container, left, top, zoom);
    }, $options);
    if (pullToRefresh) {
      this.scrollerCore.activatePullToRefresh(
        pullToRefreshHeight,
        () => {
          this.dispatch('onRefreshMore');
        },
        () => {
          this.dispatch('onRefreshLess');
        },
        () => {
          this.dispatch('onRefresh');
        }
      );
    }
    this._initEvent();
    this.reflow();
  }

  _initEvent() {
    const { element } = this;
    // reflow handling
    window.addEventListener(
      'resize',
      () => {
        this.reflow();
      },
      false
    );
    // touch devices bind touch events
    if ('ontouchstart' in window) {
      element.addEventListener(
        'touchstart',
        (e) => {
          // Don't react if initial down happens on a form element
          if (e.touches[0] && e.touches[0].target && e.touches[0].target.tagName.match(/input|textarea|select/i)) {
            return;
          }
          // reflow since the container may have changed
          this.reflow();
          this.scrollerCore.doTouchStart(e.touches, e.timeStamp);
        },
        false
      );
      element.addEventListener(
        'touchmove',
        (e) => {
          e.preventDefault();
          this.scrollerCore.doTouchMove(e.touches, e.timeStamp, e.scale);
        },
        false
      );
      element.addEventListener(
        'touchend',
        (e) => {
          this.scrollerCore.doTouchEnd(e.timeStamp);
        },
        false
      );
      element.addEventListener(
        'touchcancel',
        (e) => {
          this.scrollerCore.doTouchEnd(e.timeStamp);
        },
        false
      );
      // non-touch bind mouse events
    } else {
      let mousedown = false;
      element.addEventListener(
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
          // reflow since the container may have changed
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

  finishPullToRefresh() {
    this.pullToRefresh && this.scrollerCore.finishPullToRefresh();
  }

  reflow() {
    const { $options, element, container } = this;
    const { pullToRefresh, pullToRefreshHeight } = $options;
    // set the right scroller dimensions
    this.scrollerCore.setDimensions(
      element.clientWidth,
      element.clientHeight,
      this.container.offsetWidth,
      pullToRefresh ? container.offsetHeight - pullToRefreshHeight : container.offsetHeight
    );
    // refresh the position for zooming purposes
    const rect = container.getBoundingClientRect();
    this.scrollerCore.setPosition(rect.left + element.clientLeft, rect.top + element.clientTop);
  }
}

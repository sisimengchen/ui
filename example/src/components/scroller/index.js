import html from './index.html';
import { request } from '../../util';
import { Scroller } from '@lmui';

export default function() {
  const app = window.app || document.getElementById('app');
  window.header && window.header.setTitle('Scroller');
  const scroller = new Scroller({
    el: app,
    pullToRefresh: true
  })
    .onCreate(function() {
      console.log(this);
      insertItems();
    })
    .onScroll((left, top, zoom) => {
      console.log(left, top, zoom);
    })
    .onScrollOver(() => {
      console.log('onScrollOver');
    })
    .onRefreshLess(function() {
      console.log('onRefreshLess');
      this.refresh.innerHTML = '未触发刷新';
    })
    .onRefresh(function() {
      console.log('onRefresh');
      this.refresh.innerHTML = '刷新中';
      const me = this;
      setTimeout(() => {
        this.refresh.innerHTML = '刷新完毕';
        insertItems();
        this.finishPullToRefresh();
      }, 2000);
    })
    .onRefreshMore(function() {
      console.log('onRefreshMore');
      this.refresh.innerHTML = '松开触发刷新';
    });

  const insertItems = function() {
    const content = scroller.content;
    request('/wap/ajax/list', {
      method: 'GET'
    })
      .then((data) => {
        console.log(data);
        content.innerHTML = '';
        for (let i = 0; i < data.data.list.length; i++) {
          const item = data.data.list[i];
          const row = document.createElement('div');
          row.className = 'lmui-cell';
          row.innerHTML = [
            '<div class="lmui-cell-wrapper">',
            '<div class="lmui-cell-title"><span class="lmui-cell-text">',
            item.name,
            '</span></div>',
            '<div class="lmui-cell-value"><span>',
            item.id,
            '</span></div>',
            '</div>'
          ].join('');
          content.appendChild(row);
        }
        scroller.reflow();
      })
      .catch(e => console.log('Oops, error', e));
  };
}

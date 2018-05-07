import html from './index.html';
import { Tooltip } from '@lmui';

export default function() {
  const app = window.app || document.getElementById('app');
  window.header && window.header.setTitle('Tooltip');
  app.innerHTML = html;
  const tooltip = document.getElementById('tooltip');
  const testTooltip = new Tooltip({
    target: tooltip,
    placement: 'bottom',
    content: '<h2 style="width:300px">仅支持储蓄卡</h2><h3>温馨提示xxxx</h3>'
  });
}

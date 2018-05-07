import html from './index.html';
import { Popover } from '@lmui';

export default function() {
  const app = window.app || document.getElementById('app');
  window.header && window.header.setTitle('Popover');
  app.innerHTML = html;
  const popover = document.getElementById('popover');
  const testPopover = new Popover({
    target: popover,
    placement: 'bottom',
    content:
      '<h2 style="width:600px">仅支持储蓄卡</h2><h3>温馨提示xxxx</h3><div>萨达多阿萨德按时<br>萨达多阿萨德按时<br>萨达多阿萨德按时<br>萨达多阿萨德按时<br>萨达多阿萨德按时<br></div>'
  });
}

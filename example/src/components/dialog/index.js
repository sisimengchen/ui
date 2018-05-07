import html from './index.html';
import { Dialog } from '@lmui';

export default function() {
  const app = window.app || document.getElementById('app');
  window.header && window.header.setTitle('Dialog');
  app.innerHTML = html;
  const dialogBtn = document.getElementById('dialog');
  dialogBtn.onclick = function() {
    const dialog = new Dialog({
      autoShow: true,
      backClose: true,
      // placement: 'bottom',
      // height: '100%',
      width: '85%',
      closeClass: 'J-close',
      // containerClass: 'ui-toast-normal',
      content: ['<div class="J-close" style="font-size:14px;height:30px;">分享到</div>'].join(''),
      closeOnClickModal: true,
      button: ['点我'],
      title: '标题'
      // timeout: 1000
    })
      .onBtnClick((id) => {
        console.log(id);
      })
      .onClose(() => {
        console.log('onClose');
      })
      .onBeforeClose(() => {
        console.log('onBeforeClose');
      });
  };
}

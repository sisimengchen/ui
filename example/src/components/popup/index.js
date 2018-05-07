import html from './index.html';
import { Popup } from '@lmui';

export default function() {
  const app = window.app || document.getElementById('app');
  window.header && window.header.setTitle('Popup');
  app.innerHTML = html;
  const popup = document.getElementById('popup');
  popup.onclick = function() {
    window.testpop = new Popup({
      autoShow: true,
      backClose: true,
      // type: 'bottom',
      // height: '100%',
      width: '100%',
      closeClass: 'J-close',
      // containerClass: 'ui-toast-normal',
      content: [
        '<div class="J-close" style="font-size:14px;color:#fff;">分享到<br>分享到<br>分享到<br>分享到<br>分享到<br>分享到<br>分享到<br></div>'
      ].join(''),
      closeOnClickModal: true,
      title: '标题'
      // timeout: 1000
    })
      .onClose(() => {
        console.log('onClose');
      })
      .onBeforeClose(() => {
        console.log('onBeforeClose');
      });
  };
}

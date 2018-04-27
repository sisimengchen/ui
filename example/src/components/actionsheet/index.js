import html from './index.html';
import { Actionsheet } from '@lmui/index.js';

export default function() {
  const app = window.app || document.getElementById('app');
  window.header && window.header.setTitle('Actionsheet');
  app.innerHTML = html;
  const actionsheetBtn = document.getElementById('actionsheet');
  actionsheetBtn.onclick = function() {
    const actionsheet = new Actionsheet({
      data: [
        {
          text: 'Actionsheet1'
        },
        {
          text: 'Actionsheet2'
        }
      ]
    }).onBtnClick((a, b, c) => {
      console.log(a, b, c);
    });
  };
}

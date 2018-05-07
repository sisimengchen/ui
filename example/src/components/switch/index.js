import html from './index.html';
import { Switch } from '@lmui';

export default function() {
  const app = window.app || document.getElementById('app');
  window.header && window.header.setTitle('Switch');
  app.innerHTML = html;
  const switchctn = document.getElementById('switch');
  const tswitch = new Switch({
    el: switchctn,
    title: '测试标题',
    data: {
      value: 'a',
      checked: true,
      disabled: false
    }
  }).onChange(function(data) {
    console.log(data);
    console.log(this);
  });
}

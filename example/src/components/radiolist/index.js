import html from './index.html';
import { RadioList } from '@lmui';

export default function() {
  const app = window.app || document.getElementById('app');
  window.header && window.header.setTitle('RadioList');
  app.innerHTML = html;
  const radiolist0 = document.getElementById('radiolist0');
  const radioList = new RadioList({
    el: radiolist0,
    title: '测试标题',
    data: [
      {
        label: '测试1',
        value: 'a',
        checked: true
      },
      {
        label: '测试2',
        value: 'b',
        disabled: true
        // checked: true
      },
      {
        label: '测试3',
        value: 'c'
      }
    ]
  }).onChange(function(data) {
    console.log(data);
    console.log(this);
  });
}

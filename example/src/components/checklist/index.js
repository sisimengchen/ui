import html from './index.html';
import { CheckList } from '@lmui/index.js';

export default function() {
  const app = window.app || document.getElementById('app');
  window.header && window.header.setTitle('CheckList');
  app.innerHTML = html;

  const checkList0 = new CheckList({
    el: document.getElementById('checkList0'),
    title: '选中不限制',
    data: [
      {
        label: '选项A',
        value: 'a'
      },
      {
        label: '选项B',
        value: 'b'
      },
      {
        label: '选项C',
        value: 'c'
      }
    ]
  }).onChange(function(data) {
    console.log(data);
    console.log(this);
  });
  const checkList1 = new CheckList({
    el: document.getElementById('checkList1'),
    title: '禁用选项',
    data: [
      {
        label: '选项A',
        value: 'a'
      },
      {
        label: '选项B（被禁用）',
        value: 'b',
        disabled: true
      },
      {
        label: '选项C',
        value: 'c'
      }
    ]
  }).onChange(function(data) {
    console.log(data);
    console.log(this);
  });
  const checkList2 = new CheckList({
    el: document.getElementById('checkList2'),
    title: '最多选两个',
    data: [
      {
        label: '选项A',
        value: 'a',
        checked: true
      },
      {
        label: '选项B',
        value: 'b'
      },
      {
        label: '选项C',
        value: 'c'
      }
    ],
    max: 2
  }).onChange(function(data) {
    console.log(data);
    console.log(this);
  });
}

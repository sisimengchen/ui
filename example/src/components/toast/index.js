import html from './index.html';
import { toast } from '@lmui/index.js';

export default function() {
  const app = window.app || document.getElementById('app');
  window.header && window.header.setTitle('Toast');
  app.innerHTML = html;
  const top = document.getElementById('toastTop');
  const center = document.getElementById('toastCenter');
  const bottom = document.getElementById('toastBottom');
  top.onclick = function() {
    toast(
      '顶部提示',
      () => {
        console.log(123);
      },
      {
        modal: false,
        closeOnClickModal: true,
        placement: 'top'
      }
    );
  };
  center.onclick = function() {
    toast(
      '居中提示',
      () => {
        console.log(123);
      },
      {
        modal: false,
        closeOnClickModal: true
      }
    );
  };
  bottom.onclick = function() {
    toast(
      '底部提示',
      () => {
        console.log(123);
      },
      {
        modal: false,
        closeOnClickModal: true,
        placement: 'bottom'
      }
    );
  };
}

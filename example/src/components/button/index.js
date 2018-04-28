import html from './index.html';
import { Button } from '@lmui';

export default function() {
  const app = window.app || document.getElementById('app');
  window.header && window.header.setTitle('Button');
  app.innerHTML = html;
  const btnDefault = new Button({
    cntr: document.getElementById('btnDefault')
  }).onButtonClick(function() {
    console.log(this);
  });
  const btnPrimary = new Button({
    cntr: document.getElementById('btnPrimary')
  }).onButtonClick(function() {
    console.log(this);
  });
}

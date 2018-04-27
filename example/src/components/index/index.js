import html from './index.html';

export default function() {
  const app = window.app || document.getElementById('app');
  app.innerHTML = html;
  window.header && window.header.setTitle('LMUI');
}

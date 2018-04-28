import html from './index.html';
import { ContentLoader } from '@lmui';

export default function() {
  const app = window.app || document.getElementById('app');
  window.header && window.header.setTitle('Button');
  app.innerHTML = html;
  const contentLoader = new ContentLoader({
    el: document.getElementById('contentLoader')
  });
}

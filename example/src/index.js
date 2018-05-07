import './index.less';
import '@lmui-style'; // 这里是个坑 需要在config的resolve中解决
import { Header } from '@lmui';
import index from './components/index';
import actionsheet from './components/actionsheet';
import button from './components/button';
import checklist from './components/checklist';
import contentloader from './components/contentloader';
import dialog from './components/dialog';
import picker from './components/picker';
import popover from './components/popover';
import popup from './components/popup';
import radiolist from './components/radiolist';
import scroller from './components/scroller';
import Switch from './components/switch';
import toast from './components/toast';
import tooltip from './components/tooltip';

const headerEl = document.getElementById('header');
window.header = new Header({
  el: headerEl,
  title: '',
  fixed: false,
  data: {
    left: {
      id: 'back',
      text: '返回',
      icon: '',
      link: '#/',
      img: ''
    },
    right: [
      {
        id: 'share',
        text: '分享',
        icon: '',
        link: '',
        img: ''
      }
    ]
  }
}).onButtonClick((data) => {
  console.log(data);
});

const app = window.app || document.getElementById('app');
if (!document.location.hash) {
  document.location.href = `${document.location.href}#/`;
}

const routes = {
  '/': index,
  '/actionsheet': actionsheet,
  '/button': button,
  '/checklist': checklist,
  '/contentloader': contentloader,
  '/dialog': dialog,
  '/picker': picker,
  '/popover': popover,
  '/popup': popup,
  '/radiolist': radiolist,
  '/scroller': scroller,
  '/switch': Switch,
  '/toast': toast,
  '/tooltip': tooltip
};

const router = window.Router(routes);
router.configure({
  on: function() {
    // console.log("all");
    if (document.location.hash === '#/') {
      // $(".page-back").hide();
    } else {
      // $(".page-back").show();
    }
  }
});

router.init();

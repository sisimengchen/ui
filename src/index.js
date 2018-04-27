import { assign } from '@util';
import Actionsheet from '@components/actionsheet/index';
import Button from '@components/button/index';
import Cell from './components/cell/index.less';
import CheckList from '@components/checklist/index';
import ContentLoader from '@components/contentLoader/index';
import { instanceManager } from '@components/eventclass/index';
import Dialog from '@components/dialog/index';
import Field from './components/field/index.less';
import Header from '@components/header/index';
import Picker from '@components/picker/index';
import Popover from '@components/popover/index';
import Popup from '@components/popup/index';
import RadioList from '@components/radiolist/index';
import Scroller from '@components/scroller/index';
import Spin from '@components/spin/index';
import Switch from '@components/switch/index';
import Tooltip from '@components/tooltip/index';

export default {
  Actionsheet: Actionsheet,
  Button: Button,
  CheckList: CheckList,
  ContentLoader: ContentLoader,
  Dialog: Dialog,
  Picker: Picker,
  Popover: Popover,
  Popup: Popup,
  RadioList: RadioList,
  Header: Header,
  Scroller: Scroller,
  Spin: Spin,
  Switch: Switch,
  Tooltip: Tooltip,
  instanceManager: instanceManager,
  toast: function(content, timeout, callback, config) {
    if (Object.prototype.toString.call(timeout) === '[object Function]') {
      config = callback;
      callback = timeout;
      timeout = null;
    }
    config = config || {};
    const defaultOption = {
      // width: '85%',
      containerClass: 'lmui-toast',
      content: content,
      timeout: +timeout || 2000,
      button: []
    };
    return new Dialog(assign(defaultOption, config)).onClose(callback);
  },
  alert: function(content, button, config) {
    config = config || {};
    const defaultOption = {
      width: '85%',
      containerClass: 'lmui-alert',
      content: content,
      button: button || ['~我知道了']
    };
    return new Dialog(assign(defaultOption, config));
  }
};

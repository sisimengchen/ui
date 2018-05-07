import html from './index.html';
import { Popup, Picker } from '@lmui';

export default function() {
  const app = window.app || document.getElementById('app');
  window.header && window.header.setTitle('Picker');
  app.innerHTML = html;
  const picker = document.getElementById('innerpicker');
  window.innerpicker = new Picker({
    el: picker,
    data: [
      {
        text: '测试0',
        value: 0
      },
      {
        text: '测试1',
        value: 1
      },
      {
        text: '测试2',
        value: 2
      },
      {
        text: '测试3',
        value: 0
      },
      {
        text: '测试4',
        value: 1
      },
      {
        text: '测试5',
        value: 2
      },
      {
        text: '测试6',
        value: 0
      },
      {
        text: '测试7',
        value: 1
      },
      {
        text: '测试8',
        value: 2
      }
    ]
  })
    .onCreate(function() {
      console.log('onCreate');
      console.log(this);
    })
    .onChange((index, data) => {
      console.log(index, data);
      // window.innerpicker2.setCurrent(index);
      // window.innerpicker2.
    });
  window.innerpicker2 = new Picker({
    el: picker,
    data: [
      {
        text: '测试0',
        value: 0
      },
      {
        text: '测试1',
        value: 1
      },
      {
        text: '测试2',
        value: 2
      },
      {
        text: '测试3',
        value: 0
      },
      {
        text: '测试4',
        value: 1
      },
      {
        text: '测试5',
        value: 2
      },
      {
        text: '测试6',
        value: 0
      },
      {
        text: '测试7',
        value: 1
      },
      {
        text: '测试8',
        value: 2
      }
    ]
  })
    .onCreate(function() {
      console.log('onCreate');
      console.log(this);
    })
    .onChange((index, data) => {
      console.log(index, data);
      // window.innerpicker2.setCurrent(index);
      // window.innerpicker2.
    });
  const pickerBtn = document.getElementById('picker');
  pickerBtn.onclick = function() {
    window.popup = new Popup({
      autoShow: true,
      backClose: true,
      // type: 'bottom',
      // height: '100%',
      width: '100%',
      closeClass: 'J-close',
      // containerClass: 'ui-toast-normal',
      content: '',
      closeOnClickModal: true,
      button: ['点我'],
      title: '标题'
      // timeout: 1000
    })
      .onCreate(function() {
        const picker = new Picker({
          el: this.element,
          data: [
            {
              text: '测试0',
              value: 0
            },
            {
              text: '测试1',
              value: 1
            },
            {
              text: '测试2',
              value: 2
            },
            {
              text: '测试3',
              value: 0
            },
            {
              text: '测试4',
              value: 1
            },
            {
              text: '测试5',
              value: 2
            },
            {
              text: '测试6',
              value: 0
            },
            {
              text: '测试7',
              value: 1
            },
            {
              text: '测试8',
              value: 2
            }
          ]
        })
          .onCreate(function() {
            console.log('onCreate');
            console.log(this);
          })
          .onChange((left, top, zoom) => {
            console.log(left, top, zoom);
          });
      })
      .onClose(() => {
        console.log('onClose');
      })
      .onBeforeClose(() => {
        console.log('onBeforeClose');
      });
  };
}

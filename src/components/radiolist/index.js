'use strict';
import style from './index.less';
import { BaseView } from '@components/eventclass/index';
import { mergeOptions, assign, remove, addClass, removeClass, toArray } from '@util';
import tpl from './index.html';
const defaultOptions = {
  // 外包容器class
  containerClass: 'lmui-radioList',
  title: '',
  data: null // { label: 'label', value: 'value', disabled: false, checked: true }
};

const classOptions = {
  className: 'RadioList',
  events: ['onChange'],
  template: tpl,
  on: [
    {
      name: 'change',
      handler: 'handleChange',
      target: 'element'
    }
  ],
  currentValue: []
};

export default class CheckList extends BaseView {
  constructor(options) {
    options = mergeOptions(assign({}, defaultOptions, classOptions), options);
    super(options);
  }

  aferRender() {
    const { element } = this;
    this.forms = toArray(element.getElementsByTagName('input'));
    this.setData();
  }

  setData(newDate) {
    const { $options, forms, _uid } = this;
    let { data } = $options;
    if (newDate) {
      data = newDate;
    }
    this.formDate = null;
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const form = forms[i];
      form.name = _uid;
      form.disabled = item.disabled;
      form.value = item.value;
      if (!this.formDate && item.checked) {
        form.checked = item.checked;
        this.formData = assign({}, item);
      } else {
        form.checked = item.checked = false;
      }
    }
    this.dispatch('onChange', assign({}, this.formDate));
  }

  handleChange(event) {
    const { checked, disabled, value } = event.target;
    const { $options } = this;
    const { data } = $options;
    const index = parseInt(event.target.dataset.index, 10);
    const item = data[index];
    item.checked = checked;
    item.disabled = disabled;
    item.value = value;
    this.formData = assign({}, item);
    this.dispatch('onChange', assign({}, this.formData));
  }
}

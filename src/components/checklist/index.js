'use strict';
import style from './index.less';
import { BaseView } from '@components/eventclass/index';
import { mergeOptions, assign, remove, addClass, removeClass, toArray } from '@util';
import tpl from './index.html';
const defaultOptions = {
  // 外包容器class
  containerClass: 'lmui-checkList',
  title: '',
  data: null, // { label: 'label', value: 'value', disabled: false, checked: true }
  max: Infinity
};

const classOptions = {
  className: 'CheckList',
  events: ['onChange'],
  template: tpl,
  on: [
    {
      name: 'change',
      handler: 'handleChange',
      target: 'element'
    }
  ]
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
    const { $options, forms } = this;
    let { data } = $options;
    if (newDate) {
      data = newDate;
    }
    this.formDate = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const form = forms[i];
      form.checked = item.checked;
      form.disabled = item.disabled;
      form.value = item.value;
      if (item.checked) {
        this.formDate.push(item);
      }
    }
    this.checkMax();
    this.dispatch('onChange', this.formDate.slice());
  }

  handleChange(event) {
    const { checked, disabled, value } = event.target;
    const { $options, formDate } = this;
    const { data } = $options;
    const index = parseInt(event.target.dataset.index, 10);
    const item = data[index];
    item.checked = checked;
    item.disabled = disabled;
    item.value = value;
    checked ? formDate.push(item) : remove(formDate, item);
    this.checkMax();
    this.dispatch('onChange', formDate.slice());
  }

  checkMax() {
    const { $options, element, forms, formDate } = this;
    const { data, max } = $options;
    const { length } = data;
    if (formDate.length >= max) {
      addClass(element, 'is-limit');
      for (let i = 0; i < length; i++) {
        const form = forms[i];
        const item = data[i];
        if (!item.checked && !item.disabled) {
          form.disabled = true;
        }
      }
    } else {
      removeClass(element, 'is-limit');
      for (let i = 0; i < length; i++) {
        const form = forms[i];
        const item = data[i];
        if (!item.checked && !item.disabled) {
          form.disabled = false;
        }
      }
    }
  }
}

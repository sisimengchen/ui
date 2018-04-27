'use strict';
import style from './index.less';
import { BaseView } from '@components/eventclass/index';
import { mergeOptions, assign, remove, addClass, removeClass, toArray } from '@util';
import tpl from './index.html';
const defaultOptions = {
  // 外包容器class
  containerClass: 'lmui-switch',
  title: '',
  data: { disabled: false, checked: false } // { label: 'label', value: 'value', disabled: false, checked: true }
};

const classOptions = {
  className: 'Switch',
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

export default class Switch extends BaseView {
  constructor(options) {
    options = mergeOptions(assign({}, defaultOptions, classOptions), options);
    super(options);
  }

  aferRender() {
    const { element, $options } = this;
    const { data } = $options;
    this.forms = toArray(element.getElementsByTagName('input'));
    this.setData(data);
  }

  handleChange(event) {
    const { checked, disabled } = event.target;
    const { formData } = this;
    formData.checked = checked;
    formData.disabled = disabled;
    this.dispatch('onChange', assign({}, formData));
  }

  setData(data) {
    const { $options, forms } = this;
    const [form] = forms;
    $options.data = data;
    form.disabled = data.disabled;
    form.checked = data.checked;
    this.formData = assign({}, data);
    this.dispatch('onChange', assign({}, this.formData));
  }
}

"use strict";
import style from "./index.less";
import { BaseView } from "@components/eventclass/index";
import { mergeOptions, assign, hasClass, toArray } from "@util";
import tpl from "./index.html";
const defaultOptions = {
  // 外包容器class
  containerClass: "lmui-header-normal",
  title: "",
  fixed: false,
  data: null
};

const classOptions = {
  className: "Header",
  events: ["onButtonClick"],
  template: tpl,
  on: [
    {
      name: "click",
      handler: "handleButtonClick",
      target: "element"
    }
  ]
};

export default class Header extends BaseView {
  constructor(options) {
    options = mergeOptions(assign({}, defaultOptions, classOptions), options);
    super(options);
  }
  aferRender() {
    const { $options, element } = this;
    this.titleEls = toArray(element.getElementsByTagName("h1"));
  }
  handleButtonClick(event) {
    let { target } = event;
    const { element } = this;
    while (!hasClass(target, "router-link-active") && target !== element) {
      target = target.parentNode;
    }
    if (target !== element) {
      const nReturn = this.dispatch(
        "onButtonClick",
        target.dataset ? target.dataset.id : target.getAttribute("data-id")
      );
      if (nReturn === false) {
        event.preventDefault();
      }
    }
  }
  setTitle(title) {
    const { $options, titleEls } = this;
    const { data } = $options;
    const [titleEl] = titleEls;
    titleEl.innerHTML = data.title = title;
  }
}

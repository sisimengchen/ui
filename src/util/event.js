import { supportsPassive } from './env.js';
import { bind } from './base.js';
// let target;

function remove(target, event, handler, capture = false) {
  target.removeEventListener(event, handler, capture);
}

function createOnceHandler(target, event, handler, capture) {
  // const _target = target; // save current target element in closure
  return function onceHandler() {
    const res = handler(...arguments);
    if (res !== null) {
      remove(event, onceHandler, capture, target);
    }
  };
}

function add(target, event, handler, once = false, capture = false, passive = false) {
  if (once) {
    handler = createOnceHandler(target, event, handler, capture);
  }
  target.addEventListener(event, handler, supportsPassive ? { capture, passive } : capture);
}

export function addDOMListeners(on, instance) {
  for (const name in on) {
    if (Object.prototype.hasOwnProperty.call(on, name)) {
      const event = on[name];
      const target = instance[event.target];
      const handler = bind(instance[event.handler], instance);
      add(target, event.name, handler, event.once, event.capture, event.passive);
    }
  }
}

export function removeDOMListeners(on, instance) {
  for (const name in on) {
    if (Object.prototype.hasOwnProperty.call(on, name)) {
      const event = on[name];
      const target = instance[event.target];
      const handler = bind(instance[event.handler], instance);
      remove(target, event.name, handler, event.capture);
    }
  }
}

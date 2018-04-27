// import { assign } from '@util';
const strats = {
  events: function(baseEvents = [], inheritEvents = []) {
    const events = baseEvents.slice();
    for (let i = 0; i < inheritEvents.length; i++) {
      const event = inheritEvents[i];
      if (events.indexOf(baseEvents) === -1) {
        events.push(event);
      }
    }
    return events;
  }
};

const defaultStrat = function(baseVal, inheritVal) {
  return inheritVal === undefined ? baseVal : inheritVal;
};

export function mergeOptions(base, inherit) {
  const options = {};
  const mergeField = (key) => {
    const strat = strats[key] || defaultStrat; // 动态生成属性合并策略 这些策略都一次在这个文件中进行了定义
    options[key] = strat(base[key], inherit[key], key);
  };
  for (const key in base) {
    if (Object.prototype.hasOwnProperty.call(base, key)) {
      mergeField(key);
    }
  }
  for (const key in inherit) {
    if (Object.prototype.hasOwnProperty.call(inherit, key) && !Object.prototype.hasOwnProperty.call(base, key)) {
      mergeField(key);
    }
  }

  return options;
}

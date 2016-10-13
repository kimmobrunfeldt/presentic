const _ = require('lodash');
const Tweenable = require('shifty');
const Snap = require('snapsvg');
const svgUtil = require('./svg-util');
const {SVG_NS} = require('./constants');
const util = require('./util');
const lunar = require('lunar.js/dist/lunar')();

const MANDATORY_VIEW_KEYS = [
  'x',
  'y',
  'height',
  'width'
];

// Provides easy way to animate movement of SVG viewport, including the
// SVG canvas rotation.
// Injects a root `g` element to `svgDocument` for rotation purposes
function viewport(svgDocument, opts) {
  opts = _.merge({
    duration: 800,
    easing: 'easeInOutCubic',
    injectCss: null,
    svgClassNameOnMousedown: 'mousedown',
    rootGroupClassName: 'presentation-root-group'
  }, opts);

  const svgElement = svgDocument.querySelector('svg');
  const snap = Snap(svgElement);
  const rootGroup = svgUtil.injectRootGroup(snap);

  if (opts.svgClassNameOnMousedown) {
    document.addEventListener('pointerdown', () => {
      lunar.addClass(svgElement, opts.svgClassNameOnMousedown);
    });

    document.addEventListener('pointerup', () => {
      lunar.removeClass(svgElement, opts.svgClassNameOnMousedown);
    });
  }

  if (opts.injectCss) {
    const styleElement = svgDocument.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleElement.textContent = opts.injectCss;
    svgElement.appendChild(styleElement);
  }

  rootGroup.setAttribute('class', opts.rootGroupClassName);

  // Internal state all methods are sharing
  const initialViewBox = svgElement.viewBox.baseVal;
  const state = {
    tweenable: null,
    tweenValues: {
      x: initialViewBox.x,
      y: initialViewBox.y,
      width: initialViewBox.width,
      height: initialViewBox.height,
      rotation: 0
    }
  };

  // Example:
  //
  // animateTo({
  //   x: 10,
  //   y: 20,
  //   width: 200,
  //   height: 200,
  //   rotation: 45  // optional
  // })
  // Rotation is relative to center of the viewport, in degrees
  function animateTo(view) {
    _.forEach(MANDATORY_VIEW_KEYS, key => {
      if (!_.has(view, key)) {
        let msg = 'Invalid `view` passed: ' + JSON.stringify(view) + '. '
        msg += 'Missing attribute: ' + key;
        throw new Error(msg);
      }
    });

    view = _.merge({
      rotation: 0
    }, view);

    if (_.isFunction(_.get(state.tweenable, 'stop'))) {
      state.tweenable.stop();
    };

    state.tweenable = new Tweenable();
    state.tweenable.tween({
      from: state.tweenValues,
      to: _.cloneDeep(view),
      duration: opts.duration,
      easing: opts.easing,
      step: values => {
        const viewBox = [values.x, values.y, values.width, values.height];
        svgElement.setAttribute('viewBox', viewBox.join(' '));

        // The rotation origin is also moving when in each animation frame
        // until it reaches the next slide's center
        const rotateOrigin = {
          x: values.x + values.width / 2,
          y: values.y + values.height / 2
        };
        const rotate = [values.rotation, rotateOrigin.x, rotateOrigin.y];
        rootGroup.setAttribute('transform', 'rotate(' + rotate.join(', ') + ')');

        // Save tween state on each frame
        state.tweenValues = values;
      }
    });
  }

  return {
    animateTo: animateTo
  };
}

module.exports = viewport;

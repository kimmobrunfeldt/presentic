const _ = require('lodash');
const Mousetrap = require('mousetrap');
const Tweenable = require('shifty');
const attachFastClick = require('fastclick');
const hammer = require('./hammer');
const mathUtil = require('./math-util');
const svgUtil = require('./svg-util');
const svgViewport = require('./svg-viewport');
const util = require('./util');

const SVG_DOCUMENT_CSS = `.presentation-slides-group > * {
  fill: rgba(0, 0, 0, 0);
  transition: all 0.3s ease;
}

.mousedown .presentation-slides-group > * {
  fill: rgba(102, 215, 209, 0.3);
}`;

function initPresentation(svgDocument, opts) {
  opts = _.merge({
    duration: 800,
    easing: 'easeInOutCubic',
    injectCss: SVG_DOCUMENT_CSS
  }, opts);

  const svgElement = svgDocument.querySelector('svg');

  const slidesContainer = svgDocument.getElementById('Slides');
  slidesContainer.setAttribute('class', 'presentation-slides-group');
  const slideElems = _.map(slidesContainer.children, child => {
    if (child.tagName === 'use') {
      const realElemId = child.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
      return svgDocument.querySelector(realElemId);
    }

    return child;
  });


  console.log('slideElems', slideElems)
  _.forEach(slideElems, (e, index) => {
    e.style.touchAction = 'none';

    e.addEventListener('pointerdown', () => {
      console.log('pointerdown')
      animateStep(index);
    });
  });

  const presentation = _.map(slideElems, e => mathUtil.getFinalBBox(e));
  const rotations = _.map(presentation, 'rotation');
  _.forEach(mathUtil.normalizeRotations(rotations), (rotation, i) => {
    // Normalize rotations to make the presentation flow better,
    // and also we need to reverse the rotation to make the viewport
    // rotate correctly
    presentation[i].rotation = -rotation;
  });

  _.forEach(presentation, s => svgUtil.drawRect(svgElement, s.x, s.y, s.width, s.height));

  const state = {
    step: 0,
    viewport: svgViewport(svgDocument, opts)
  };

  function animateStep(stepIndex) {
    const currentStep = presentation[state.step];
    const nextStepIndex = getStepIndex(stepIndex);
    const nextStep = presentation[nextStepIndex];

    state.viewport.animateTo(nextStep);
    state.step = nextStepIndex;
  }

  function next() {
    animateStep(state.step + 1);
  }

  function previous() {
    animateStep(state.step - 1);
  }

  function getStepIndex(index) {
    if (index < 0) {
      return presentation.length - 1;
    }

    return index % presentation.length;
  }

  function initKeyEvents() {
    attachFastClick(document.body);

    hammer.on('swipeleft', () => next());
    hammer.on('swiperight', () => previous());

    Mousetrap.bind('right', () => next());
    Mousetrap.bind('space', () => next());
    Mousetrap.bind('left', () => previous());
  }

  initKeyEvents();
  animateStep(state.step);
}

module.exports = initPresentation;

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

/* Disabled
.mousedown .presentation-slides-group > * {
  fill: rgba(102, 215, 209, 0.3);
}
*/

.hidden {
  opacity: 0;
}
`;

function initPresentation(svgDocument, svgElement, opts) {
  opts = _.merge({
    duration: 800,
    easing: 'easeInOutCubic',
    injectCss: SVG_DOCUMENT_CSS
  }, opts);

  const slidesContainer = svgDocument.getElementById('Slides');
  slidesContainer.setAttribute('class', 'presentation-slides-group');
  // Convert children to regular array and reverse it
  const slideContainers = _.reverse(_.map(slidesContainer.children, i => i));

  const presentation = _.map(slideContainers, container => {
    const elem = getSlideElementFromContainer(svgDocument, container);
    return {
      viewportPosition: svgUtil.getFinalBBox(elem),
      container: container,
      element: elem,
    };
  });
  const rotations = _.map(presentation, i => i.viewportPosition.rotation);
  _.forEach(mathUtil.normalizeRotations(rotations), (rotation, i) => {
    // Normalize rotations to make the presentation flow better,
    // and also we need to reverse the rotation to make the viewport
    // rotate correctly
    presentation[i].viewportPosition.rotation = -rotation;
  });

  const state = {
    step: 0,
    viewport: svgViewport(svgDocument, svgElement, opts)
  };

  function getSlideElementFromContainer(svgDoc, container) {
    if (container.tagName === 'rect') {
      return container;
    }

    const children = _.map(container.children, i => i);;
    const found = _.find(children, child => getElementTagName(svgDoc, child) === 'rect');
    if (found) {
      return found;
    }

    console.warn('No slide element found for container: ', container);
    console.warn('Using the container as the slide element. Presentation may behave unexpectedly.');
    return container;
  }

  function getElementTagName(svgDoc, el) {
    if (el.tagName === 'use') {
      const realElemId = el.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
      const realElem = svgDoc.querySelector(realElemId);
      return getElementTagName(svgDoc, realElem);
    }

    return el.tagName;
  }

  function animateStep(stepIndex) {
    const currentStep = presentation[state.step];
    const nextStepIndex = getStepIndex(stepIndex);
    const nextStep = presentation[nextStepIndex];

    state.viewport.animateTo(nextStep.viewportPosition);
    // currentStep.container.setAttribute('class', 'hidden');
    // nextStep.container.setAttribute('class', '');

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

    document.addEventListener('pointerdown', () => next());
    hammer.on('swipeleft', () => next());
    hammer.on('swiperight', () => previous());

    Mousetrap.bind('right', () => next());
    Mousetrap.bind('space', () => next());
    Mousetrap.bind('left', () => previous());
  }

  _.forEach(slideContainers, e => e.setAttribute('class', 'hidden'));
  initKeyEvents();
  animateStep(state.step);
}

module.exports = initPresentation;

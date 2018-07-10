const parseSvgTransform = require('svg-transform-parser').parse;
const Snap = require('snapsvg');
const _ = require('lodash');
const {SVG_NS} = require('./constants');
const mathUtil = require('./math-util');

function injectRootGroup(snap) {
  const g = document.createElementNS(SVG_NS, 'g');
  snap.selectAll('svg > *').forEach(item => {
    g.appendChild(item.node);
  });

  snap.node.appendChild(g);
  return g;
}

function drawRect(svg, x, y, width, height) {
  var rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttributeNS(null, 'x', x);
  rect.setAttributeNS(null, 'y', y);
  rect.setAttributeNS(null, 'width', width);
  rect.setAttributeNS(null, 'height', height);
  rect.setAttributeNS(null, 'stroke', 'red');
  rect.setAttributeNS(null, 'stroke-width', 5);
  rect.setAttributeNS(null, 'fill-opacity', 0);
  svg.appendChild(rect);
  return rect;
}

function getFinalBBox(svgElem) {
  const box = svgElem.getBBox();
  const svgElemParts = mathUtil.decomposeMatrix(svgElem.getCTM());

  const decomposeMatrices = [];
  let current = svgElem;
  while (current && current.tagName !== 'svg') {
    _.forEach(current.transform.baseVal, svgTransform => {
      const decomposed = mathUtil.decomposeMatrix(svgTransform.matrix);
      decomposeMatrices.push(decomposed);
    });

    current = current.parentNode;
  }

  return _.reduce(decomposeMatrices, (memo, parts, i) => {
    return {
      x: memo.x + parts.translateX,
      y: memo.y + parts.translateY,
      width: memo.width,
      height: memo.height,
      rotation: memo.rotation + parts.rotation
    };
  }, {
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    rotation: 0,
  });
}

module.exports = {
  injectRootGroup,
  drawRect,
  getFinalBBox,
};

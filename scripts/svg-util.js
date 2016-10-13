const parseSvgTransform = require('svg-transform-parser').parse;
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
  rect.setAttributeNS(null, 'stroke-width', 10);
  rect.setAttributeNS(null, 'fill-opacity', 0);
  svg.appendChild(rect);
  return rect;
}

function getFinalBBox(svgElem) {
  const box = svgElem.getBBox();
  const svgElemParts = mathUtil.decomposeMatrix(svgElem.getCTM());

  const transforms = [];
  let current = svgElem;
  while (current && current.tagName !== 'svg') {
    const transform = current.getAttribute('transform');
    if (transform) {
      transforms.push(parseSvgTransform(transform));
    }

    current = current.parentNode;
  }

  return _.reduce(transforms, (memo, transform) => {
    console.log('translate x:', transform.translate.tx, 'translate y', transform.translate.ty)
    return {
      x: memo.x + transform.translate.tx,
      y: memo.y + transform.translate.ty,
      width: memo.width,
      height: memo.height,
      rotation: memo.rotation
    };
  }, {
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    rotation: svgElemParts.rotation
  });
}

module.exports = {
  injectRootGroup,
  drawRect,
  getFinalBBox,
};

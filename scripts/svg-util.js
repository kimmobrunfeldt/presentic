const {SVG_NS} = require('./constants');

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


module.exports = {
  injectRootGroup,
  drawRect
};

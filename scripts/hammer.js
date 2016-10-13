const Hammer = require('hammerjs');

const hammer = new Hammer.Manager(document.body);
hammer.add(new Hammer.Swipe());

module.exports = hammer;

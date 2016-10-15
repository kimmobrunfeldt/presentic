const _ = require('lodash');
const util = require('./util');
const initPresentation = require('./presentation');

function main() {
  const obj = document.querySelector('object');
  initPresentation(obj.contentDocument);
  /*
  obj.addEventListener('load', () => {
    console.log(obj.contentDocument)
    initPresentation(obj.contentDocument);
  });
  */
}

main();

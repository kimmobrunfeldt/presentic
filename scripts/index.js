const _ = require('lodash');
const util = require('./util');
const initPresentation = require('./presentation');

function main() {
  console.log('main')
  const obj = document.querySelector('object');
  console.log(obj.data)
  console.log(obj.contentDocument)
  initPresentation(obj.contentDocument);
  /*
  obj.addEventListener('load', () => {
    console.log(obj.contentDocument)
    initPresentation(obj.contentDocument);
  });
  */
}

const obj = document.querySelector('object');
console.log(obj.contentDocument)
main();

const _ = require('lodash');
const axios = require('axios');
const util = require('./util');
const initPresentation = require('./presentation');

function main() {
  // Optionally the request above could also be done as
  axios.get('examples/test.svg')
    .then(response => {
      const viewport = document.querySelector('#viewport');
      viewport.innerHTML = response.data;
      initPresentation(document, viewport.querySelector('svg'));
    })
    .catch(err => {
      throw err;
    });
}

main();

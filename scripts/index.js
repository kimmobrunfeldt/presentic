const _ = require('lodash');
const axios = require('axios');
const util = require('./util');
const initPresentation = require('./presentation');

function removeContent() {
  const body = document.querySelector('body');
  const contentEl = document.querySelector('#content');
  body.removeChild(contentEl);
}

function startPresentation(svgAsText) {
  removeContent();

  const viewport = document.querySelector('#viewport');
  viewport.innerHTML = svgAsText;
  initPresentation(document, viewport.querySelector('svg'));
}

function setupPresentationFromFile(e) {
  const file = e.target.files[0]

  const reader = new FileReader();
  reader.onload = (e) => {
    startPresentation(reader.result);
  }
  reader.readAsText(file);
}

function setupDemo() {
  // Optionally the request above could also be done as
  axios.get('examples/presentic-intro.svg')
  .then(response => {
    startPresentation(response.data);
  })
  .catch(err => {
    alert(err.message)
    throw err;
  });
}

function main() {
  if (!window.FileReader) {
    alert('The File APIs are not fully supported in this browser.');
  }

  const el = document.querySelector('#file-input')
  el.addEventListener('change', setupPresentationFromFile, false);

  const linkEl = document.querySelector('#see-intro');
  linkEl.addEventListener('click', setupDemo);
}

main();

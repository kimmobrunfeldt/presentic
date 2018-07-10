const _ = require('lodash');
const axios = require('axios');
const util = require('./util');
const initPresentation = require('./presentation');

function setupPresentation(e) {
  const file = e.target.files[0]

  const reader = new FileReader();

  reader.onload = (e) => {
    const body = document.querySelector('body');
    const contentEl = document.querySelector('#content');
    body.removeChild(contentEl);

    const viewport = document.querySelector('#viewport');
    viewport.innerHTML = reader.result;
    initPresentation(document, viewport.querySelector('svg'));
  }
  reader.readAsText(file);
}

function main() {
  if (!window.FileReader) {
    alert('The File APIs are not fully supported in this browser.');
  }

  const el = document.querySelector('#file-input')
  el.addEventListener('change', setupPresentation, false);
}

main();

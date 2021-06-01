/* eslint-disable class-methods-use-this */
const { join } = require('path');
const { readFileSync } = require('fs');

const { minify } = require('terser');
const { transformAsync } = require('@babel/core');

// file paths
const ENTRY_FILE_NAME = 'main.js';
const entryPath = join(__dirname, `/${ENTRY_FILE_NAME}`);
const jsData = readFileSync(entryPath, 'utf8', data => data);

module.exports = class {
  // template "frontmatter"
  data() {
    return {
      eleventyExcludeFromCollections: true,
      layout: false,
      permalink: `/assets/scripts/${ENTRY_FILE_NAME}`,
    };
  }

  async render() {
    try {
      // transpile with babel; uses local config file and browserslist in package.json
      const compiled = await transformAsync(jsData).then(result => result.code);
      const minified = await minify(compiled);

      return minified.code;
    } catch (error) {
      console.error('[Scripts Render]:', error);

      return null;
    }
  }
};

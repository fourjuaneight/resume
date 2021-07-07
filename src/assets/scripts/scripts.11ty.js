/* eslint-disable class-methods-use-this */
const { join } = require('path');
const { promises } = require('fs');

const { build } = require('esbuild');
const { minify } = require('terser');
const { transformAsync } = require('@babel/core');

const { readFile } = promises;

// file paths
const ENTRY_FILE_NAME = 'main.js';
const OUT_FILE_NAME = 'main.bundle.js';
const entryPath = join(__dirname, `/${ENTRY_FILE_NAME}`);
const outputPath = join(__dirname, `/${OUT_FILE_NAME}`);

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
      // bundle scripts
      await build({
        entryPoints: [entryPath],
        bundle: true,
        outfile: outputPath,
        treeShaking: true,
      });
      const data = await readFile(outputPath, { encoding: 'utf8' });
      // transpile with babel; uses local config file and browserslist in package.json
      const compiled = await transformAsync(data).then(result => result.code);
      const minified = await minify(compiled);

      return minified.code;
    } catch (error) {
      console.error('[Scripts Render]:', error);

      return null;
    }
  }
};

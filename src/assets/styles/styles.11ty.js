/* eslint-disable class-methods-use-this */
const { join } = require('path');
const { promisify } = require('util');

const cssnano = require('cssnano');
const cssesc = require('cssesc');
const postcss = require('postcss');
const postcssPresetEnv = require('postcss-preset-env');
const sass = require('node-sass');

const renderSass = promisify(sass.render);
const isProd = process.env.ELEVENTY_ENV === 'production';

// postCSS config
const presetEnv = postcssPresetEnv({
  autoprefixer: {
    flexbox: true,
    grid: true,
  },
  features: {
    'custom-properties': {
      fallback: true,
      preserve: true,
    },
  },
  stage: 3,
});
// use cssnano for minification and presetEnv for prefixing config
const postcssProcessor = postcss([cssnano, presetEnv]);

// file paths
const ENTRY_FILE_NAME = 'main.scss';
// const inputFile = 'assets/styles/main.scss';
const inputFile = join(__dirname, `/${ENTRY_FILE_NAME}`);
const outputFile = 'styles.css';

module.exports = class {
  // template "frontmatter"
  data() {
    return {
      eleventyExcludeFromCollections: true,
      layout: false,
      permalink: `/assets/styles/main.css`,
      entryPath: inputFile,
    };
  }

  // display an error overlay when CSS build fails.
  // this brilliant idea is taken from Mike Riethmuller / Supermaya
  // @see https://github.com/MadeByMike/supermaya/blob/master/site/utils/compile-scss.js
  renderError(error) {
    return `
        /* Error compiling stylesheet */
        *,
        *::before,
        *::after {
            box-sizing: border-box;
        }
        html,
        body {
            margin: 0;
            padding: 0;
            min-height: 100vh;
            font-family: monospace;
            font-size: 1.25rem;
            line-height:1.5;
        } 
        body::before { 
            content: ''; 
            background: #000;
            top: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            opacity: 0.7;
            position: fixed;
        }
        body::after { 
            content: '${cssesc(error)}'; 
            white-space: pre;
            display: block;
            top: 0; 
            padding: 30px;
            margin: 50px;
            width: calc(100% - 100px);
            color:#721c24;
            background: #f8d7da;
            border: solid 2px red;
            position: fixed;
        }`;
  }

  async render() {
    try {
      // scss to css
      const { css } = await renderSass({
        file: inputFile,
      });

      // output processed file
      return postcssProcessor
        .process(css, {
          from: inputFile,
          to: outputFile,
        })
        .then(result => result.css);
    } catch (error) {
      // if things go wrong
      if (isProd) {
        // throw and abort in production
        console.error('[CSS Render]:', error);
        throw new Error(error);
      } else {
        // otherwise display the error overly
        console.error('[CSS Render]:', error);

        return this.renderError(error);
      }
    }
  }
};

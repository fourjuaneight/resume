const { readFileSync } = require('fs');
const { join, resolve } = require('path');

const util = require('util');
const glob = require('glob');
const File = require('vinyl');
const SVGSpriter = require('svg-sprite');

const cwd = resolve('src/assets/icons');
const spriteConfig = {
  mode: {
    inline: true,
    symbol: {
      sprite: 'sprite.svg',
      example: false,
    },
  },
  shape: {
    transform: ['svgo'],
    id: {
      generator: 'icon-%s',
    },
  },
  svg: {
    xmlDeclaration: false,
    doctypeDeclaration: false,
  },
};

module.exports = async () => {
  // Make a new SVGSpriter instance w/ configuration
  const spriter = new SVGSpriter(spriteConfig);

  // Wrap spriter compile function in a Promise
  const compileSprite = async args => {
    return new Promise((resolve, reject) => {
      spriter.compile(args, (error, result) => {
        if (error) {
          console.error('[Compile Sprite]:', error);

          return reject(error);
        }

        resolve(result.symbol.sprite);
      });
    });
  };

  try {
    // Get all SVG icon files in working directory
    const getFiles = util.promisify(glob);
    const files = await getFiles('**/*.svg', { cwd: cwd });

    // Add them all to the spriter
    files.forEach(file => {
      spriter.add(
        new File({
          path: join(cwd, file),
          base: cwd,
          contents: readFileSync(join(cwd, file)),
        })
      );
    });

    // Compile the sprite file and return it as a string
    const sprite = await compileSprite(spriteConfig.mode);
    const spriteContent = sprite.contents.toString('utf8');

    return spriteContent;
  } catch (error) {
    console.error('[Icon Sprite]:', error);
  }
};

const fs = require('fs');
const path = require('path');
const mime = require('mime/lite');
const { DateTime } = require('luxon');
const isEmpty = require('lodash/isEmpty');

module.exports = {
  dateToFormat: (date, format) =>
    DateTime.fromJSDate(date, { zone: 'utc' }).toFormat(String(format)),

  dateToISO: date =>
    DateTime.fromJSDate(date, { zone: 'utc' }).toISO({
      includeOffset: false,
      suppressMilliseconds: true,
    }),

  obfuscate: str => {
    const chars = [];

    for (var i = str.length - 1; i >= 0; i--) {
      chars.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
    }

    return chars.join('');
  },

  stripSpaces: str => str.replace(/\s/g, ''),

  stripProtocol: str => str.replace(/(^\w+:|^)\/\//, ''),

  base64file: file => {
    const filepath = path.join(__dirname, `../src/${file}`);
    const mimeType = mime.getType(file);
    const buffer = Buffer.from(fs.readFileSync(filepath));

    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  },

  themeColors: colors => {
    let style = '';

    if (!colors || isEmpty(colors)) {
      return '';
    }

    if (colors.primary) {
      style += `--primary-color:${colors.primary};`;
    }

    if (colors.secondary) {
      style += `--secondary-color:${colors.secondary};`;
    }

    return style;
  },
};

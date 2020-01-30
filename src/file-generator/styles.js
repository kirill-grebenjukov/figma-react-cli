import fs from 'fs';
import path from 'path';
import kebabCase from 'just-kebab-case';
import prettier from 'prettier';
import _ from 'lodash';

import { rip0 } from '../utils';

export function renderProps(props) {
  if (!props) {
    return [''];
  }

  return [
    ..._.keys(props).flatMap(key0 => {
      const key = key0.indexOf('-') ? `'${key0}'` : key0;
      const value = rip0(props[key0], 1)
        .split('{...props},')
        .join('...props,');
      const hasProps = value.indexOf('...props') >= 0;

      return [`${key}: ${hasProps ? 'props' : '()'} => (`, value, '),'];
    }),
  ];
}

export default function exportStylesFile(
  styles,
  component,
  { context, prettierOptions },
) {
  const {
    exportCode: { path: exportPath },
    eol,
  } = context;

  const { componentName, componentPath } = component;

  let jsCode = ['module.exports = {', ...renderProps(styles), '}'].join(eol);

  if (prettierOptions) {
    jsCode = prettier.format(jsCode, prettierOptions);
  }

  const componentNameKebab = kebabCase(componentName);
  const fileDir = path.join(exportPath, componentPath, componentNameKebab);
  fs.mkdirSync(fileDir, { recursive: true });

  const filePath = path.join(fileDir, `${componentNameKebab}.styles.js`);
  fs.writeFileSync(filePath, jsCode, {
    encoding: 'utf8',
  });
}

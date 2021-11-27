/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable no-plusplus */
import { promises as fs } from 'fs';

const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function asyncForEach<T>(array: T[], callback: (value: T, index: number, allRecords: T[]) => Promise<void>) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function findAndReplaceInFile(filePath: string, fromSearchValue: RegExp | string, toSearchFile: string) {
  return fs.readFile(filePath, 'utf8')
    .then(data => {
      const result = data.replace(fromSearchValue, toSearchFile);

      return fs.writeFile(filePath, result, 'utf8');
    })
    .then(() => {
      console.log(`======== ${filePath} updated ========`);
    });
}

(async () => {
  try {
    if (process.env.REACT_APP_CLIENT_VERSION !== undefined && process.env.REACT_APP_CLIENT_VERSION.trim() !== '') {
      console.log(`REACT_APP_CLIENT_VERSION: ${process.env.REACT_APP_CLIENT_VERSION}`);
      console.log(`PUBLIC_URL: ${process.env.PUBLIC_URL}`);

      const publicUrl = process.env.PUBLIC_URL === '/' ? '' : process.env.PUBLIC_URL;

      // 1- Create folder for assets.
      await exec(`mkdir -p build/${process.env.REACT_APP_CLIENT_VERSION}`);

      // 2- Move all folders expect index.html and img folder under the new folder.
      await exec(
        `mv \`\\ls -1 -d build/* | grep -v -e index.html -e img -e ${process.env.REACT_APP_CLIENT_VERSION}\` build/${process.env.REACT_APP_CLIENT_VERSION}`,
      );

      // 3- Rewrite folder structure in all files at the top level folder
      const files = [
        './build/index.html',
        `./build/${process.env.REACT_APP_CLIENT_VERSION}/service-worker.js`,
        `./build/${process.env.REACT_APP_CLIENT_VERSION}/asset-manifest.json`,
      ];
      await asyncForEach(files, file =>
        findAndReplaceInFile(file, /@@publicUrl\/@@buildTag\//g, `${publicUrl}/${process.env.REACT_APP_CLIENT_VERSION}/`),
      );

      // 4- Rewrite folder structure name in all js files
      const jsFileNames = await fs.readdir(`./build/${process.env.REACT_APP_CLIENT_VERSION}/static/js`);
      await asyncForEach(jsFileNames, file =>
        findAndReplaceInFile(
          `./build/${process.env.REACT_APP_CLIENT_VERSION}/static/js/${file}`,
          /@@publicUrl\/@@buildTag\/static\//g,
          `${publicUrl}/${process.env.REACT_APP_CLIENT_VERSION}/static/`,
        ),
      );

      // 5- Rewrite folder structure name in all css files
      const cssFileNames = await fs.readdir(`./build/${process.env.REACT_APP_CLIENT_VERSION}/static/css`);
      await asyncForEach(cssFileNames, file =>
        findAndReplaceInFile(
          `./build/${process.env.REACT_APP_CLIENT_VERSION}/static/css/${file}`,
          /@@publicUrl\/@@buildTag\/static\//g,
          `${publicUrl}/${process.env.REACT_APP_CLIENT_VERSION}/static/`,
        ),
      );
    } else {
      console.log('Not setting client version: REACT_APP_CLIENT_VERSION is not defined')
    }
  } catch (err) {
    console.log(err);
  }
})();

import { Command } from 'commander';

import initialiseEnvironmentVariables from './init-env';
import performPreChecks from './pre-checks';
import setClientVersion from './set-client-version';

const pjson = require('../package.json');

async function processCommands(
  destinationFilePath: string,
  schemaPath: string,
  environmentType: 'local' | 'docker',
): Promise<void> {
  await performPreChecks(environmentType === 'local');
  await initialiseEnvironmentVariables(
    destinationFilePath,
    schemaPath,
    environmentType,
  );
  // if (environmentType === 'docker') {
  //   if (
  //     process.env.REACT_APP_CLIENT_VERSION !== undefined &&
  //     process.env.REACT_APP_CLIENT_VERSION.trim() !== ''
  //   ) {
  //     await setClientVersion(process.env.REACT_APP_CLIENT_VERSION);
  //   } else {
  //     console.log(
  //       'Not setting client version: REACT_APP_CLIENT_VERSION is not defined',
  //     );
  //   }
  // }
}

function runOrTimeout(command: Promise<void>) {
  Promise.race([command])
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export function cli(args: string[]) {
  const program = new Command();
  program
    .requiredOption(
      '-d, --destination [string]',
      'path to the destination folder to dump the window.env.js file.',
    )
    .option(
      '-s, --schema [string]',
      'path to the joi schema used to validate custom environment variables.',
    )
    .option(
      '--local [boolean]',
      'specify if a local build - will load variables from .env',
      false,
    )
    .version(pjson.version)
    .description('Prepare the create-react-app project for docker');

  program.parse();

  const options = program.opts();

  const initialiseEnvironmentVariablesPromise = processCommands(
    options.destination,
    options.schema,
    options.local ? 'local' : 'docker',
  );
  runOrTimeout(initialiseEnvironmentVariablesPromise);
}

export { default as DockerCRABaseEnvType } from './base-environment-type';

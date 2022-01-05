import { Command, Option } from 'commander';

import initialiseEnvironmentVariables from './init-env';
import performPreChecks from './pre-checks';
import { EnvironmentType, ProjectType } from './environments';

const pjson = require('../package.json');

async function processCommands(
  destinationFilePath: string,
  schemaPath: string,
  environmentType: EnvironmentType,
  projectType: ProjectType,
): Promise<void> {
  await performPreChecks(destinationFilePath, environmentType, projectType);
  await initialiseEnvironmentVariables(
    destinationFilePath,
    schemaPath,
    environmentType,
    projectType,
  );
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

export function cli() {
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
    .addOption(
      new Option('-t, --type [string]', 'type of project being bootstrapped')
        .default('react')
        .choices(['react', 'vite']),
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
  const environment = options.local ? 'local' : 'docker';

  console.log(
    `docker-cra attempting to initialise a [${options.type}] project for a [${environment}] environment.`,
  );

  const initialiseEnvironmentVariablesPromise = processCommands(
    options.destination,
    options.schema,
    environment,
    options.type,
  );
  runOrTimeout(initialiseEnvironmentVariablesPromise);
}

export { default as DockerCRABaseEnvType } from './base-environment-type';

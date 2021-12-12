import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import Joi from 'joi';
import dotenv from 'dotenv';

import DockerCRABaseEnvType from './base-environment-type';
import {
  ENVIRONMENT_DEFINITION_FILE_NAME,
  REQUIRED_INDEX_SCRIPT,
} from './constants';
import { EnvironmentType, getIndexPath } from './environments';

const baseSchema = Joi.object<DockerCRABaseEnvType>({
  REACT_APP_CLIENT_VERSION: Joi.string().required(),
  PUBLIC_URL: Joi.string().required().allow('').empty(''),
});

function validateEnvironmentVariables<T>(
  schema: Joi.Schema<T>,
  environmentVariables: any,
): T {
  const joiResult = schema.validate(environmentVariables, {
    allowUnknown: true,
    abortEarly: false,
    stripUnknown: true,
  });

  if (joiResult.error) {
    throw new Error(joiResult.error.message);
  }

  return joiResult.value;
}

async function findAndReplaceInFile(
  filePath: string,
  fromSearchValue: RegExp | string,
  toSearchFile: string,
) {
  const data = await fs.readFile(filePath, 'utf8');
  const result = data.replace(fromSearchValue, toSearchFile);
  await fs.writeFile(filePath, result, 'utf8');
}

export default async function initEnv(
  destinationFilePath: string,
  schemaPath: string,
  environmentType: EnvironmentType,
) {
  // Local builds should read from `.env` file if available.
  if (environmentType === 'local') {
    const result = dotenv.config();
    if (result.error) {
      throw result.error;
    }
  }

  // Perform environment variable validation.
  const schemaLocation = path.join(process.cwd(), schemaPath);
  console.log(`Attempting to load schema from ${schemaLocation}`);
  const providedSchema = require(schemaLocation);
  const envSchema = baseSchema.concat(providedSchema);
  console.log('Validating environment variables');
  const validatedWindowVariables = validateEnvironmentVariables(
    envSchema,
    process.env,
  );

  // Prepare file and calculate hash
  console.log('Attempting to generate environment file.');
  const mappedWindowVariables = Object.entries(validatedWindowVariables).map(
    (entry) => `${entry[0]}:'${entry[1]}'`,
  );
  const windowVariablesToBeWrittenToFile = `window.env={${mappedWindowVariables}};`;
  const environmentFileHash = createHash('md5')
    .update(windowVariablesToBeWrittenToFile)
    .digest('hex');
  console.log(`Environment file generated with hash [${environmentFileHash}]`);

  // Write environment file
  const fileNamePrefix =
    environmentType === 'docker' ? `${environmentFileHash}.` : '';
  const environmentFileName = `${fileNamePrefix}${ENVIRONMENT_DEFINITION_FILE_NAME}`;
  const envFileDestination = path.join(
    destinationFilePath,
    environmentFileName,
  );
  console.log(`Writing window env file to ${envFileDestination}`);
  await fs.writeFile(
    envFileDestination,
    windowVariablesToBeWrittenToFile,
    'utf8',
  );

  // If required write result to index.html
  if (environmentType === 'docker') {
    const indexPath = path.join(
      destinationFilePath,
      getIndexPath(environmentType),
    );
    const publicUrl =
      process.env.PUBLIC_URL === '/' ? '' : process.env.PUBLIC_URL;
    const expectedIndexScript = REQUIRED_INDEX_SCRIPT.replace(
      '%PUBLIC_URL%',
      publicUrl || '',
    );
    const desiredIndexScript = expectedIndexScript.replace(
      'window.env.js',
      environmentFileName,
    );
    console.log(
      `Attempting to replace ${expectedIndexScript} with ${desiredIndexScript} in ${indexPath}`,
    );
    await findAndReplaceInFile(
      indexPath,
      expectedIndexScript,
      desiredIndexScript,
    );
  }

  console.log('Environment variables initialised successfully');
}

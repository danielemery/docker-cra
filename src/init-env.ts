import { promises as fs } from 'fs';
import path from 'path';
import Joi from 'joi';
import dotenv from 'dotenv';

import DockerCRABaseEnvType from './base-environment-type';
import { ENVIRONMENT_DEFINITION_FILE_NAME } from './constants';

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

export default async function initEnv(
  destinationFilePath: string,
  schemaPath: string,
  environmentType: 'local' | 'docker',
) {
  if (environmentType === 'local') {
    const result = dotenv.config();
    if (result.error) {
      throw result.error;
    }
  }

  const finalDestination = path.join(
    process.cwd(),
    destinationFilePath,
    ENVIRONMENT_DEFINITION_FILE_NAME,
  );
  const finalSchema = path.join(process.cwd(), schemaPath);
  console.log(`Writing window env file to ${finalDestination}`);
  console.log(`Attempting to load schema from ${finalSchema}`);
  const providedSchema = require(finalSchema);
  const envSchema = baseSchema.concat(providedSchema);
  console.log('Validating environment variables');
  const validatedWindowVariables = validateEnvironmentVariables(
    envSchema,
    process.env,
  );

  console.log('Writing environment variables to file.');
  const mappedWindowVariables = Object.entries(validatedWindowVariables).map(
    (entry) => `${entry[0]}:'${entry[1]}'`,
  );
  const windowVariablesToBeWrittenToFile = `window.env={${mappedWindowVariables}};`;
  await fs.writeFile(
    finalDestination,
    windowVariablesToBeWrittenToFile,
    'utf8',
  );

  console.log('Environment variables initialised successfully');
}

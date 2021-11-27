import { writeFile } from "fs";
import path from "path";
import Joi from "joi";
import dotenv from "dotenv";

const baseSchema = Joi.object({
  REACT_APP_CLIENT_VERSION: Joi.string().required(),
  PUBLIC_URL: Joi.string().required().allow("").empty(""),
});

function validateEnvironmentVariables<T>(
  schema: Joi.Schema<T>,
  environmentVariables: any
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
  environmentType: "local" | "docker"
) {
  if (environmentType === "local") {
    const result = dotenv.config();
    if (result.error) {
      throw result.error;
    }
  }

  const finalDestination = path.join(process.cwd(), destinationFilePath);
  const finalSchema = path.join(process.cwd(), schemaPath);
  console.log(`Writing window env file to ${finalDestination}`);
  console.log(`Attempting to load schema from ${finalSchema}`);
  const providedSchema = require(finalSchema);
  const envSchema = baseSchema.concat(providedSchema);
  console.log("Validating environment variables");
  const validatedWindowVariables = validateEnvironmentVariables(
    envSchema,
    process.env
  );

  console.log("Writing environment variables to file.");
  const mappedWindowVariables = Object.entries(validatedWindowVariables).map(
    (entry) => `${entry[0]}:'${entry[1]}'`
  );
  const windowVariablesToBeWrittenToFile = `window.env={${mappedWindowVariables}};`;
  await new Promise<void>((resolve, reject) => {
    writeFile(
      finalDestination,
      windowVariablesToBeWrittenToFile,
      "utf8",
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  console.log("Environment variables initialised successfully");
}

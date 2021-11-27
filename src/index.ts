import initialiseEnvironmentVariables from "./init-env";

async function processCommands(
  destinationFilePath: string,
  schemaPath: string,
  environmentType: "local" | "docker"
): Promise<void> {
  await initialiseEnvironmentVariables(
    destinationFilePath,
    schemaPath,
    environmentType
  );
}

export function cli(args: string[]) {
  // TODO parse environment variables properly.
  const initialiseEnvironmentVariablesPromise = processCommands(args[2], args[3], "local");
  // TODO also set client version
  Promise.race([initialiseEnvironmentVariablesPromise]).then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

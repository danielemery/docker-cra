import { promises as fs } from 'fs';
import path from 'path';
import { EnvironmentType, ProjectType, getIndexPath, getRequiredIndexScript } from './environments';

export default async function performPreChecks(
  environmentType: EnvironmentType,
  projectType: ProjectType,
) {
  switch (environmentType) {
    case 'local':
      try {
        const indexPath = path.join(
          process.cwd(),
          getIndexPath(environmentType, projectType),
        );
        const file = await fs.readFile(indexPath, 'utf8');
        const requiredIndexScript = getRequiredIndexScript(projectType);
        if (file.indexOf(requiredIndexScript) < 0) {
          throw new Error(
            `Could not find required script ${requiredIndexScript} in ${indexPath}`,
          );
        }
      } catch (err: any) {
        throw new Error(`Project not set up for local ${err?.message}`);
      }
    default:
      return;
  }
}

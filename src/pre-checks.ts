import { promises as fs } from 'fs';
import path from 'path';
import { REQUIRED_INDEX_SCRIPT } from './constants';
import { EnvironmentType, ProjectType, getIndexPath } from './environments';

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
        if (file.indexOf(REQUIRED_INDEX_SCRIPT) < 0) {
          throw new Error(
            `Could not find required script ${REQUIRED_INDEX_SCRIPT} in ${indexPath}`,
          );
        }
      } catch (err: any) {
        throw new Error(`Project not set up for local ${err?.message}`);
      }
    default:
      return;
  }
}

import { promises as fs } from 'fs';
import path from 'path';
import { EnvironmentType } from './types';

const REQUIRED_INDEX_SCRIPT = `<script src="%PUBLIC_URL%/window.env.js"></script>`;

export default async function performPreChecks(
  environmentType: EnvironmentType,
) {
  switch (environmentType) {
    case 'local':
      try {
        const indexPath = path.join(process.cwd(), `./public/index.html`);
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

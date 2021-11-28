import { promises as fs } from 'fs';
import path from 'path';

const REQUIRED_INDEX_SCRIPT = `<script src="%PUBLIC_URL%/window.env.js"></script>`;

export default async function performPreChecks(isLocal: boolean) {
  if (isLocal) {
    try {
      const indexPath = path.join(process.cwd(), `./public/index.html`);
      const file = await fs.readFile(indexPath, "utf8");
      if (file.indexOf(REQUIRED_INDEX_SCRIPT) < 0) {
        throw new Error(`Could not find required script ${REQUIRED_INDEX_SCRIPT} in ${indexPath}`);
      }
    } catch (err: any) {
      throw new Error(`Project not set up for local ${err?.message}`);
    }
  }
}

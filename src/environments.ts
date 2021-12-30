export type EnvironmentType = 'local' | 'docker';
export type ProjectType = 'react' | 'vite';

export function getIndexPath(
  environmentType: EnvironmentType,
  projectType: ProjectType,
) {
  switch (environmentType) {
    case 'docker':
      return 'index.html';
    case 'local':
      switch (projectType) {
        case 'vite':
          return 'index.html';
        case 'react':
          return 'public/index.html';
        default:
          throw new Error(`Unknown project type: ${projectType}`);
      }
    default:
      throw new Error(`Unknown environment type: ${environmentType}`);
  }
}

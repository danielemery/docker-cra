export type EnvironmentType = 'local' | 'docker';

export function getIndexPath(environmentType: EnvironmentType) {
  switch (environmentType) {
    case 'docker':
      return 'index.html';
    case 'local':
      return 'public/index.html';
    default:
      throw new Error(`Unknown environment type: ${environmentType}`);
  }
}

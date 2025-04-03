import micromatch from 'micromatch';

export function matchPath(path: string, pattern: string | string[]): boolean {
  return micromatch.isMatch(path, pattern);
}

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

/** auto-content-pipeline 仓库根目录 */
export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

/** 内置技能包目录（进 Git） */
export const skillsRoot = join(repoRoot, 'skills');

/** 安装时 clone 的外部依赖（gitignore） */
export const toolRoot = join(repoRoot, 'tool');

export function skillPkg(name) {
  return join(skillsRoot, name);
}

export function toolPath(...parts) {
  return join(toolRoot, ...parts);
}

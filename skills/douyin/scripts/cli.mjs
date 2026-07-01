#!/usr/bin/env node
/**
 * Douyin Skills CLI — 黑底花字竖版视频 + Edge TTS
 */
import { cmdCreateVideo } from './commands/create-video.mjs';

const USAGE = `Douyin Skills CLI

Commands:
  create-video    TTS + fancy text vertical MP4 (1080x1920)

Options:
  --file, -f <path>   Script markdown absolute path
  --slug, -s <slug>   Slug under HERMES_ROOT/文章/抖音/
  --out, -o <dir>     Output directory (default: HERMES_ROOT/视频/{slug}/)

Env:
  HERMES_ROOT         Default D:/test/hermes
  USER_PROFILE_PATH   user-profile.md path
`;

const [command, ...rest] = process.argv.slice(2);

if (!command || command === '--help' || command === '-h') {
  console.log(USAGE);
  process.exit(0);
}

const handlers = {
  'create-video': () => cmdCreateVideo(rest),
};

const handler = handlers[command];
if (!handler) {
  console.error(`Unknown command: ${command}\n`);
  console.log(USAGE);
  process.exit(1);
}

await handler();

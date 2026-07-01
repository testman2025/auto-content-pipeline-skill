#!/usr/bin/env node
/**
 * YouTube Skills 统一 CLI（对标 skills/xiaohongshu/scripts/cli.py）
 *
 * 用法:
 *   node skills/youtube/scripts/cli.mjs <command> [options]
 */
import { cmdCheckLogin, cmdLogin } from './commands/auth.mjs';
import { cmdPublish } from './commands/publish.mjs';
import { cmdCreateVideo, cmdPipeline } from './commands/pipeline.mjs';
import { requireOverseasConsent } from '../../../scripts/lib/overseas-guard.mjs';

const USAGE = `YouTube Skills CLI

命令:
  check-login              检查 Studio 登录状态（JSON 输出）
  login                    打开/复用浏览器完成登录
  publish                  上传并发布视频
  create-video             TTS + 合成 16:9 视频（不发布）
  pipeline                 用户画像 → 创作 → 发布 全流程

publish 参数:
  --video, -v <path>       视频绝对路径
  --title, -t <text>       标题
  --description, -d <text> 描述（可选）
  --privacy, -p <level>    public | unlisted | private（默认 unlisted）

环境变量:
  OVERSEAS_ALLOW_AUTOMATION  海外 login/check/publish 总开关（默认关闭）
  CHROME_CDP_URL           附着已打开的 Chrome（推荐）
  YOUTUBE_CHANNEL_ID       频道 ID
  VIDEO_PRIVACY            可见性
  HERMES_ROOT              内容归档根目录（默认 D:/test/hermes）
  USER_PROFILE_PATH        用户画像路径
`;

const [command, ...rest] = process.argv.slice(2);

if (!command || command === '--help' || command === '-h') {
  console.log(USAGE);
  process.exit(0);
}

const handlers = {
  'check-login': () => {
    requireOverseasConsent('youtube', 'check-login');
    return cmdCheckLogin();
  },
  login: () => {
    requireOverseasConsent('youtube', 'login');
    return cmdLogin();
  },
  publish: () => {
    requireOverseasConsent('youtube', 'publish');
    return cmdPublish(rest);
  },
  'create-video': () => cmdCreateVideo(rest),
  pipeline: () => {
    requireOverseasConsent('youtube', 'pipeline');
    return cmdPipeline();
  },
};

const handler = handlers[command];
if (!handler) {
  console.error(`未知命令: ${command}\n`);
  console.log(USAGE);
  process.exit(1);
}

await handler();

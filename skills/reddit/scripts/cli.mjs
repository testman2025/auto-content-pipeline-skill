#!/usr/bin/env node
/**
 * Reddit CLI 封装 — 调用 tool/reddit-skills/scripts/cli.py
 */
import { runRedditCli } from '../../../scripts/lib/reddit.mjs';

const [command, ...rest] = process.argv.slice(2);

const alias = {
  login: ['check-login'],
  feed: ['subreddit-feed'],
};

const args = alias[command] ? [...alias[command], ...rest] : command ? [command, ...rest] : [];

if (!command) {
  console.log(`Reddit CLI（1146345502/reddit-skills）

  check-login | login
  subreddit-feed | feed --subreddit NAME [--sort hot] [--limit 10]
  search --query "..."
  submit-text --subreddit NAME --title-file f --body-file f
  submit-link --subreddit NAME --title-file f --url URL

npm: reddit:check-login | reddit:feed | reddit:publish

扩展: chrome://extensions → 加载 tool/reddit-skills/extension/`);
  process.exit(0);
}

runRedditCli(args);

/** 帮助页 GitHub 按钮与仓库链接（可用 .env 覆盖） */
export const GITHUB_OWNER = (import.meta.env.VITE_GITHUB_OWNER as string | undefined) ?? 'GQ-Y';
export const GITHUB_REPO = (import.meta.env.VITE_GITHUB_REPO as string | undefined) ?? 'nps-desgin';
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`;
export const GITHUB_STARGAZERS_URL = `${GITHUB_REPO_URL}/stargazers`;
export const GITHUB_FORK_URL = `${GITHUB_REPO_URL}/fork`;
/** 仓库近期动态（替代无法深链的 Watch 订阅） */
export const GITHUB_PULSE_URL = `${GITHUB_REPO_URL}/pulse`;

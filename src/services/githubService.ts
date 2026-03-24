/**
 * GitHub API 服务
 * 用于将博客文章数据推送到 GitHub 仓库，触发 Actions 自动部署
 */

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

export interface PublishResult {
  success: boolean;
  message: string;
  commitUrl?: string;
}

const CONFIG_KEY = 'github-publish-config';

/** 从 localStorage 读取 GitHub 配置 */
export function loadGitHubConfig(): GitHubConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GitHubConfig;
  } catch {
    return null;
  }
}

/** 保存 GitHub 配置到 localStorage */
export function saveGitHubConfig(config: GitHubConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

/** 清除 GitHub 配置 */
export function clearGitHubConfig(): void {
  localStorage.removeItem(CONFIG_KEY);
}

/** 验证 GitHub Token 是否有效（请求仓库信息） */
export async function validateGitHubConfig(config: GitHubConfig): Promise<{ valid: boolean; message: string }> {
  try {
    const resp = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}`,
      {
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );
    if (resp.ok) {
      const data = await resp.json();
      return { valid: true, message: `仓库「${data.full_name}」连接成功` };
    }
    if (resp.status === 401) return { valid: false, message: 'Token 无效或已过期' };
    if (resp.status === 404) return { valid: false, message: '仓库不存在，请检查 owner/repo 是否正确' };
    return { valid: false, message: `验证失败：HTTP ${resp.status}` };
  } catch {
    return { valid: false, message: '网络错误，请检查网络连接' };
  }
}

/**
 * 将所有文章序列化为 posts.ts 文件内容
 */
function serializePostsFile(posts: import('../types').Post[]): string {
  const postsJson = JSON.stringify(posts, null, 2)
    // 将 JSON 中的双引号字符串适配为 TS 语法（保留 as const 等）
    .replace(/"status": "published"/g, '"status": "published" as const')
    .replace(/"status": "draft"/g, '"status": "draft" as const');

  return `import type { Post } from '../types';

export const posts: Post[] = ${postsJson};
`;
}

/**
 * 获取文件当前的 SHA（更新文件时必须提供）
 */
async function getFileSha(config: GitHubConfig, path: string): Promise<string | null> {
  const resp = await fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`,
    {
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: 'application/vnd.github+json',
      },
    }
  );
  if (!resp.ok) return null;
  const data = await resp.json();
  return data.sha ?? null;
}

/**
 * 推送文章数据到 GitHub，触发自动部署
 */
export async function publishToGitHub(
  config: GitHubConfig,
  posts: import('../types').Post[],
  commitMessage?: string
): Promise<PublishResult> {
  const filePath = 'src/data/posts.ts';
  const content = serializePostsFile(posts);
  const contentBase64 = btoa(unescape(encodeURIComponent(content)));
  const message = commitMessage || `content: update posts (${new Date().toISOString().slice(0, 10)})`;

  try {
    // 获取文件当前 SHA
    const sha = await getFileSha(config, filePath);

    const body: Record<string, unknown> = {
      message,
      content: contentBase64,
      branch: config.branch,
    };
    if (sha) body.sha = sha;

    const resp = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (resp.ok) {
      const data = await resp.json();
      const commitUrl = data.commit?.html_url;
      return {
        success: true,
        message: '已推送到 GitHub，Actions 正在自动部署，约 1 分钟后生效',
        commitUrl,
      };
    }

    const err = await resp.json().catch(() => ({}));
    return {
      success: false,
      message: `推送失败：${(err as { message?: string }).message || `HTTP ${resp.status}`}`,
    };
  } catch (e) {
    return {
      success: false,
      message: `网络错误：${e instanceof Error ? e.message : '未知错误'}`,
    };
  }
}

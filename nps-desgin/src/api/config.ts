/**
 * nps 后端 API 基础配置
 * 开发时通过 Vite proxy 转发到 http://127.0.0.1:8080
 */
export const API_BASE =
  import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? '' : '');

export function apiUrl(path: string): string {
  const base = API_BASE.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return base + p;
}

/**
 * nps 后端 API 客户端
 * 完全复刻 web 管理面板的接口，使用 credentials 携带 session cookie
 */
import { apiUrl } from './config';

const defaultOptions: RequestInit = {
  credentials: 'include',
  headers: {
    Accept: 'application/json',
  },
};

function formBody(params: Record<string, string | number | boolean | undefined>): string {
  const pairs: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') pairs.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  return pairs.join('&');
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: T;
  try {
    data = text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    throw new Error(res.status === 401 ? '未登录' : `请求失败: ${res.status}`);
  }
  if (!res.ok) {
    const err = data as { msg?: string; error?: string };
    throw new Error(err.msg ?? err.error ?? `请求失败: ${res.status}`);
  }
  return data;
}

// --- 登录 ---
export interface LoginResult {
  status: number;
  msg: string;
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const res = await fetch(apiUrl('/login/verify'), {
    ...defaultOptions,
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody({ username, password }),
  });
  return handleResponse<LoginResult>(res);
}

export async function logout(): Promise<void> {
  await fetch(apiUrl('/login/out'), { ...defaultOptions, method: 'GET', redirect: 'manual' });
}

export interface PublicConfig {
  allow_user_register?: boolean;
}

export async function getPublicConfig(): Promise<PublicConfig> {
  const res = await fetch(apiUrl('/api/public-config'), { ...defaultOptions, method: 'GET' });
  return handleResponse<PublicConfig>(res);
}

export interface RegisterResult {
  status: number;
  msg: string;
}

export async function register(username: string, password: string): Promise<RegisterResult> {
  const res = await fetch(apiUrl('/login/register'), {
    ...defaultOptions,
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody({ username, password }),
  });
  return handleResponse<RegisterResult>(res);
}

// --- 仪表盘（需后端提供 /api/dashboard，见下方说明）---
export interface DashboardData {
  version?: string;
  clientCount?: number;
  clientOnlineCount?: number;
  tcpCount?: number;
  hostCount?: number;
  inletFlowCount?: number;
  exportFlowCount?: number;
  tcpC?: number;
  udpCount?: number;
  socks5Count?: number;
  httpProxyCount?: number;
  secretCount?: number;
  p2pCount?: number;
  bridgeType?: string;
  httpProxyPort?: string;
  httpsProxyPort?: string;
  ipLimit?: string;
  flowStoreInterval?: string;
  serverIp?: string;
  p2pPort?: string;
  logLevel?: string;
  load?: string;
  cpu?: number;
  virtual_mem?: number;
  swap_mem?: number;
  io_send?: number;
  io_recv?: number;
  tcp?: number;
  udp?: number;
  [key: string]: unknown;
}

export async function getDashboard(): Promise<DashboardData> {
  const res = await fetch(apiUrl('/api/dashboard'), { ...defaultOptions, method: 'GET' });
  if (res.status === 401) throw new Error('未登录');
  return handleResponse<DashboardData>(res);
}

// --- 通知 ---
export interface Notification {
  id: number;
  type: string;
  client_id: number;
  remark: string;
  addr: string;
  created_at: string;
}

export async function getNotifications(): Promise<Notification[]> {
  const res = await fetch(apiUrl('/api/notifications'), { ...defaultOptions, method: 'GET' });
  if (res.status === 401) throw new Error('未登录');
  return handleResponse<Notification[]>(res);
}

// --- 客户端分组 ---
export interface ClientGroup {
  id: number;
  parent_id: number;
  name: string;
  sort_order: number;
}

export async function getGroups(): Promise<ClientGroup[]> {
  const res = await fetch(apiUrl('/api/groups'), { ...defaultOptions, method: 'GET' });
  if (res.status === 401) throw new Error('未登录');
  return handleResponse<ClientGroup[]>(res);
}

export async function addGroup(params: { parent_id?: number; name: string; sort_order?: number }): Promise<{ status: number; msg: string; id?: number }> {
  const res = await fetch(apiUrl('/api/groups/add'), {
    ...defaultOptions,
    method: 'POST',
    headers: { ...defaultOptions.headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody(params),
  });
  return handleResponse(res);
}

export async function editGroup(params: { id: number; name?: string; parent_id?: number; sort_order?: number }): Promise<{ status: number; msg: string }> {
  const res = await fetch(apiUrl('/api/groups/edit'), {
    ...defaultOptions,
    method: 'POST',
    headers: { ...defaultOptions.headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody(params),
  });
  return handleResponse(res);
}

export async function moveGroup(id: number, parentId: number): Promise<{ status: number; msg: string }> {
  const res = await fetch(apiUrl('/api/groups/move-group'), {
    ...defaultOptions,
    method: 'POST',
    headers: { ...defaultOptions.headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody({ id, parent_id: parentId }),
  });
  return handleResponse(res);
}

export async function delGroup(id: number): Promise<{ status: number; msg: string }> {
  const res = await fetch(apiUrl('/api/groups/del'), {
    ...defaultOptions,
    method: 'POST',
    headers: { ...defaultOptions.headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody({ id }),
  });
  return handleResponse(res);
}

export async function moveClientToGroup(clientId: number, groupId: number): Promise<{ status: number; msg: string }> {
  const res = await fetch(apiUrl('/api/groups/move-client'), {
    ...defaultOptions,
    method: 'POST',
    headers: { ...defaultOptions.headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody({ client_id: clientId, group_id: groupId }),
  });
  return handleResponse(res);
}

// --- 客户端 ---
export interface ClientListParams {
  offset?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: string;
  group_id?: number;
}

export interface ClientListResult {
  rows: Array<{
    Id: number;
    GroupId?: number;
    Remark?: string;
    Version?: string;
    VerifyKey?: string;
    Addr?: string;
    Flow?: { InletFlow?: number; ExportFlow?: number; FlowLimit?: number };
    Rate?: { NowRate?: number };
    Status?: boolean;
    IsConnect?: boolean;
    MaxConn?: number;
    NowConn?: number;
    RateLimit?: number;
    MaxTunnelNum?: number;
    WebUserName?: string;
    WebPassword?: string;
    Cnf?: { U?: string; P?: string; Crypt?: boolean; Compress?: boolean };
    ConfigConnAllow?: boolean;
    NoStore?: boolean;
  }>;
  total: number;
  ip?: string;
  bridgeType?: string;
  bridgePort?: number;
}

export async function getClientList(params: ClientListParams): Promise<ClientListResult> {
  const res = await fetch(apiUrl('/client/list'), {
    ...defaultOptions,
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody({
      offset: params.offset ?? 0,
      limit: params.limit ?? 10,
      search: params.search,
      sort: params.sort,
      order: params.order,
      group_id: params.group_id ?? 0,
    }),
  });
  return handleResponse<ClientListResult>(res);
}

export async function getClient(id: number): Promise<{ code: number; data?: unknown }> {
  const res = await fetch(apiUrl('/client/getclient'), {
    ...defaultOptions,
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody({ id }),
  });
  return handleResponse(res);
}

export async function addClient(params: Record<string, string | number | boolean | undefined>): Promise<{ status: number; msg: string }> {
  const res = await fetch(apiUrl('/client/add'), {
    ...defaultOptions,
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody(params),
  });
  return handleResponse(res);
}

export async function editClient(params: Record<string, string | number | boolean | undefined>): Promise<{ status: number; msg: string }> {
  const res = await fetch(apiUrl('/client/edit'), {
    ...defaultOptions,
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody(params),
  });
  return handleResponse(res);
}

export async function changeClientStatus(id: number, status: boolean): Promise<{ status: number; msg: string }> {
  const res = await fetch(apiUrl('/client/changestatus'), {
    ...defaultOptions,
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody({ id, status: status ? '1' : '0' }),
  });
  return handleResponse(res);
}

export async function delClient(id: number): Promise<{ status: number; msg: string }> {
  const res = await fetch(apiUrl('/client/del'), {
    ...defaultOptions,
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody({ id }),
  });
  return handleResponse(res);
}

// --- 隧道 ---
export interface TunnelListParams {
  offset?: number;
  limit?: number;
  type?: string;
  client_id?: number;
  search?: string;
}

export interface TunnelListResult {
  rows: Array<{
    Id: number;
    Port?: number;
    Mode?: string;
    Remark?: string;
    Status?: boolean;
    RunStatus?: boolean;
    Password?: string;
    ServerIp?: string;
    LocalPath?: string;
    StripPre?: string;
    Client?: {
      Id: number;
      VerifyKey?: string;
      IsConnect?: boolean;
      Cnf?: { U?: string; P?: string; Crypt?: boolean; Compress?: boolean };
    };
    Target?: { TargetStr?: string; LocalProxy?: boolean };
    Flow?: { InletFlow?: number; ExportFlow?: number };
  }>;
  total: number;
}

export async function getTunnelList(params: TunnelListParams): Promise<TunnelListResult> {
  const res = await fetch(apiUrl('/index/gettunnel'), {
    ...defaultOptions,
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody({
      offset: params.offset ?? 0,
      limit: params.limit ?? 10,
      type: params.type ?? '',
      client_id: params.client_id ?? 0,
      search: params.search ?? '',
    }),
  });
  return handleResponse(res);
}

export async function getOneTunnel(id: number): Promise<{ code: number; data?: unknown }> {
  const res = await fetch(apiUrl('/index/getonetunnel'), {
    ...defaultOptions,
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody({ id }),
  });
  return handleResponse(res);
}

export async function addTunnel(params: Record<string, string | number | boolean | undefined>): Promise<{ status: number; msg: string }> {
  const res = await fetch(apiUrl('/index/add'), {
    ...defaultOptions,
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody(params),
  });
  return handleResponse(res);
}

export async function editTunnel(params: Record<string, string | number | boolean | undefined>): Promise<{ status: number; msg: string }> {
  const res = await fetch(apiUrl('/index/edit'), {
    ...defaultOptions,
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody(params),
  });
  return handleResponse(res);
}

export async function startTunnel(id: number): Promise<{ status: number; msg: string }> {
  const res = await fetch(apiUrl('/index/start'), {
    ...defaultOptions,
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody({ id }),
  });
  return handleResponse(res);
}

export async function stopTunnel(id: number): Promise<{ status: number; msg: string }> {
  const res = await fetch(apiUrl('/index/stop'), {
    ...defaultOptions,
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody({ id }),
  });
  return handleResponse(res);
}

export async function delTunnel(id: number): Promise<{ status: number; msg: string }> {
  const res = await fetch(apiUrl('/index/del'), {
    ...defaultOptions,
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody({ id }),
  });
  return handleResponse(res);
}

// --- 域名解析 ---
export interface HostListParams {
  offset?: number;
  limit?: number;
  client_id?: number;
  search?: string;
}

export interface HostListResult {
  rows: Array<{
    Id: number;
    Host?: string;
    Scheme?: string;
    Location?: string;
    Remark?: string;
    HeaderChange?: string;
    HostChange?: string;
    CertFilePath?: string;
    KeyFilePath?: string;
    Client?: { Id: number; IsConnect?: boolean };
    Target?: { TargetStr?: string };
    Flow?: { InletFlow?: number; ExportFlow?: number };
  }>;
  total: number;
}

export async function getHostList(params: HostListParams & { client_id?: number }): Promise<HostListResult> {
  let path = apiUrl('/index/hostlist');
  if (params.client_id != null) path += (path.includes('?') ? '&' : '?') + `client_id=${params.client_id}`;
  const res = await fetch(path, {
    ...defaultOptions,
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody({
      offset: params.offset ?? 0,
      limit: params.limit ?? 10,
      search: params.search ?? '',
      client_id: params.client_id ?? 0,
    }),
  });
  return handleResponse(res);
}

export async function getHost(id: number): Promise<{ code: number; data?: unknown }> {
  const res = await fetch(apiUrl('/index/gethost'), {
    ...defaultOptions,
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody({ id }),
  });
  return handleResponse(res);
}

export async function addHost(params: Record<string, string | number | boolean | undefined>): Promise<{ status: number; msg: string }> {
  const res = await fetch(apiUrl('/index/addhost'), {
    ...defaultOptions,
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody(params),
  });
  return handleResponse(res);
}

export async function editHost(params: Record<string, string | number | boolean | undefined>): Promise<{ status: number; msg: string }> {
  const res = await fetch(apiUrl('/index/edithost'), {
    ...defaultOptions,
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody(params),
  });
  return handleResponse(res);
}

export async function delHost(id: number): Promise<{ status: number; msg: string }> {
  const res = await fetch(apiUrl('/index/delhost'), {
    ...defaultOptions,
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody({ id }),
  });
  return handleResponse(res);
}

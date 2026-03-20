import React from 'react';

/**
 * 侧栏图标设计规范：
 * - viewBox: 0 0 24 24（统一画布）
 * - 尺寸: 20x20
 * - strokeWidth: 2（统一线宽）
 * - 安全区: 图形主体在 4~20 范围内
 */
const ICON_PROPS = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: 'transition-all duration-200 shrink-0',
};

/** 工作台 - 仪表盘/数据看板 */
export function IconDashboard({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="10" width="7" height="11" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

/** 客户端 - 终端/设备 */
export function IconClients({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 12h.01M10 12h.01M14 12h.01" />
      <path d="M8 18v2M16 18v2" />
    </svg>
  );
}

/** 域名解析 - 地球/路由 */
export function IconDomain({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

/** TCP - 双向箭头/链路（对称，24x24 画布内） */
export function IconTcp({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <path d="M8 16L16 8M16 8h-4M16 8v4" />
      <path d="M16 16L8 8M8 8h4M8 8v4" />
    </svg>
  );
}

/** UDP - 数据报 */
export function IconUdp({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
      <path d="M4 6h16M4 10h16M8 14h8" />
    </svg>
  );
}

/** HTTP 代理 - 网关 */
export function IconHttp({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 8h2l1 4 1-4h2M16 12h-2v2" />
      <path d="M14 12v4h2" />
    </svg>
  );
}

/** SOCKS5 - 代理层 */
export function IconSocks5({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** Secret 隧道 - 密钥/通道 */
export function IconSecret({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M7 9v8M17 9v8" />
    </svg>
  );
}

/** P2P - 点对点 */
export function IconP2p({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="7" cy="12" r="3" />
      <circle cx="17" cy="12" r="3" />
      <path d="M10 12h4" />
    </svg>
  );
}

/** 文件服务 - 文件夹 */
export function IconFile({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <path d="M12 11v6M9 14h6" />
    </svg>
  );
}

/** 帮助 */
export function IconHelp({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

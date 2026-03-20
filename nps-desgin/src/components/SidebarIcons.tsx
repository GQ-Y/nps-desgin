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

/** 工作台 - 仪表盘/数据看板（4 宫格） */
export function IconDashboard({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </svg>
  );
}

/** 客户端 - 终端/设备（显示器+底座） */
export function IconClients({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <rect x="4" y="5" width="16" height="11" rx="1" />
      <path d="M8 9h8M8 12h5" />
      <path d="M10 18v2M14 18v2" />
      <path d="M9 18h6" />
    </svg>
  );
}

/** 域名解析 - 地球/路由 */
export function IconDomain({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a9 9 0 0 1 0 18 9 9 0 0 1 0-18" />
    </svg>
  );
}

/** TCP - 双向连接/可靠链路（水平线+两端箭头） */
export function IconTcp({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <path d="M6 12h10" />
      <path d="M8 10L6 12l2 2" />
      <path d="M14 10l2 2-2 2" />
    </svg>
  );
}

/** UDP - 数据报（信封/报文） */
export function IconUdp({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <rect x="4" y="6" width="16" height="12" rx="1" />
      <path d="M4 10l8 4 8-4" />
    </svg>
  );
}

/** HTTP 代理 - 网关（方框+穿透箭头） */
export function IconHttp({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 12h5M16 12l-2-2v4l2-2" />
    </svg>
  );
}

/** SOCKS5 - 代理层（套接字/通道） */
export function IconSocks5({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 4v4M12 16v4M4 12h4M16 12h4" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

/** Secret 隧道 - 密钥/隐蔽通道（锁孔+斜线） */
export function IconSecret({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <rect x="5" y="9" width="14" height="10" rx="2" />
      <path d="M9 9V7a3 3 0 0 1 6 0v2" />
      <circle cx="12" cy="14" r="2" />
    </svg>
  );
}

/** P2P - 点对点（双节点+连线） */
export function IconP2p({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="12" r="3" />
      <path d="M9 12h6" />
    </svg>
  );
}

/** 文件服务 - 文件夹 */
export function IconFile({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 6h7l2 2h7a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1" />
    </svg>
  );
}

/** 帮助 - 问号 */
export function IconHelp({ active }: { active?: boolean }) {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 4.2 1.8c0 1.5-1.5 2.5-2.5 3" />
      <circle cx="12" cy="16" r="1.5" />
    </svg>
  );
}

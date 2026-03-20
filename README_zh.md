# NPS 管理端 · 内网穿透

[English](README.md) | [中文](README_zh.md)

本仓库在 [NPS](https://github.com/ehang-io/nps) 服务端能力之上，提供**新一代 Web 管理界面**（React + TypeScript + Vite）：工作台仪表盘、客户端与隧道管理、分组、通知与用户中心等，默认支持中英文切换。

![NPS 管理端 — 系统仪表盘](docs/screenshots/dashboard.png)

## 管理端能力概览

- **工作台**：连接端口、客户端与隧道统计、配置摘要、资源与流量视图  
- **导航**：客户端、域名解析、按协议查看隧道（TCP/UDP/HTTP/SOCKS5 等）、高级能力入口、帮助与用户中心  
- **账户**：用户中心支持修改登录密码（管理员写入 `conf/nps.conf` 的 `web_password`；多用户模式写入客户端数据）  
- **接口**：与现有 nps HTTP API / 会话鉴权兼容，前端工程目录为 `nps-desgin/`

## 运行与开发

### 服务端（Go）

在项目根目录构建并启动（可执行文件需与 `conf/` 同级，以便加载 `conf/nps.conf`）：

```bash
CGO_ENABLED=0 go build -o nps ./cmd/nps
./nps
```

默认 Web 端口见配置文件中的 `web_port`（常见为 `8080`）。正式环境请务必修改默认账号密码。

### 管理端前端（本地开发）

```bash
cd nps-desgin
pnpm install
pnpm dev -- --host 0.0.0.0 --port 3000
```

开发时可将前端请求代理到本机 nps HTTP 服务（详见 `nps-desgin` 内 `vite` / `api` 配置）。

## 文档与配置

- 服务端配置：`conf/nps.conf`  
- 界面与交互需求见仓库内 `docs/` 下文档（如有）

## 许可与致谢

服务端核心继承 NPS 开源生态；管理端 UI 由本仓库维护。使用与分发请遵守项目所采用的开源许可证。

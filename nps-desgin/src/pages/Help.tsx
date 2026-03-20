import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Card } from '../components/Shared';
import { getDashboard } from '../api/client';

export function Help({
  onNavigate,
  onLogout,
}: {
  onNavigate: (view: string) => void;
  onLogout?: () => void;
}) {
  const [ip, setIp] = useState('服务器IP');
  const [p, setP] = useState('端口');

  useEffect(() => {
    getDashboard()
      .then((d) => {
        const d2 = d as { ip?: string; p?: number };
        setIp(String(d2.ip ?? '服务器IP'));
        setP(String(d2.p ?? '端口'));
      })
      .catch(() => {});
  }, []);

  const cmd = `./npc -server=${ip}:${p} -vkey=客户端的密钥`;

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar currentView="help" onNavigate={onNavigate} />
      <Header
        breadcrumbs={[{ label: '工作台', view: 'dashboard' }, { label: '帮助' }]}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="ml-64 pt-20 px-10 pb-16">
        <div className="max-w-4xl space-y-8">
          <div className="flex gap-4 flex-wrap">
            <iframe
              src="https://ghbtns.com/github-btn.html?user=cnlh&repo=nps&type=star&count=true&size=large"
              frameBorder={0}
              scrolling="no"
              width={160}
              height={30}
              title="GitHub Star"
            />
            <iframe
              src="https://ghbtns.com/github-btn.html?user=cnlh&repo=nps&type=watch&count=true&size=large&v=2"
              frameBorder={0}
              scrolling="no"
              width={160}
              height={30}
              title="GitHub Watch"
            />
            <iframe
              src="https://ghbtns.com/github-btn.html?user=cnlh&repo=nps&type=fork&count=true&size=large"
              frameBorder={0}
              scrolling="no"
              width={158}
              height={30}
              title="GitHub Fork"
            />
          </div>

          <Card>
            <h3 className="text-lg font-bold text-on-surface mb-4">域名代理模式</h3>
            <p className="text-on-surface-variant text-sm mb-2">
              <b>适用范围：</b> 小程序开发、微信公众号开发、产品演示
            </p>
            <p className="text-on-surface-variant text-sm mb-2">
              <b>假设场景：</b>
            </p>
            <ul className="list-disc list-inside text-on-surface-variant text-sm mb-2 space-y-1">
              <li>有一个域名 proxy.com，有一台公网机器 ip 为 {ip}</li>
              <li>两个内网开发站点 127.0.0.1:81，127.0.0.1:82</li>
              <li>想通过 a.proxy.com 访问 127.0.0.1:81，通过 b.proxy.com 访问 127.0.0.1:82</li>
            </ul>
            <p className="text-on-surface-variant text-sm mb-2"><b>使用步骤：</b></p>
            <ul className="list-disc list-inside text-on-surface-variant text-sm mb-2 space-y-1">
              <li>将 *.proxy.com 解析到公网服务器 {ip}</li>
              <li>在客户端管理中创建一个客户端，记录下验证密钥</li>
              <li>点击该客户端的域名管理，添加两条规则：1、域名：a.proxy.com，内网目标：127.0.0.1:81，2、域名：b.proxy.com，内网目标：127.0.0.1:82</li>
              <li>内网客户端运行 <code className="bg-surface-container-low px-2 py-0.5 rounded font-mono text-xs">{cmd}</code></li>
              <li>现在访问 a.proxy.com，b.proxy.com 即可成功</li>
            </ul>
            <p className="text-on-surface-variant text-sm">
              注：上文中提到公网 ip（{ip}）为系统自动识别，如果是在测试环境中请自行对应，<b>如需使用 https 请在配置文件中将 https 端口设置为 443，和将对应的证书文件路径添加到配置文件中</b>
            </p>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-bold text-on-surface mb-4">TCP 隧道模式</h3>
              <p className="text-on-surface-variant text-sm mb-2">
                <b>适用范围：</b> ssh、远程桌面等 tcp 连接场景
              </p>
              <p className="text-on-surface-variant text-sm mb-2">
                <b>假设场景：</b> 想通过访问公网服务器 {ip} 的 8001 端口，连接内网机器 10.1.50.101 的 22 端口，实现 ssh 连接
              </p>
              <p className="text-on-surface-variant text-sm mb-2"><b>使用步骤：</b></p>
              <ul className="list-disc list-inside text-on-surface-variant text-sm mb-2 space-y-1">
                <li>在客户端管理中创建一个客户端，记录下验证密钥</li>
                <li>内网客户端运行 <code className="bg-surface-container-low px-2 py-0.5 rounded font-mono text-xs block mt-1">{cmd}</code></li>
                <li>在该客户端隧道管理中添加一条 tcp 隧道，填写监听的端口（8001）、内网目标 ip 和目标端口（10.1.50.101:22），选择压缩方式，保存。</li>
                <li>访问公网服务器 ip（{ip}），填写的监听端口(8001)，相当于访问内网 ip(10.1.50.101):目标端口(22)，例如：{`ssh -p 8001 root@${ip}`}</li>
              </ul>
              <p className="text-on-surface-variant text-sm">
                注：上文中提到公网 ip（{ip}）为系统自动识别，如果是在测试环境中请自行对应，默认内网客户端已经启动
              </p>
            </Card>

            <Card>
              <h3 className="text-lg font-bold text-on-surface mb-4">UDP 隧道模式</h3>
              <p className="text-on-surface-variant text-sm mb-2">
                <b>适用范围：</b> 内网 dns 解析等 udp 连接场景
              </p>
              <p className="text-on-surface-variant text-sm mb-2">
                <b>假设场景：</b> 内网有一台 dns（10.1.50.102:53），在非内网环境下想使用该 dns，公网服务器为 {ip}
              </p>
              <p className="text-on-surface-variant text-sm mb-2"><b>使用步骤：</b></p>
              <ul className="list-disc list-inside text-on-surface-variant text-sm mb-2 space-y-1">
                <li>在客户端管理中创建一个客户端，记录下验证密钥</li>
                <li>内网客户端运行 <code className="bg-surface-container-low px-2 py-0.5 rounded font-mono text-xs block mt-1">{cmd}</code></li>
                <li>在该客户端的隧道管理中添加一条 udp 隧道，填写监听的端口（53）、内网目标 ip 和目标端口（10.1.50.102:53），选择压缩方式，保存。</li>
                <li>修改本机 dns 为 {ip}，则相当于使用 10.1.50.202 作为 dns 服务器</li>
              </ul>
              <p className="text-on-surface-variant text-sm">
                注：上文中提到公网 ip（{ip}）为系统自动识别，如果是在测试环境中请自行对应，默认内网客户端已经启动
              </p>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-bold text-on-surface mb-4">SOCKS5 代理模式</h3>
              <p className="text-on-surface-variant text-sm mb-2">
                <b>适用范围：</b> 在外网环境下如同使用 vpn 一样访问内网设备或者资源
              </p>
              <p className="text-on-surface-variant text-sm mb-2">
                <b>假设场景：</b> 想将公网服务器 {ip} 的 8003 端口作为 socks5 代理，达到访问内网任意设备或者资源的效果
              </p>
              <p className="text-on-surface-variant text-sm mb-2"><b>使用步骤：</b></p>
              <ul className="list-disc list-inside text-on-surface-variant text-sm mb-2 space-y-1">
                <li>在客户端管理中创建一个客户端，记录下验证密钥</li>
                <li>内网客户端运行 <code className="bg-surface-container-low px-2 py-0.5 rounded font-mono text-xs block mt-1">{cmd}</code></li>
                <li>在该客户端隧道管理中添加一条 socks5 代理，填写监听的端口（8003），验证用户名和密码自行选择（建议先不填，部分客户端不支持，proxifer 支持），选择压缩方式，保存。</li>
                <li>在外网环境的本机配置 socks5 代理，ip 为公网服务器 ip（{ip}），端口为填写的监听端口(8003)，即可畅享内网了</li>
              </ul>
              <p className="text-on-surface-variant text-sm">
                注：上文中提到公网 ip（{ip}）为系统自动识别，如果是在测试环境中请自行对应，默认内网客户端已经启动
              </p>
            </Card>

            <Card>
              <h3 className="text-lg font-bold text-on-surface mb-4">HTTP 代理模式</h3>
              <p className="text-on-surface-variant text-sm mb-2">
                <b>适用范围：</b> 在外网环境下访问内网站点
              </p>
              <p className="text-on-surface-variant text-sm mb-2">
                <b>假设场景：</b> 想将公网服务器 {ip} 的 8004 端口作为 http 代理，访问内网网站
              </p>
              <p className="text-on-surface-variant text-sm mb-2"><b>使用步骤：</b></p>
              <ul className="list-disc list-inside text-on-surface-variant text-sm mb-2 space-y-1">
                <li>在客户端管理中创建一个客户端，记录下验证密钥</li>
                <li>内网客户端运行 <code className="bg-surface-container-low px-2 py-0.5 rounded font-mono text-xs block mt-1">{cmd}</code></li>
                <li>在该客户端隧道管理中添加一条 http 代理，填写监听的端口（8004），选择压缩方式，保存。</li>
                <li>在外网环境的本机配置 http 代理，ip 为公网服务器 ip（{ip}），端口为填写的监听端口(8004)，即可访问了</li>
              </ul>
              <p className="text-on-surface-variant text-sm">
                注：上文中提到公网 ip（{ip}）为系统自动识别，如果是在测试环境中请自行对应，默认内网客户端已经启动
              </p>
            </Card>
          </div>

          <Card>
            <p className="text-on-surface-variant text-sm"><b>单个客户端可以添加多条隧道或者域名解析</b></p>
          </Card>
        </div>
      </main>
    </div>
  );
}

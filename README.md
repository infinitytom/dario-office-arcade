# 不支持？那就反馈。· DARIO ARCADE

针对地区访问限制的非官方卡通戏仿解压游戏。给因地区限制无法使用服务的中国用户一个虚构的“反馈办公室”。与 Anthropic / Dario Amodei 无关联，所有台词和剧情为虚构。游戏里的开门不代表真实服务政策变化。

## 玩法

- 点击角色或按空格使用道具。
- 按住角色拖拽，松手甩飞：有重力、地板/墙壁反弹和弹簧四肢。
- 1–6 切换道具。前三件免费；后三件用游戏内反馈币解锁。
- 命中、碰撞及完成反馈任务获得反馈币。无付费、无真实货币。
- 连续命中累积连击；十次命中充能。F 释放“打开大门”大招。
- 叫回角色：场景右下角按钮或 R。
- 重置办公室清空本局计分/任务/能量；保留最高分、反馈币和解锁道具。
- 音符按钮开启合成音效。支持鼠标、触屏、键盘和窄屏。

## 本地与部署

用静态 HTTP 服务器打开项目，例如 `npx --yes http-server . -p 4173`。浏览器需要 WebGL。

GitHub Pages 从 main 分支根目录发布。所有脚本和素材均在仓库中，无外部 CDN、字体或 API 依赖。大陆可达性仍取决于 GitHub Pages 的当地网络情况。

## 场景与来源

- 本作品讽刺地区访问限制，并不主张所有中国籍用户无论所在地都被封禁。
- 真实地区政策以 [Anthropic 官方支持地区](https://www.anthropic.com/supported-countries) 为准。
- 拒绝提示、角色台词、积分和剧情是游戏演绎，不是真实引语、服务返回码记录或政策公告。
- Three.js 0.170.0，MIT：`vendor/THREE-LICENSE.txt`。
- 头像照片参考：[官方团队页](https://www.anthropic.com/company/leadership)。图片版权归原权利人。
- 游戏卡通头像由内置 imagegen 生成，`assets/dario-cartoon-v2.png`，提示词见 `assets/cartoon-prompt.txt`。
- 轻量玩偶物理实现在 `sandbox.js`，其余场景由代码生成。

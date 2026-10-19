# 下班前，来一拳 · DARIO ARCADE

Three.js 3D 卡通办公室解压小游戏。非官方戏仿，与 Anthropic / Dario Amodei 无关联。

## 玩法

- 点击角色或按空格出拳。
- 数字 1–3 切换拳套、充气锤、摸鱼道具。
- 1.3 秒内连续命中累积连击。
- 每 10 次命中充满“一键下班”，按 F 或点击按钮释放。
- 点击音符开启合成音效；最高分保存在浏览器本地。
- 支持触屏与窄屏；尊重减少动态效果的系统偏好。

## 本地运行

在项目目录用静态 HTTP 服务器打开，例如 `npx --yes http-server . -p 4173`。需要支持 WebGL 的浏览器。

## 部署

GitHub Pages：从 `main` 分支根目录发布。所有脚本和图片均在本仓库，无外部 CDN、字体或运行时 API 依赖。GitHub Pages 在中国大陆的可达性仍由当地网络决定。

## 素材

- Three.js 0.170.0，MIT，见 `vendor/THREE-LICENSE.txt`。
- Dario Amodei 头像：[Anthropic 官方领导团队页面](https://www.anthropic.com/company/leadership)。图像版权归原权利人；用于本非官方戏仿演示。
- 场景和卡通道具由代码生成。

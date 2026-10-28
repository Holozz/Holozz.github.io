# 页面主题与字体

## 白天／暗夜

顶部导航的太阳和月亮按钮分别切换到白天、暗夜模式。桌面显示中英文文字，窄屏保留图标，并提供可访问名称。

首次访问按系统偏好初始化；选择后保存到浏览器的 localStorage（holozz-theme）。刷新、跨栏目、中英文切换都会保留。选择会在页面绘制前读取，避免暗夜模式刷新时闪出白底。想恢复首次访问行为，可清除该站点的浏览器存储。

## 修改字体

统一配置在 src/styles/appearance.css 顶部：

```css
:root {
  --font-ui: "Ubuntu", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  --font-reading: var(--font-ui);
  --font-code: "Cascadia Code", "SFMono-Regular", Consolas, monospace;
  --font-size-ui: 14px;
  --font-size-reading: 15px;
  --font-size-reading-mobile: 14px;
  --line-height-reading: 1.95;
}
```

- --font-ui：导航、首页、栏目与界面字体。
- --font-reading：文章和笔记正文字体，可与界面分开。
- --font-code：代码字体。
- --font-size-ui：界面基础字号；标题和辅助信息有自己的层级字号。
- --font-size-reading / --font-size-reading-mobile：桌面／手机正文字号。
- --line-height-reading：正文行高。

例如，正文改用宋体并调大字号：

```css
--font-reading: "Noto Serif SC", "Songti SC", SimSun, serif;
--font-size-reading: 17px;
--font-size-reading-mobile: 16px;
--line-height-reading: 1.9;
```

字体列表从左到右依次尝试；中文与英文可能分别使用能显示对应字符的字体。仅写字体名不会自动下载字体，访客电脑没有该字体时会使用后备字体。

若希望所有访客都使用同一字体，可把有相应网页使用许可的 WOFF2 文件放到 public/fonts/，在 appearance.css 的 :root 之前加入：

```css
@font-face {
  font-family: "My Site Font";
  src: url("/fonts/my-site-font.woff2") format("woff2");
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}
```

然后把 "My Site Font" 放在 --font-ui 或 --font-reading 的第一位。上例适用于常规字重；其他字重需提供相应文件或使用支持对应字重范围的可变字体。

修改后运行 npm run dev 本地预览，再提交推送。GitHub Actions 会自动重新发布。

## 修改配色

appearance.css 中的 :root 是白天色板，[data-theme="dark"] 是暗夜色板。页面背景、卡片、文字、链接、边框、按钮使用同一组变量；照片保持原色，不做全页反色。代码高亮分别使用 github-light / github-dark。

## Eras 字体名称排查（2026-10-28）

本机 Chrome 的 CSS 字体族匹配使用 "Eras ITC"，能按字重选择 Eras Medium / Demi / Bold；仅填写 "Eras Medium ITC" 时，虽然 CSS 中显示这个名称，实际英文仍会回退到其他字体。配置中保留 "ErasItcTEEMed" 和 "Eras Medium ITC" 作为其他安装版本的后备名称。

字体文件完整名称、注册表展示名、CSS 字体族名称以及 local() 接受的名称不一定相同。不能仅凭 local() 是否加载成功判断 font-family 是否匹配。请在浏览器开发工具的 Rendered Fonts（实际渲染字体）查看最终结果，而不是只看 Computed 中的 font-family 列表。

本机实测：普通英文使用 Eras Medium ITC，标题使用 Eras Demi ITC，品牌粗体使用 Eras Bold ITC；中文继续使用 Microsoft YaHei。线上字体配置是否发布和本机实际字体是否匹配，是两个独立的检查步骤。

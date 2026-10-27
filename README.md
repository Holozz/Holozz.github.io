# Holozz 个人主页

Astro 静态网站，中文默认，英文位于 `/en/`。正式地址：<https://holozz.github.io/>。

## 开发与检查

需要 Node.js 24 或更新版本。

```sh
npm ci
npm run dev
npm run check
npm run build
npm run check:links
npm run test:browser
npm run test:content
```

开发地址见终端输出，通常为 <http://127.0.0.1:4321/>。

浏览器检查使用本机 Google Chrome；不安装额外浏览器。截图位于忽略提交的 `test-results/`。
`test:content` 会添加临时测试文章和相册，检查公式、表格、代码复制、译文、原文回退、标签、图片查看器与草稿隔离；结束时删除这些临时文件，并重新生成没有样例的正式产物。请勿与另一个构建或内容编辑操作同时运行。

## 新增文章或笔记

1. 复制 `templates/post.md` 到 `src/content/posts/`，例如 `hello.zh.md`。
2. 填写元数据并编写正文。文章用 `kind: articles`；笔记用 `kind: notes`。
3. 预览完成后将 `draft` 改为 `false`，提交并推送即可发布。
4. `slug` 使用小写英文、数字和连字符，决定页面网址。不要随意改动已发布的 slug。
5. `translationKey` 是译文关联标识。同一篇文章的中英文文件共用它，`lang` 分别设置为 `zh` 和 `en`。
6. 没有译文也可以发布：界面切换时会显示译文缺失说明，并提供原文入口。

支持 Markdown 表格、代码高亮、行内公式 `$...$`、独立公式 `$$...$$` 和正文目录。
正文图片放入 `src/assets/`，使用相对于 Markdown 文件的路径，例如 `![说明](../../assets/photo.jpg)`。
分类与标签支持中文；不要使用斜杠、井号和问号作为分类或标签的一部分。

文章日期以 UTC 日期展示，避免构建地点导致日期偏移。草稿不会出现在列表、归档、站点地图或详情路由中。
首版没有公开文章或笔记；模板位于内容目录外，不会被发布。

## 新增相册

1. 将照片放入 `src/assets/` 下的独立相册文件夹。
2. 复制 `templates/album.json` 到 `src/content/albums/`，修改 slug、日期、中英文标题和说明。
3. 每张图片的 `src` 是相对相册 JSON 文件的路径；例如 `../../assets/travel/photo.jpg`。
4. 为每张照片提供中英文 `alt`，可选提供 `caption`；第一张照片用作封面。
5. 将 `draft` 改为 `false`。相册列表、双语详情和图片查看器会自动生成。

本地照片会生成缩略图和大图，提供尺寸信息和延迟加载。相册发布前请自行选好要公开的照片文件。

## 资料与项目

`src/data/github.json` 保存公开 GitHub 资料和置顶项目，顺序与核实当天的主页相同。
`public/images/avatar.png` 保存头像，访客无需实时请求 GitHub。

当前资料核实日期：2026-10-27。项目简介按 GitHub 仓库原文显示，不自动翻译。
更新时可重新核实公开资料后修改配置；不要把普通仓库搜索结果当作置顶列表。
修改网站导航或按钮文案，请同步更新 `src/lib/i18n.ts` 的两种语言。

## 部署到 GitHub Pages

目标仓库：`Holozz/Holozz.github.io`。主分支为 `main`，构建由 `.github/workflows/deploy.yml` 执行。
在仓库 Settings → Pages 中选择 GitHub Actions。工作流通过 GitHub 自动提供的权限部署，不需要额外网站密钥。

```sh
git add .
git commit -m "content: add a new entry"
git push
```

首次发布可使用 `node scripts/publish-github.mjs`。它读取本机 Git 凭据并验证当前账号为 Holozz；仅在目标仓库不存在时创建公开仓库，推送当前已提交的 main 分支，配置 Pages 的 Actions 部署并触发构建。凭据只保存在进程内，不写入网站、文件、日志或命令参数。该命令会执行实际发布，不用于预览。

## 结构

- `src/layouts/SiteLayout.astro`：布局、导航、资料侧栏、语言切换。
- `src/components/`：栏目、文章、相册与共享组件。
- `src/lib/`：内容查询、路由、译文关联与文案。
- `src/content/`：真正可发布的内容。
- `templates/`：不会发布的写作模板。
- `scripts/`：构建产物、浏览器、内容模板及部署工具。
- `PLAN.md`：原始规划及实施进度。
- `VALIDATION.md`：本次实现的验证记录。

参考风格：<https://gty111.github.io/>。使用自建布局，不依赖 Hexo 或其主题运行环境。

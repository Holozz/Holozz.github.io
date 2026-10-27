# 验证记录

日期：2026-10-27（Asia/Shanghai）

## 已通过

- `npm run check`：0 errors、0 warnings、0 hints。
- `npm run build`：19 个 HTML 页面（9 个栏目 × 2 种语言，加双语 404）及 sitemap.xml。
- `npm run check:links`：正式产物中 519 个内部链接、资源和锚点检查通过。
- `npm run test:browser`：使用本机 Chrome，18 个双语栏目分别在 1440、1024、390、320 像素宽度下检查页面溢出。
- 浏览器检查还覆盖：导航、手机菜单、Escape 收起菜单、语言切换、偏好记录、404 返回、头像加载、5 个置顶项目及顺序。
- `npm run test:content`：临时内容生成 30 个 HTML 页面；1032 个内部链接、资源和锚点通过。
- 内容样例验证：数学公式、表格、正文目录、代码复制及实际剪贴板内容、中英文译文切换、无译文回退、中文分类页面、相册大图、左右方向键、Escape 关闭、焦点返回、草稿详情路由不生成。
- 临时内容验证结束后，样例从源文件中删除，重新构建正式产物；已确认源码内容目录与 dist 中无 qa- 测试条目。
- 已检查本地桌面和手机首页截图，并以真实浏览器截图核对参考站的浅色卡片与博客布局。

## 数据来源

公开 GitHub 资料及置顶仓库于本日通过 GitHub API 与公开主页核实，页面不使用连接返回的邮箱。

置顶顺序：
1. SellerPilot
2. CourseNote
3. AI-Personalized-Private-Health-Management-System
4. SellerPillot-v2
5. deepresearchAgent

仓库描述保留公开原文，不把历史仓库描述扩展为个人成果或当前实现的验收结论。

## 边界

- 没有真实文章、笔记或相册；阅读和相册交互通过临时样例验证，样例不会发布。
- 浏览器检查基于本机桌面 Chrome 的多尺寸视口，不等同于真机 Safari、Firefox 或全部辅助技术测试。
- 文章正文不自动翻译，译文由单独内容文件提供。
- 当前没有服务器、后台编辑器、评论、站内搜索、深色主题或访客统计。
- 内容目录为空时，Astro glob loader 的“未找到 Markdown / JSON”提示属于当前预期状态；类型诊断为零问题。
- 截图保存在忽略提交的 test-results/ 中。
- 线上发布状态在首次部署后补充。

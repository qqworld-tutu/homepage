# Quan Chen’s homepage

学术主页：[www.chenquan-tutu.top](https://www.chenquan-tutu.top/)。博客独立部署于 [blog.chenquan-tutu.top](https://blog.chenquan-tutu.top/)，本仓库不修改博客主题和背景。

只使用 Node.js 内置功能，无第三方构建依赖。推荐 Node.js 22 或以上。

## 修改文字

正式站内容全部在 [content.json](./content.json)，不需要编辑 HTML。

- `intro`：About 的段落，每个字符串是一段。
- `news`：动态，`date` 为显示日期，`text` 为文字；可选 `target` 跳到论文、`url` 和 `linkLabel` 添加外部链接。
- `education`：`institution`、`dates`、`degree`、`detail` 和可选 `additional`。
- `publications`：`id`、`title`、`authors`、`venue`、`status`、`description`、`links`。作者格式为 `{ "name": "Quan Chen", "equal": true }`，`equal` 标记共同贡献。
- `awards`：`title`、`detail`（可选）、`date`。
- `service`：`title`、`organization`、`dates`、`description`；空描述不显示。
- `projects`：`title`、`dates`、`description`、`label`、`url`；空链接不生成按钮。
- `email`、`github`、`blog`、`scholar`、`wechatId`：左侧联系方式；Scholar、微信、`cv` 留空时不显示。
- `siteUrl`、`avatar`：正式域名及仓库内头像路径，通常不需要修改。

保留 JSON 的双引号、括号和逗号。空栏目自动隐藏。简历 PDF 和本地整理说明不随网站发布。

## 本地预览

运行 `node preview.mjs`，访问 http://127.0.0.1:4321 。

修改 JSON 后，另开终端运行 `node build.mjs` 并刷新页面；或重启预览。可用 `PORT=4323 node preview.mjs` 指定端口。

## 发布

最简单的文字更新方式：在 GitHub 网页编辑本仓库的 `content.json` 并提交到 `main`，GitHub Actions 自动构建部署。提交到 `main` 会直接更新线上内容，需要先审稿时请创建分支或 Pull Request。

本地编辑后可只提交本次修改：

```bash
node build.mjs
git add content.json
git commit -m "Update homepage content"
git push origin main
```

已有 `npm run publish -- "Update academic homepage"` 快捷命令会提交所有未忽略改动，使用前先检查 `git status`。

`.github/workflows/pages.yml` 自动部署 GitHub Pages，自定义域名保持 `www.chenquan-tutu.top`。DNS 配置不由构建脚本修改。

## 实现与旧链接

`profile-view.mjs` 生成双栏页面，`profile.css` 管理样式，`app.js` 提供主题切换、章节导航和微信提示。`build.mjs` 输出不提交到 Git 的 `dist/`。

`legacy-blog-paths.json` 保留旧博客路径，构建时生成跳转并保留查询参数和锚点，提供无 JavaScript 的 meta refresh 后备。`legacy-images/` 继续作为 `/images/` 发布。

页面独立编写，布局参考 imyangty.com；未使用旧 academic-page 模板。当前版本为用户确认的 F 版。

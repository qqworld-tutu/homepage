# Quan Chen’s homepage

独立学术主页。正式地址：https://www.chenquan-tutu.top/ 。博客在独立仓库 [qqworld-tutu/qqworld-tutu.github.io](https://github.com/qqworld-tutu/qqworld-tutu.github.io)，地址为 https://blog.chenquan-tutu.top/ 。

只使用 Node.js 内置功能，不需要安装第三方依赖。建议使用 Node.js 22 或以上版本。

## 本地预览与发布

```bash
npm run preview
```

访问 http://127.0.0.1:4321 。修改文件后重启命令即可重新构建。`npm run build` 生成 `dist/`，该目录不提交到 Git。

```bash
npm run publish -- "Update academic homepage"
```

发布命令构建页面、提交全部未忽略改动，再推送 `main`。`.github/workflows/pages.yml` 自动构建并部署 GitHub Pages。仓库 Pages 发布来源应为 GitHub Actions，自定义域名为 `www.chenquan-tutu.top`。部署域名需要在 GitHub Pages 设置中绑定，仅生成 CNAME 文件不能代替该设置。

## 内容维护

个人资料集中在 `content.json`，样式为 `styles.css`，页面生成器为 `build.mjs`。

- `intro`、`interests`、`education`：介绍、研究兴趣、教育经历。
- `experience`：科研或实习经历，字段为 `title`、`dates`、`description`，可选 `url`。
- `publications`：论文，字段为 `title`、`authors`（字符串）、`venue`、`links`（含 `label` 和 `url` 的数组）。
- `projects`、`writing`：项目和博客文章入口。
- `cv`：公开 CV 的完整 HTTPS 链接；空字符串时隐藏。
- `blog`：博客根地址，文章链接随其改变。
- `siteUrl`：学术主页完整 HTTPS 地址，用于 canonical 和 CNAME。

无内容的科研经历、论文和 CV 不显示。目前文字沿用已有公开介绍，个人内容后续再完善。

## 博客旧链接兼容

`legacy-blog-paths.json` 保存主域名原先的文章、分类等页面路径，构建时生成跳转页面，保留查询参数和页内锚点。GitHub Pages 不提供自定义服务端 301，因此这里使用浏览器跳转及无 JavaScript 的 meta refresh 后备。

`legacy-images/` 是迁移时博客图片的兼容副本，构建后仍能从主域名 `/images/` 访问，以保留已分享的图片链接。后续博客的新图片继续由博客仓库维护。

本项目独立编写，布局参考 imyangty.com 的信息组织方式，没有使用原 `academic-page` 仓库的模板或其示例资料。

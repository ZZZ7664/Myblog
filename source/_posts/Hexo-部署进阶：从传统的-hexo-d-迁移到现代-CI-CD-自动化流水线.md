---
title: Hexo 部署进阶：从传统的 hexo d 迁移到现代 CI/CD 自动化流水线
date: 2026-01-02 16:04:18
tags:
---

## 1. 背景：一个常见的 Hexo 部署“事故”
在 Arch Linux 上折腾 Hexo 博客是一件很爽的事情，但很多新手（PS: Me）都会遇到一个尴尬的情况：
- 运行 `hexo d` 提示成功了。- 仓库里莫名其妙多了一个 `gh-pages` 分支。
- 自己的自定义域名突然失效，或者显示的还是旧内容。
- Cloudflare Pages 报错：`Could not read package.json`。

这背后的本质原因在于：**部署逻辑的混乱**。

## 2. 传统模式 vs 现代模式
在深入解决办法前，我们需要理解两种不同的部署逻辑：

### 传统模式：本地构建 (Local Build)
- **流程**：你在本地运行 `hexo g`（把 Markdown 转为 HTML），然后通过 `hexo d` 把这些 HTML 推送到 GitHub 的某个分支（通常是 `gh-pages`）。
- **缺点**：
    - 容易忘记推送源码（`master` 分支），导致换台电脑就没法写博客。
    - 频繁覆盖远程分支，导致 `CNAME` 文件丢失，自定义域名失效。
    - 依赖本地环境（Node.js 版本、主题依赖等），环境一变就报错。

### 现代模式：云端构建 (CI/CD)
- **流程**：你只管把源码（`.md` 文件、配置文件）`git push` 到 GitHub。剩下的构建工作交给 Cloudflare Pages 或 GitHub Actions。
- **优点**：
    - **源码即版本**：仓库里存的是人能读懂的源码，而不是乱糟糟的 HTML。
    - **环境无关**：不管你是在 Arch、Windows 还是手机上改代码，云端环境都是一致的。
    - **自动备份**：只要提交代码，源码就自动备份到了 GitHub。

## 3. 避坑指南：从本地构建转向云端自动化
如果你也遇到了 `gh-pages` 分支冲突或者 Cloudflare 构建失败，建议按照以下步骤重构你的工作流：

### 第一步：统一分支
停止使用 `hexo d`。将你的 `master` 分支作为唯一的真理来源（Source of Truth），确保它包含了所有的源文件：
- `source/` 文件夹（你的文章）
- `themes/` 文件夹（你的主题）或者是`/node_modules/hexo-theme-<theme-name>`
- `_config.yml` (Hexo 配置)
- `package.json` (依赖配置)
> 通过自定义 cloudflare 脚本(位置：`package.json/scripts:`)并配合 --legacy-peer-deps 参数，我们可以解决不同环境下插件版本冲突的玄学问题，让 CI/CD 流程更加鲁棒。

### 第二步：配置 Cloudflare Pages 接管
不要让 Cloudflare 去监控 `gh-pages` 分支，因为它里面只有 HTML，没法运行命令。
1. 在 Cloudflare 设置中，将 **Production branch** 设置为 `master`。
2. **Framework preset** 选择 `Hexo`。
3. **Build command** 设置为 `npx hexo generate`或`npm install --legacy-peer-deps && npm run cloudflare`（前提是在`package.json`中定义好`script:cloudflare`选项）。
4. **Build output directory** 设置为 `public`。

### 第三步：解决域名持久化
在本地 `source/` 目录下创建一个 `CNAME` 文件，写上你的域名。这样无论云端如何构建，自定义域名永远不会丢失。

## 4. 延伸思考：为什么开发者应该追求自动化？
对于 Arch Linux 用户来说，我们习惯了高度定制和掌握底层逻辑。但在博客部署这件事上，**“无感化”**才是高级追求。

1.  **基础设施即代码 (IaC)**：你的博客不再是一堆网页，而是一个可以随时重新构建的项目。
2.  **解耦**：将“内容创作”与“网页渲染”解耦。我只需要在 GitHub 网页版点一下“编辑”，剩下的渲染、部署、CDN 刷新全自动完成。
3.  **容灾**：如果哪天我的 Arch 环境滚挂了（虽然概率很低），我的所有博客源码都在 GitHub 上，换台机器拉下来就能用，这才是真正的安全感。

## 5. 总结
删掉那个混乱的 `gh-pages` 分支吧！回归到最纯粹的 `git push origin master`。

**一句话工作流：**
> **写文章 -> `git push` -> 关机睡觉 -> 博客自动更新。**

---

### 推荐博客发布步骤(本篇博客为例)：
1. **新建文章**：`hexo new "hexo-deployment-guide"`
2. **粘贴内容**：将上面的 Markdown 内容贴进去。
3. **发布源码**：
   ```bash
   git add .
   git commit -m "feat: 迁移到 Cloudflare Pages 自动构建并添加避坑指南"
   git push origin master
   ```
4. **检查结果**：去 Cloudflare Pages 看看那个代表成功的绿色小勾。

---
title: 使用国内镜像安装 Scoop：一站式 Windows 包管理器配置指南
date: 2025-12-09 17:38:22
tags:
---

> 本文基于 [Scoop 国内镜像仓库](https://gitee.com/scoop-installer/scoop)，旨在帮助国内用户更顺畅地使用 Scoop 安装和管理 Windows 软件。

Scoop 是 Windows 上非常实用的命令行包管理工具，类似于 Linux 上的 apt 或 macOS 上的 Homebrew。由于网络原因，原版 Scoop 在国内使用时常遇到连接缓慢或失败的问题。本文将介绍如何通过国内镜像快速安装和配置 Scoop，轻松实现软件的安装、更新与管理。

---

## 一、安装 Scoop（使用国内镜像）

### 1.1 首次安装

> 适用于首次安装 Scoop 的用户。

打开 **Windows PowerShell**（建议以管理员身份运行），依次执行以下命令：

```powershell
# 设置脚本执行策略
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# 使用国内镜像安装 Scoop
iwr -useb scoop.201704.xyz | iex
```

> ⚠️ 默认安装路径为当前用户目录下的 `Scoop`，如需自定义路径，请参考下方命令：

```powershell
# 下载安装脚本
irm scoop.201704.xyz -outfile 'install.ps1'

# 自定义安装路径
.\install.ps1 -ScoopDir 'C:\Scoop' -ScoopGlobalDir 'C:\GlobalScoopApps'
```

---

### 1.2 已安装 Scoop？切换为国内镜像

如果你之前安装过官方源或其他镜像，可以通过以下命令切换到国内镜像：

```powershell
# 更换仓库地址
scoop config SCOOP_REPO "https://gitee.com/scoop-installer/scoop"

# 更新仓库
scoop update
```

---

### 1.3 切换分支（可选）

本镜像仓库提供多个分支，默认使用 `master` 分支。你也可以切换到其他分支：

```powershell
# 切换到 develop 分支
scoop config scoop_branch develop

# 更新
scoop update
```

| 分支名   | 描述                         | 基于分支 |
| -------- | ---------------------------- | -------- |
| master   | 默认分支，自动代理分流       | master   |
| develop  | 同上，基于 develop 分支      | develop  |
| archive  | 无修改的原版备份             | master   |

---

## 二、添加软件仓库（Bucket）

Scoop 的软件来自不同的仓库（bucket），我们需要手动添加常用的仓库。

### 2.1 安装 Git（必须）

```powershell
scoop install git
```

> ⚠️ Git 是 Scoop 更新和管理仓库的依赖工具，必须安装。

---

### 2.2 添加常用仓库

```powershell
# 查看官方推荐的仓库列表
scoop bucket known

# 添加 extras 仓库（推荐）
scoop bucket add extras
```

如果你已经添加过某些仓库，但想切换到国内镜像，可以先删除再重新添加：

```powershell
# 查看当前仓库
scoop bucket list

# 删除旧的 extras 仓库
scoop bucket rm extras

# 添加国内镜像的 extras 仓库
scoop bucket add extras
```

成功切换后，仓库地址应显示为 `gitee.com` 域名，例如：

```
Name     Source                                       Updated            Manifests
----     ------                                       -------            ---------
main     https://gitee.com/scoop-installer/Main        2025/2/24 8:37:11       1382
extras   https://gitee.com/scoop-installer/Extras      2025/2/24 8:41:05       2130
dorado   https://gitee.com/scoop-installer/dorado      2025/2/24 8:16:22        257
```

---

### 2.3 添加第三方仓库（可选）

```powershell
# 基本语法
scoop bucket add <别名> <git地址>

# 示例：添加 scoopcn（国内常用软件）
scoop bucket add scoopcn https://gitee.com/scoop-installer/scoopcn
```

更多第三方仓库推荐，请访问：[https://scoop.201704.xyz](https://scoop.201704.xyz)

---

## 三、安装与管理软件

### 3.1 设置代理（可选）

如果你仍然遇到下载缓慢的问题，可以设置代理：

```powershell
# 设置 HTTP 代理
scoop config proxy 127.0.0.1:4412

# 删除代理
scoop config rm proxy
```

---

### 3.2 安装软件

```powershell
# 安装单个软件
scoop install qq

# 安装指定仓库的软件
scoop install scoopcn/wechat

# 一次安装多个软件
scoop install qq wechat aria2
```

---

### 3.3 卸载软件

```powershell
scoop uninstall qq wechat
```

---

### 3.4 更新软件

```powershell
# 更新所有软件
scoop update *

# 更新 Scoop 本身
scoop update
```

---

### 3.5 常用命令速查

```powershell
# 禁止某软件更新
scoop hold <软件名>

# 切换软件版本
scoop reset <软件名@版本号>

# 清理缓存
scoop cache rm *

# 删除旧版本
scoop cleanup *
```

---

## 四、推荐仓库一览

| 仓库名     | 简介                             | 添加命令                                                                 |
| ---------- | -------------------------------- | ------------------------------------------------------------------------ |
| main       | 官方主仓库                       | `scoop bucket add main`                                                  |
| extras     | 常用软件扩展库                   | `scoop bucket add extras`                                                |
| versions   | 提供旧版本软件                   | `scoop bucket add versions`                                              |
| scoopcn    | 国内常用软件（QQ、微信、WPS 等） | `scoop bucket add scoopcn https://gitee.com/scoop-installer/scoopcn`     |
| dorado     | 含网易云音乐、QQ音乐等           | `scoop bucket add dorado https://gitee.com/scoop-installer/dorado`       |
| scoopet    | 科研工具、飞书、语雀等           | `scoop bucket add scoopet https://gitee.com/scoop-installer/scoopet`     |
| siku       | 含哔哩哔哩、BBDown 等            | `scoop bucket add siku https://gitee.com/scoop-installer/siku`           |

---

## 五、结语

通过国内镜像安装和配置 Scoop，可以极大提升软件安装效率，避免网络卡顿和连接失败的问题。希望这篇指南能帮助你快速上手 Scoop，打造高效的 Windows 工作流！

如需获取更多仓库和软件，请访问：[https://scoop.201704.xyz](https://scoop.201704.xyz)



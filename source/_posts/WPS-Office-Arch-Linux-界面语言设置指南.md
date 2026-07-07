---
title: WPS Office Arch Linux 界面语言设置指南：保留英文 Locale 下启用中文
date: 2026-07-07
tags: [Linux, Arch, WPS, Locale, 中文化]
category: 系统折腾
---

## 问题背景

在 Arch Linux 上安装 WPS Office 后，即使系统已经安装了中文 MUI 包（`wps-office-mui-zh-cn`），界面仍然显示英文。

根本原因：WPS 的启动脚本 `/usr/bin/wps` 根据 `LANG` 环境变量决定界面语言。如果你的系统 locale 是 `en_US.UTF-8`，WPS 会默认使用英文界面。

如果你不想修改系统全局 locale，以下三种方法可以在保留英文 Locale 的同时让 WPS 显示中文。

---

## 方法一：修改 /usr/bin/wps 启动脚本

在 WPS 的启动脚本 `/usr/bin/wps` 的 shebang 行之后添加一行：

```bash
#!/bin/bash
export LANG=zh_CN.UTF-8
```

执行命令：

```bash
sudo sed -i '2a\export LANG=zh_CN.UTF-8' /usr/bin/wps
```

**原理**：`export LANG=zh_CN.UTF-8` 会将 LANG 变量导出到当前 shell 环境中，后续启动的 WPS 进程会继承这个值，从而使用中文界面。

**优点**：

- 一劳永逸，修改一次即可
- 不影响系统全局 locale
- 不影响其他应用

**缺点**：

- 文件属于系统目录，`wps-office-cn` 包更新时可能被覆盖
- 需要 root 权限

**恢复方法**：如果包更新后被覆盖，重新执行上述命令即可。

---

## 方法二：用户级 .desktop 覆盖

将 WPS 的桌面文件复制到用户目录下，修改其中的 `Exec` 行：

```bash
mkdir -p ~/.local/share/applications
cp /usr/share/applications/wps-office-prometheus.desktop ~/.local/share/applications/
```

编辑 `~/.local/share/applications/wps-office-prometheus.desktop`，将 `Exec` 行修改为：

```diff
- Exec=/usr/bin/wps %F
+ Exec=env LANG=zh_CN.UTF-8 /usr/bin/wps %F
```

同样需要对 WPS 表格和 WPS PDF 等的桌面文件做相同修改：

```bash
cp /usr/share/applications/wps-office-et.desktop ~/.local/share/applications/
cp /usr/share/applications/wps-office-pdf.desktop ~/.local/share/applications/
```

修改对应的 `Exec` 行。

**原理**：Linux 桌面环境优先读取 `~/.local/share/applications/` 下的桌面文件，用户级的 `.desktop` 文件会覆盖系统级的同名文件。`env LANG=zh_CN.UTF-8` 在执行 WPS 之前临时设置语言环境。

**优点**：

- 不修改系统文件，不受包管理器更新影响
- 可以分别控制每个 WPS 组件的语言
- 无需 root 权限

**缺点**：

- 需要手动复制和修改多个桌面文件
- WPS 更新后如果新增桌面文件，需要重新复制

---

## 方法三：WPS 内置语言设置

如果WPS Office 自带语言切换功能（好像有的没有，我也不知道为什么），可以直接在界面中操作：

1. 打开 WPS Office
2. 点击右上角 **全局菜单**（或 **设置** 图标）
3. 找到 **设置** → **语言**（或 **Options** → **Language**）
4. 在语言列表中选择 **简体中文**
5. 重启 WPS 生效

WPS 会将语言设置保存在配置文件 `~/.config/Kingsoft/Office.conf` 中：

```ini
wps\Application%20Settings\CheckLanguage=1
```

**原理**：WPS 优先使用自身的语言配置，而非完全依赖系统 locale。只要 MUI 中文包已安装，就可以在设置中切换。

**优点**：

- 最简单，不需要任何命令行操作
- 不修改系统文件或桌面文件
- 设置持久化保存在用户配置中

**缺点**：

- 需要手动在每个 WPS 组件中分别设置（Writer、Spreadsheets、Presentation）
- 如果 MUI 包未安装，语言列表中不会出现中文选项

---

## 方案对比

| 方案 | 持久性 | 需要 Root | 包更新影响 | 适用场景 |
|------|--------|-----------|------------|----------|
| 修复启动脚本 | 持久 | 是 | 可能被覆盖 | 全局生效，一劳永逸 |
| .desktop 覆盖 | 持久 | 否 | 不影响 | 不想动系统文件 |
| WPS 内置设置 | 持久 | 否 | 不影响 | 最简单，推荐优先尝试 |

---

## 前置条件（AI给出的，未经查证）

无论使用哪种方法，确保已安装中文 MUI 包：

```bash
sudo pacman -S wps-office-mui-zh-cn
```

可以通过以下命令验证 MUI 包是否安装：

```bash
ls /usr/lib/office6/mui/zh_CN/
```

如果目录存在且包含 `.qm` 和 `.rcc` 文件，说明 MUI 包已正确安装。


---
title: 个人记录：通过 DPI 微调解决 Hyprland 下 XWayland 软件的显示问题
date: 2025-12-24 10:55:56
tags: [ArchLinux, Hyprland, HiDPI, XWayland, Linux-Desktop]
category: 系统折腾
---

> 2026-02-04：前两天又看了下jakoolit的youtube频道，发现其实有些时候不用调QT_SCALE_FACTOR(缩放)，可以用GTK Setting来设置全局字体的缩放

## 0. 发现问题

在 2.5K 屏幕、系统缩放 1.25 倍的 Hyprland 环境下，WPS Office  默认显示效果不佳。
我首先尝试了常见的局部环境变量修改：
`QT\_SCALE\_FACTOR=1.25 /usr/bin/wps &`
**结果：** 界面虽然变大了，但文字明显变模糊，存在像素拉伸感。

## 1. 坚持“局部修改”原则

我不希望修改 `UserSettings.conf` 中的全局 XWayland 设置，因为那会影响到系统所有 X11 程序的默认表现。我希望找到一种只针对特定软件生效、且不破坏系统全局配置的方法。

## 2. 解决方案：从 Scale Factor 转向 DPI 调整

经过测试，我发现调整 DPI（Dots Per Inch）对于处理文字密集的办公软件效果更好。

### 2.1 终端先行测试

在正式修改配置文件前，我先在终端通过命令进行验证：

```bash
# 测试以 120 DPI (即 96 * 1.25) 启动 WPS 表格
env QT_FONT_DPI=120 et
```

**结果：** 软件界面大小符合预期，且文字渲染比使用 Scale Factor 更加清晰锐利。

### 2.2 局部修改启动入口

验证成功后，我将此配置应用到软件的快捷方式中，而不触碰任何系统全局配置。

**操作步骤：**

1. 复制系统默认快捷方式到本地目录（防止更新覆盖）：
   
   ```bash
   mkdir -p ~/.local/share/applications/
   cp /usr/share/applications/wps-office-*.desktop ~/.local/share/applications/
   ```
2. 修改 `.desktop` 文件中的 `Exec` 启动行。
   以 WPS 文字为例，将 `Exec` 修改为：
   `Exec=env QT_FONT_DPI=120 /usr/bin/wps %f`
   
   （我使用了 `sed` 批量完成了这个操作，并运行 `update-desktop-database` 刷新了缓存。）
   
   > 我发现不刷新缓存也是可以的

## 3. 经验总结

作为一个系统小白，这次折腾让我学到了两点：

1. **测试先行**：在终端通过 `env` 命令临时启动软件是最好的测试方式，行得通再改文件。
2. **局部优先**：尽量不去动影响全局的配置文件。通过调整特定软件的 DPI，既解决了显示模糊，又维持了系统其他部分的稳定性。

---

*记录时间：2025年12月*

---

### 2. 本次调优命令总结

| 命令 | 作用说明 | 为什么用它 |
| :--- | :--- | :--- |
| `env QT_SCALE_FACTOR=1.25 wps` | 终端测试：比例缩放启动 | 验证发现界面变大但模糊，故放弃 |
| `env QT_FONT_DPI=120 et` | **终端测试：DPI 缩放启动** | **验证成功，文字清晰且大小合适** |
| `cp /usr/share/applications/wps* ~/.local/share/applications/` | 备份快捷方式到用户目录 | 遵循局部修改原则，不影响系统全局文件 |
| `sed -i 's/^Exec=/Exec=env QT_FONT_DPI=120 /g' ` | 批量注入 DPI 环境变量 | 固化测试结果，使点击图标也能生效 |
| `update-desktop-database ~/.local/share/applications` | 刷新本地应用数据库 | 确保修改后的快捷方式立即被系统识别 |
| `echo $?` | 查看命令退出状态 | 养成好习惯，确认手动启动的程序是否报错 |

---

### 💡 提示词补充：

如果以后再遇到软件显示或运行问题，可以对 AI 说：

> “我遇到一个软件显示问题。我的原则是：**不修改全局配置，优先在终端使用 `env` 尝试局部解决**。请基于这个前提，为我提供针对 [软件名] 的调试参数或 `.desktop` 修改方案。”

这种提问方式能让 AI 直接跳过那些“大动干戈”的建议，直接给你最符合你习惯的“手术刀式”方案。



















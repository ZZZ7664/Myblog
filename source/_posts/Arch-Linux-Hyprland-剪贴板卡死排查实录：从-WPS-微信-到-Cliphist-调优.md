---
title: Arch Linux (Hyprland) 剪贴板卡死排查实录：从 WPS/微信 到 Cliphist 调优
date: 2025-12-19 21:19:17
tags: [Linux, Arch, Hyprland, Wayland, Troubleshooting, Shell]
category: 系统折腾
---

## 实测环境

```bash
                   -`                                       
                  .o+`                   ----------- 
                 `ooo/                   OS: Arch Linux x86_64 
                `+oooo:                  Host: 21D1 ThinkBook 16 G4+ ARA 
               `+oooooo:                 Kernel: 6.17.9-arch1-1 
               -+oooooo+:                Uptime: 1 hour 
             `/:-:++oooo+:               Packages: 1541 (pacman), 16 (flatpak) 
            `/++++/+++++++:              Shell: zsh 5.9 
           `/++++++++++++++:             Resolution: 2560x1600 
          `/+++ooooooooooooo/`           DE: Hyprland 
         ./ooosssso++osssssso+`          WM: sway 
        .oossssso-````/ossssss+`         Theme: Adwaita [GTK2] 
       -osssssso.      :ssssssso.        Icons: Papirus [GTK2] 
      :osssssss/        osssso+++.       Terminal: kitty 
     /ossssssss/        +ssssooo/-       CPU: AMD Ryzen 7 6800H with Radeon Graphics (16) @ 4.787GHz 
   `/ossssso+/:-        -:/+osssso+-     GPU: AMD ATI Radeon 680M 
  `+sso+:-`                 `.-/+oso:    Memory: 4646MiB / 13652MiB 
 `++:.                           `-/+/
 .`                                 `/
```

## 🚫 问题现象

在 **Arch Linux + Hyprland** 环境下，使用 **WPS Office (Excel)** 和 **微信**（均运行于 XWayland）时遇到以下顽固问题：

1. **复制卡死**：在 Excel 中复制单元格，或者在微信复制图片时，系统粘贴动作极慢，甚至导致 `wl-paste` 进程无响应。
2. **跨界失效**：WPS 内部互贴正常，但无法粘贴到浏览器（Wayland 原生应用）。
3. **历史记录延迟**：调用 `cliphist` 列表时有明显卡顿。

---

## ✅ 最终生效的解决方案 

经过一通排查，发现核心原因并非 XWayland 兼容性差，而是 **Cliphist 数据库过大导致的 I/O 阻塞**。

Excel 和微信复制时会产生巨大的数据（未压缩的位图、XML 等），如果 `cliphist` 数据库未清理，写入新数据时会阻塞 X11 剪贴板管道，导致卡死。

**解决方法：** 无需禁用图片历史，也无需额外脚本，只需在启动时 **自动修剪（Prune）** 数据库。

### 1. 清理已损坏的数据库

首先执行一次“大扫除”：

```bash
rm ~/.cache/cliphist/db
# 重启电脑或重新登录 Hyprland
```

### 2. 配置自动修剪

修改 Hyprland 启动配置 `~/.config/hypr/UserConfigs/Startup_Apps.conf`，添加保留最近 256 条记录的限制：

```ini
# ---------------------------------------------------
# Cliphist 剪贴板配置
# ---------------------------------------------------

# 1. 启动监听器 (保留默认，无需禁用图片监听)
exec-once = wl-paste --type text --watch cliphist store
exec-once = wl-paste --type image --watch cliphist store

# 2. 【核心修复】启动时自动清理
# 管道逻辑：列出所有记录 -> 排除最近的 256 条 -> 删除剩下的旧记录
exec-once = cliphist list | head -n -256 | cliphist delete
```

---

## 🛠️ 进阶排查与脚本 (折腾经验备份)

虽然上面的方法解决了我的问题，但在排查过程中编写的**诊断命令**和**桥接脚本**非常有价值。如果单纯清理数据库无法解决你的问题（例如需要强制剥离 Excel 格式），可以使用以下方案。

### 1. 常用诊断命令

查看当前剪贴板中包含哪些 MIME 类型（用于判断是否包含巨大的 `BITMAP`）：

```bash
# 需要安装 xclip
xclip -selection clipboard -t TARGETS -o
```

查看各格式数据的具体大小（找出卡顿元凶）：

```bash
xclip -selection clipboard -t TARGETS -o 2>/dev/null | while read target; do
    size=$(xclip -selection clipboard -t "$target" -o 2>/dev/null | wc -c)
    human=$(echo $size | numfmt --to=iec)
    echo -e "格式: $target \t大小: $human"
done
```

### 2. 强制同步脚本 (WpsSyncFix.sh)

如果你需要**强制**让 Excel 复制变快（丢弃富文本格式，只取纯文本），或者微信图片死活无法粘贴，可以使用这个脚本接管剪贴板同步。

**脚本功能：**

* 监控 X11 剪贴板。
* **文本：** 强行提取 `UTF8_STRING`，丢弃 Excel 的 HTML/XML 垃圾数据。
* **图片：** 识别微信的 `png/jpeg` 并建立管道传给 Wayland。

保存为 `~/.config/hypr/scripts/WpsSyncFix.sh`：

```bash
#!/bin/bash
# 修复 XWayland (WPS/WeChat) -> Wayland 的同步问题

# 依赖检查
if ! command -v xclip &> /dev/null; then
    echo "Need xclip"
    exit 1
fi

# 杀掉可能残留的进程
killall xclip 2>/dev/null

last_checksum=""

while true; do
    # 获取 X11 剪贴板支持的格式
    targets=$(xclip -selection clipboard -t TARGETS -o 2>/dev/null)
    
    # --- 场景 A: 纯文本 (Excel 加速) ---
    # 只要包含 UTF8_STRING，就强制只取文本
    if [[ "$targets" == *"UTF8_STRING"* ]]; then
        content=$(xclip -selection clipboard -t UTF8_STRING -o 2>/dev/null)
        
        if [ -n "$content" ]; then
            current_checksum=$(echo "$content" | md5sum)
            if [ "$current_checksum" != "$last_checksum" ]; then
                # 写入 Wayland
                echo -n "$content" | wl-copy
                last_checksum="$current_checksum"
            fi
        fi
        
    # --- 场景 B: 图片 (微信修复) ---
    # 微信可能使用 png, jpeg 或 bmp
    elif [[ "$targets" == *"image/"* ]]; then
        if [[ "$targets" == *"image/png"* ]]; then
            fmt="image/png"
        elif [[ "$targets" == *"image/jpeg"* ]]; then
            fmt="image/jpeg"
        fi
        
        if [ -n "$fmt" ]; then
            # 管道传输图片数据
            xclip -selection clipboard -t "$fmt" -o 2>/dev/null | wl-copy -t "$fmt"
            sleep 1 # 防止连续触发
        fi
    fi
    
    sleep 0.5
done
```

如果要使用此脚本，需要在 `Startup_Apps.conf` 中添加 `exec-once = ~/.config/hypr/scripts/WpsSyncFix.sh`。

---

## 总结

1. **先软后硬**：遇到卡顿先检查日志和数据库大小，不要上来就写脚本魔改。
2. **定期维护**：Linux 的剪贴板历史工具如果缺乏自动清理机制，很容易因为富文本数据膨胀导致 I/O 瓶颈。

> 以上内容由AI整理本人折腾的过程，最后问题解决了，但是本人无法验证AI提供的解决方法是否是可行的，小白新人第一次发贴，若有不对之处，望指正！

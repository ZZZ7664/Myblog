---
title: Arch Linux (Hyprland + JaKooLit) 常用命令与快捷键汇总
date: 2025-12-22 23:50:00
tags: [ArchLinux, Hyprland, JaKooLit, Vim, Linux]
category: 系统折腾
---

>这是一份专为使用 **JaKooLit** 配置方案并习惯使用 **Vim** 的 Arch Linux 用户准备的备忘录。

## 1. 系统管理与更新 (Pacman & Yay)

```bash
sudo pacman -Syu             # 同步源并更新系统
yay -Syu                     # 更新系统及所有 AUR 软件包
yay -S <pkg>                 # 安装新软件包
sudo pacman -Rns <pkg>       # 彻底删除包及其依赖
sudo pacman -Qdt             # 列出所有孤立依赖
sudo pacman -Rns $(pacman -Qtdq) # 清理所有孤立依赖
```

## 2. 使用 Vim 编辑 JaKooLit 核心配置

JaKooLit 采用模块化设计，建议仅修改 `UserConfigs` 文件夹内的文件，以防后续更新覆盖。

```bash
# 核心自定义配置
vim ~/.config/hypr/UserConfigs/UserKeybinds.conf    # 自定义快捷键
vim ~/.config/hypr/UserConfigs/UserSettings.conf    # 窗口装饰、手势、布局
vim ~/.config/hypr/UserConfigs/Monitors.conf        # 显示器分辨率、位置
vim ~/.config/hypr/UserConfigs/ENVariables.conf     # 环境变量 (NVIDIA 驱动设置)
vim ~/.config/hypr/UserConfigs/Startup_Apps.conf    # 自启动项
vim ~/.config/hypr/UserConfigs/WorkspaceRules.conf  # 工作区绑定规则

# UI 界面配置
vim ~/.config/waybar/config                         # Waybar 布局
vim ~/.config/waybar/style.css                      # Waybar 样式
vim ~/.config/kitty/kitty.conf                      # 终端配置
```

## 3. JaKooLit 快捷键方案 (速查表)

> **前缀说明**：`SUPER` = Windows键, `ALT` = Alt, `CTRL` = Ctrl, `SHIFT` = Shift

### 3.1 核心系统控制

| 快捷键 | 功能描述 | 备注 |
| :--- | :--- | :--- |
| `SUPER + H` | **启动快捷键速查表** | 忘记按键时的救星 |
| `SUPER + SHIFT + K` | 搜索所有快捷键 | 通过 Rofi 全局搜索 |
| `SUPER + SHIFT + E` | JaKooLit 设置菜单 | 调整系统核心参数 |
| `CTRL + ALT + L` | 屏幕锁定 | 调用 hyprlock |
| `CTRL + ALT + P` | 电源菜单 | 关机、重启、睡眠 |
| `CTRL + ALT + Del` | 退出 Hyprland | 立即注销并返回登录界面 |

### 3.2 应用程序启动

| 快捷键 | 功能描述 | 默认程序 |
| :--- | :--- | :--- |
| `SUPER + Enter` | 打开终端 | kitty |
| `SUPER + SHIFT + Enter` | 下拉式终端 | 类似 Quake 的隐藏终端 |
| `SUPER + D` | 应用启动器 | rofi-wayland |
| `SUPER + B` | 启动浏览器 | 系统默认浏览器 |
| `SUPER + E` | 打开文件管理器 | Thunar |
| `SUPER + S` | 谷歌搜索 | 通过 Rofi 快速输入搜索词 |

### 3.3 窗口与布局管理

| 快捷键 | 功能描述 | 备注 |
| :--- | :--- | :--- |
| `SUPER + Q` | **关闭活动窗口** | 正常退出程序 |
| `SUPER + SHIFT + Q` | 强制关闭窗口 | 针对卡死应用 |
| `SUPER + Space` | 切换浮动状态 | 针对当前单个窗口 |
| `SUPER + SHIFT + F` | 全屏切换 | 切换全屏模式 |
| `SUPER + ALT + L` | 切换布局模式 | Dwindle 或 Master 布局 |
| `SUPER + ALT + 滚轮` | 桌面缩放 | 桌面放大镜功能 |

### 3.4 主题与 UI 定制

| 快捷键 | 功能描述 | 备注 |
| :--- | :--- | :--- |
| `SUPER + W` | **选择壁纸** | 调出壁纸菜单 |
| `SUPER + SHIFT + W` | 选择壁纸效果 | ImageMagick 特效 |
| `CTRL + ALT + W` | 随机切换壁纸 | 使用 swww 随机更换 |
| `SUPER + CTRL + B` | 选择 Waybar 样式 | 实时更换状态栏皮肤 |
| `SUPER + ALT + B` | 选择 Waybar 布局 | 调整状态栏模块位置 |
| `SUPER + SHIFT + G` | **游戏模式** | 一键开关所有动画/模糊 (提速) |

## 4. Hyprland 状态控制 (hyprctl)

```bash
hyprctl reload       # 重新加载配置
hyprctl monitors     # 查看显示器 ID 和状态
hyprctl clients      # 查看当前运行窗口的 class (用于写窗口规则)
hyprctl activewindow # 查看当前聚焦窗口的详细信息
hyprctl kill         # 鼠标点击强行杀掉窗口
```

## 5. Wayland 常用工具命令

```bash
# 截图 (JaKooLit 已集成脚本)
~/.config/hypr/scripts/Screenshot.sh --now   # 立即全屏截图
~/.config/hypr/scripts/Screenshot.sh --area  # 选区截图

# 剪贴板历史
cliphist list | rofi -dmenu | cliphist decode | wl-copy

# 亮度与音量
brightnessctl set +10%         # 增加亮度
pamixer -i 5                   # 增加音量 (需安装 pamixer)
pamixer --default-source -t    # 麦克风静音
```

## 6. 系统服务与维护

```bash
lsusb                          # 查看 USB 设备
nmcli device wifi list         # 查看附近 WiFi
nmcli device wifi connect "SSID" password "PWD" # 命令行连接 WiFi
systemctl status bluetooth     # 查看蓝牙状态
journalctl -xe --unit hyprland # 查看 Hyprland 报错日志
```

## 7. Vim 编辑器极简速查

```vim
:w                   " 保存
:q                   " 退出
:wq                  " 保存并退出
/关键词               " 搜索内容
n                    " 跳转下一个结果
gg                   " 跳到文件开头
G                    " 跳到文件末尾
dd                   " 删除整行
u                    " 撤销上一步
Ctrl + v             " 进入块操作模式 (批量注释/缩进)
```

## 8. JaKooLit 脚本更新与维护

```bash
cd ~/Arch-Hyprland   # 进入克隆的 JaKooLit 仓库目录
git pull             # 拉取最新更新
./install.sh         # 运行安装程序进行修复或更新
```

---

### 💡 进阶：为 Vim 用户优化 Hyprland 键位

建议在 `~/.config/hypr/UserConfigs/UserKeybinds.conf` 中添加以下内容，实现 HJKL 窗口跳转：

```vim
# 使用 Vim 键位切换窗口焦点
bind = SUPER, H, movefocus, l
bind = SUPER, L, movefocus, r
bind = SUPER, K, movefocus, u
bind = SUPER, J, movefocus, d

# 使用 Vim 键位移动窗口位置
bind = SUPER SHIFT, H, movewindow, l
bind = SUPER SHIFT, L, movewindow, r
bind = SUPER SHIFT, K, movewindow, u
bind = SUPER SHIFT, J, movewindow, d
```




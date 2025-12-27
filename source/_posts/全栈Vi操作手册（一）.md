---
title: 全栈Vi操作手册（一）
date: 2025-12-28 00:25:29
tags:
---

> **环境声明**：Arch Linux | Hyprland (JaKooLit) | Kitty | Zsh (agnosterzak) | Neovim

## 第一章：Zsh Vi-Mode

### 1. 核心状态切换
*   **插入模式 (Insert)**：默认状态，光标为 **竖线 `|`**，左侧显示 `-- INSERT --`。此时正常打字。
*   **退出到命令模式 (Normal)**：快速连按 **`jk`** 或按 `ESC`。
    *   *状态变化*：光标变 **方块 `█`**，左侧变红显示 `-- NORMAL --`。
*   **重回输入**：在 Normal 模式下按 `i` (当前位置) 或 `a` (后移一格)。

### 2. Normal 模式
按下 `jk` 进入 Normal 模式：
*   **单词跳跃**：按 `w` 跳到下个单词开头，按 `b` 回跳。
*   **首尾跳转**：按 `0` (零) 回行首，按 `$` 到行尾。
*   **修改**：
    *   `x`：删除当前光标下的字符。
    *   `dw`：删除当前光标后的整个单词。
    *   `dd`：清空当前整行命令。
*   **撤销**：按 `u` 撤销刚才的删除。

### 3. 历史命令搜索
*   **上下翻找**：进入模式后，直接按 `k` 向上翻，`j` 向下翻。
*   **高级过滤**：先输入 `git`，再按 `jk` 进入模式按 `k`，它只会翻出你以前输入过的 `git` 相关命令。

### 4. `v` 编辑长命令
*   **场景**：一个很长的脚本或带有复杂嵌套引号的 Shell 命令。
*   **操作**：在 Normal 模式下按下 **`v`**。
*   **效果**：系统会进入 `-- VISUAL--` 模式 。

---

## 第二章：Hyprland 窗口管理

### 1. 焦点切换 (Super + HJKL)
*   **场景**：终端，文档同时打开。
*   **操作**：按住 **`Super`** 不放，按 `h` 往左跳，按 `l` 往右跳。

### 2. 窗口位移 (Super + Ctrl + HJKL)
*   **场景**：当你想把当前屏幕中间的终端移动到最左侧。
*   **操作**：**`Super + Ctrl + h`**。窗口会物理性地向左侧“平移”。

### 3. 丝滑缩放 (Super + Shift + HJKL)
*   **场景**：觉得终端太窄，想拉宽一点。
*   **操作**：按住 **`Super + Shift + hjkl`**。

---

## 第三章：Kitty 历史回溯

### 1. 进入回溯模式
*   按下 **`Alt + h`**。

### 2. 复制屏幕上的报错信息
*   **场景**：终端打印了一大堆报错，你需要复制其中一段。
*   **步骤**：
    1.  按 `Alt + h`。此时整个终端变成了一个 Neovim 只读文件。
    2.  用 `hjkl` 找到报错行，或者按 `/` 输入关键词搜索。
    3.  按 `v` 进入视觉模式，选中文字。
    4.  按下 **`y`**。
    5.  按 `q` 退出。
*   **结果**：内容已在你的系统剪切板，直接在浏览器里 `Ctrl+v` 即可。

---

## 第四章：Rofi 菜单

*   **启动**：按 `Super + Space` (或你的 Rofi 键)。
*   **选择**：
    *   输入 `brave`。
    *   **向上/下**：按住 **`Ctrl`**，点击 `j` 或 `k` 进行挑选。
*   **确认**：按下 **`Ctrl + m`** 或 `Enter` 启动。

---

---

## 🛠️ 五、 核心配置汇总

### 1. Hyprland：系统级窗口管理
**配置文件**：`~/.config/hypr/UserConfigs/UserKeybinds.conf`
将方向键逻辑 1:1 映射到 HJKL，利用 `binde` 实现丝滑缩放。

```bash
# 移动窗口焦点 (Move Focus) -> Super + HJKL
bind = $mainMod, H, movefocus, l
bind = $mainMod, L, movefocus, r
bind = $mainMod, K, movefocus, u
bind = $mainMod, J, movefocus, d

# 调整窗口大小 (Resize Window) -> Super + Shift + HJKL
# binde 确保长按时连续缩放
binde = $mainMod SHIFT, H, resizeactive, -40 0
binde = $mainMod SHIFT, L, resizeactive, 40 0
binde = $mainMod SHIFT, K, resizeactive, 0 -40
binde = $mainMod SHIFT, J, resizeactive, 0 40

# 移动窗口物理位置 (Move Window) -> Super + Ctrl + HJKL
bind = $mainMod CTRL, H, movewindow, l
bind = $mainMod CTRL, L, movewindow, r
bind = $mainMod CTRL, K, movewindow, u
bind = $mainMod CTRL, J, movewindow, d
```

### 2. Zsh：高性能 Vi 模式
**配置文件**：`~/.zshrc`
**优化重点**：解决了 `agnosterzak` 主题下猛按回车卡顿的问题，并实现了状态同步。

```zsh
# 启用 Vi 模式与 jk 映射
bindkey -v
export KEYTIMEOUT=15
bindkey -M viins 'jk' vi-cmd-mode

# 状态显示函数 (右侧 RPROMPT)
function vi_mode_prompt_info() {
  [[ ${KEYMAP} == vicmd ]] && echo "%F{red}-- NORMAL --%f" || echo "%F{green}-- INSERT --%f"
}
RPROMPT='$(vi_mode_prompt_info)'

# 模式切换钩子：同步光标形状与状态显示
function zle-keymap-select() {
  if [[ ${KEYMAP} == vicmd ]]; then
    echo -ne '\e[1 q' # 方块
  else
    echo -ne '\e[5 q' # 竖线
  fi
  zle reset-prompt # 仅在模式切换时重绘，保证性能
}
zle -N zle-keymap-select

# 初始行钩子：防止猛按回车掉帧
function zle-line-init() { echo -ne '\e[5 q' }
zle -N zle-line-init
precmd() { echo -ne '\e[5 q' }

# 补全菜单 HJKL 导航
zmodload zsh/complist
bindkey -M menuselect 'h' vi-backward-char
bindkey -M menuselect 'k' vi-up-line-or-history
bindkey -M menuselect 'j' down-line-or-history
bindkey -M menuselect 'l' vi-forward-char
```

### 3. Kitty + Neovim：历史回溯与复制
**配置文件**：`~/.config/kitty/kitty.conf`
利用 Neovim 的威力处理终端滚动缓存。

```conf
# 设置 nvim 为分页器
scrollback_pager nvim -c "set signcolumn=no showtabline=0" -c "silent! write! /tmp/kitty_scrollback_buffer | te cat /tmp/kitty_scrollback_buffer - " -c "normal G"

# 快捷键：Alt + H 进入回溯模式
map alt+h show_scrollback
```

### 4. Rofi：应用导航
**配置文件**：`~/.config/rofi/config.rasi`
强制释放被占用的快捷键。

```rasi
configuration {
    kb-remove-char-back: "BackSpace";     // 释放 Ctrl+h
    kb-remove-to-eol: "";                 // 释放 Ctrl+k
    kb-mode-complete: "";                 // 释放 Ctrl+l
    kb-mode-next: "Shift+Right";          // 释放 Right
    kb-mode-previous: "Shift+Left";       // 释放 Left

    kb-row-up: "Up,Control+k";
    kb-row-down: "Down,Control+j";
    kb-row-left: "Control+h";
    kb-row-right: "Control+l";
    kb-accept-entry: "Control+m,Return,KP_Enter";
}
```

---

## 📖 六、 使用指南

### 1. 窗口管理 (Hyprland)
*   **切换窗口**：`Super + h/j/k/l`。无需鼠标，直接在窗口间穿梭。
*   **调整尺寸**：`Super + Shift + h/j/k/l`。长按 L 键，窗口向右丝滑变宽。

### 2. 终端编辑 (Zsh)
*   **进入/退出模式**：默认打字模式（竖线光标），快速输入 **`jk`** 进入命令模式（方块光标，右侧变红）。
*   **高效移动**：在命令模式下用 `w` / `b` 按单词跳跃，用 `0` / `$` 跳到行首行尾。
*   **长命令编辑**：模式下按 **`v`**，自动在 Neovim 中打开当前行，编辑完 `:wq` 即可回填。

### 3. 历史搜索与复制 (Kitty + Nvim)
*   **场景**：需要复制屏幕上方几百行前的报错 ID。
*   **操作**：按 **`Alt + H`**。现在你处于一个 Neovim 窗口中：
    1.  `/` 搜索关键字。
    2.  `v` 选中，`y` 复制（已同步系统剪切板）。
    3.  `q` 退出，回到终端粘贴。

### 4. 应用启动 (Rofi)
*   按下启动快捷键，输入名字，按 **`Ctrl + j/k`** 上下挑选，**`Ctrl + m`** 确认。

---

## 💡 常见问题排查 (FAQ)

1.  **卡顿问题**：如果长按回车卡顿，请检查 `.zshrc` 中 `zle-line-init` 函数内是否包含了 `zle reset-prompt`。**必须删掉它**。
2.  **按键冲突**：如果 `Super + H` 无效，终端运行 `grep -r "bind.*H" ~/.config/hypr/` 找出占用它的配置并注释掉（JaKooLit 默认通常将其用于帮助面板）。
3.  **剪切板无效**：确保 Neovim 配置文件中包含 `vim.opt.clipboard = "unnamedplus"`，否则 `Alt + H` 模式下的复制无法传给浏览器。

---

## 💡 肌肉记忆训练建议 (训练计划)

为了在一周内彻底习惯这套系统，请尝试以下练习：

1.  **第一天**：强制自己只用 `jk` 退出插入模式，删掉脑子里的 `ESC`。
2.  **第二天**：在终端需要修改命令时，严禁使用方向键。进入 Normal 模式，用 `w/b` 定位，用 `x` 删除。
3.  **第三天**：练习 `Super + HJKL` 切换窗口。如果发现自己去摸鼠标，立刻把手缩回来。
4.  **第四天**：尝试用 `Alt + h` 复制一次终端里的文本，感受 Neovim 处理滚动缓存的威力。

**核心心法**：**当你想动方向键或鼠标时，停顿 0.5 秒，想想对应的 HJKL 组合键是什么。**


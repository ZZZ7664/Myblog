---
title: Lazyvim keymap中文
date: 2026-02-01 16:10:24
tags:
---

> **注意**：
> *   **`<leader>`** (前缀键) 默认为 **空格键 (`<Space>`)**。
> *   **`<localleader>`** 默认为 **反斜杠 (`\`)**。
> *   **模式说明**：**n**=普通模式, **i**=插入模式, **v/x**=可视模式, **t**=终端模式。

---

### 1. 通用操作 (General)

最常用的基础操作，包括窗口移动、保存、注释等。

| 快捷键 | 功能描述 | 模式 |
| :--- | :--- | :--- |
| `j` / `k` | 向下 / 向上移动 | n, x |
| `<C-h/j/k/l>` | 将光标切换到 左/下/上/右 窗口 | n |
| `<C-Up/Down/Left/Right>` | 调整窗口大小 (高/宽) | n |
| `<A-j>` / `<A-k>` | 向下 / 向上移动当前行 (代码搬移) | n, i, v |
| `<S-h>` / `<S-l>` | 上一个 / 下一个 Buffer (缓冲区) | n |
| `[b` / `]b` | 上一个 / 下一个 Buffer | n |
| `<leader>bb` | 切换到最近的另一个 Buffer | n |
| `<leader>bd` | 删除当前 Buffer | n |
| `<leader>bo` | 删除其他 Buffer (只留当前) | n |
| `<C-s>` | **保存文件** | n, i, v |
| `<esc>` | 退出并清除搜索高亮 | n, i |
| `<leader>ur` | 强制重绘 / 清除高亮 / 更新 Diff | n |
| `gco` / `gcO` | 在 下方/上方 添加注释 | n |
| `<leader>l` | 打开 Lazy 插件管理器 | n |
| `<leader>fn` | 新建文件 | n |
| `<leader>qq` | 退出所有 (Quit All) | n |
| `<leader>wd` | 删除当前窗口 | n |
| `<leader>-` / `<leader>\|` | 向下 / 向右 分割窗口 | n |

### 2. LSP (代码智能辅助)

基于语言服务器的代码跳转、重命名和诊断。

| 快捷键 | 功能描述 | 模式 |
| :--- | :--- | :--- |
| `gd` | **转到定义** (Goto Definition) | n |
| `gr` | **查看引用** (References) | n |
| `gI` | 转到实现 (Implementation) | n |
| `gy` | 转到类型定义 (Type Definition) | n |
| `K` | **查看文档悬停** (Hover) | n |
| `gK` | 查看函数签名帮助 | n |
| `<leader>ca` | **代码操作** (Code Action) | n, v |
| `<leader>cr` | **重命名** (Rename) | n |
| `<leader>cf` | **格式化代码** (Format) | n, v |
| `<leader>cd` | 查看当前行诊断信息 | n |
| `[d` / `]d` | 上一个 / 下一个 诊断信息 | n |
| `[e` / `]e` | 上一个 / 下一个 错误 | n |

### 3. 搜索与文件查找 (Snacks.nvim / Telescope)

LazyVim 新版主要使用 `snacks.nvim` 作为查找器。

| 快捷键 | 功能描述 | 模式 |
| :--- | :--- | :--- |
| `<leader><space>` | **查找文件** (Root Dir) | n |
| `<leader>ff` | 查找文件 (Root Dir) | n |
| `<leader>fF` | 查找文件 (当前目录 cwd) | n |
| `<leader>/` | **全局搜索关键词** (Grep Root Dir) | n |
| `<leader>sg` | 全局搜索关键词 (Grep Root Dir) | n |
| `<leader>sb` | 搜索当前打开的 Buffer 内容 | n |
| `<leader>fr` | 最近打开的文件 (Recent) | n |
| `<leader>fb` / `<leader>,` | 切换 Buffer 列表 | n |
| `<leader>e` | 打开文件资源管理器 (Explorer) | n |
| `<leader>s"` | 搜索寄存器内容 | n |
| `<leader>sk` | 搜索快捷键映射 (Keymaps) | n |

### 4. Git 版本控制

| 快捷键 | 功能描述 | 模式 |
| :--- | :--- | :--- |
| `<leader>gg` | 打开 LazyGit (或 GitUI) | n |
| `<leader>gb` | 查看当前行 Blame 信息 | n |
| `<leader>gf` | 查看当前文件 Git 历史 | n |
| `<leader>gl` | 查看 Git Log | n |
| `<leader>gd` | 查看 Diff (Hunks) | n |
| `<leader>gs` | Git Status | n |

### 5. 界面开关 (UI Toggles)

以 `<leader>u` 开头，用于快速开启/关闭某些功能。

| 快捷键 | 功能描述 |
| :--- | :--- |
| `<leader>uf` | 开启/关闭 **自动格式化** (Auto Format) |
| `<leader>us` | 开启/关闭 **拼写检查** (Spelling) |
| `<leader>uw` | 开启/关闭 **自动换行** (Wrap) |
| `<leader>ul` | 开启/关闭 行号 |
| `<leader>uL` | 开启/关闭 相对行号 |
| `<leader>ud` | 开启/关闭 诊断信息 (Diagnostics) |
| `<leader>uh` | 开启/关闭 内嵌提示 (Inlay Hints) |
| `<leader>uz` | 开启/关闭 **禅模式** (Zen Mode) |

### 6. 常用插件功能

根据文件中列出的插件，整理出高频使用的功能。

#### Flash.nvim (快速跳转)
| 快捷键 | 功能 |
| :--- | :--- |
| `s` | 启动 Flash 快速跳转 (屏幕内搜索字符跳转) |
| `S` | Flash Treesitter 跳转 (选中代码块) |

#### Mini.surround (包围修改)
| 快捷键 | 功能 (示例) |
| :--- | :--- |
| `gsa` | **添加** 包围 (Add) - 例如 `gsaiw"` 给单词加引号 |
| `gsd` | **删除** 包围 (Delete) - 例如 `gsd"` 删除引号 |
| `gsr` | **替换** 包围 (Replace) - 例如 `gsr"'` 将双引号改为单引号 |

#### Trouble.nvim (问题面板)
| 快捷键 | 功能 |
| :--- | :--- |
| `<leader>xx` | 打开/关闭 诊断面板 (Diagnostics) |
| `<leader>xX` | 打开/关闭 当前 Buffer 诊断面板 |
| `<leader>cs` | 查看 LSP 符号列表 (Symbols) |

#### Yanky.nvim (剪贴板历史)
| 快捷键 | 功能 |
| :--- | :--- |
| `<leader>p` | 打开剪贴板历史记录 |
| `p` / `P` | 粘贴 (Put) |
| `y` | 复制 (Yank) |

#### Todo-comments (待办高亮)
| 快捷键 | 功能 |
| :--- | :--- |
| `<leader>st` | 搜索所有 Todo 注释 |
| `]t` / `[t` | 下一个 / 上一个 Todo |

#### Grug-far (搜索替换)
| 快捷键 | 功能 |
| :--- | :--- |
| `<leader>sr` | 全局搜索并替换 (Search and Replace) |

### 7. 调试 (DAP - Debug Adapter Protocol)

如果安装了调试相关的 Extra。

| 快捷键 | 功能 |
| :--- | :--- |
| `<leader>db` | 切换断点 (Toggle Breakpoint) |
| `<leader>dc` | 继续运行 (Continue) |
| `<leader>di` | 单步步入 (Step Into) |
| `<leader>do` | 单步步出 (Step Out) |
| `<leader>dO` | 单步跳过 (Step Over) |
| `<leader>dt` | 终止调试 (Terminate) |
| `<leader>du` | 打开调试界面 (Dap UI) |

### 8. 测试 (Neotest)

| 快捷键 | 功能 |
| :--- | :--- |
| `<leader>tt` | 运行当前文件测试 |
| `<leader>tr` | 运行最近一次测试 (Run Nearest) |
| `<leader>ts` | 查看测试概览 (Summary) |
| `<leader>to` | 查看输出 (Output) |

### 9. 终端 (Terminal)

| 快捷键 | 功能 | 模式 |
| :--- | :--- | :--- |
| `<leader>ft` | 打开浮动终端 (项目根目录) | n |
| `<leader>fT` | 打开浮动终端 (当前目录) | n |
| `<c-/>` (Ctrl+/) | 切换浮动终端 | n, t |


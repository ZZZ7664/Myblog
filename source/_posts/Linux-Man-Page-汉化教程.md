---
title: Linux Man Page 汉化教程
date: 2026-03-02 11:57:04
tags:
---

# Linux Man Page 汉化教程
本文档介绍如何将 man 手册页翻译成中文。
## 原理
Linux 的 man 手册页存储在 `/usr/share/man/` 目录下，按语言分类：
- `man1/` - 程序手册
- `man5/` - 文件格式手册
- 等等
中文手册放在 `zh_CN` 子目录下，例如：
- `/usr/share/man/zh_CN/man1/` - 中文程序手册
## 以 fish 为例汉化
### 步骤 1：查找原手册位置
```bash
man -w fish
# 输出: /usr/share/man/man1/fish.1.gz
```
### 步骤 2：解压手册文件
```bash
# 解压 .gz 文件
gunzip /usr/share/man/man1/fish.1.gz
# 或者不解压直接读取内容
gunzip -c /usr/share/man/man1/fish.1.gz > /tmp/fish.1
```
### 步骤 3：翻译内容
man 手册使用 roff/troff 格式，主要命令：
| 命令 | 说明 |
|------|------|
| `.TH` | 标题 |
| `.SH` | 章节标题（NAME, SYNOPSIS, DESCRIPTION 等） |
| `.TP` | 缩进段落 |
| `.nf` / `.fi` | 无格式 / 恢复格式 |
| `\fB` | 粗体 |
| `\fI` | 斜体 |
翻译时保留格式标记，只翻译文字内容。
### 步骤 4：创建中文手册目录
```bash
sudo mkdir -p /usr/share/man/zh_CN/man1
```
### 步骤 5：安装中文手册
```bash
# 移动翻译好的文件
sudo cp fish_zh.1 /usr/share/man/zh_CN/man1/fish.1
# 压缩（可选，man 会自动处理）
sudo gzip /usr/share/man/zh_CN/man1/fish.1
# 更新 man 数据库
sudo mandb
```
### 步骤 6：查看中文手册
```bash
# 临时指定语言
man -L zh_CN fish
# 设置默认语言（添加到 ~/.bashrc 或 ~/.zshrc）
export MANOPT="-L zh_CN"
# 查看中文手册
man fish
```
## 常用命令
```bash
# 查看手册所属包
pacman -Qo /usr/share/man/man1/fish.1.gz  # Arch
dpkg -S /usr/share/man/man1/fish.1.gz     # Debian/Ubuntu
rpm -qf /usr/share/man/man1/fish.1.gz     # RHEL/CentOS
# 列出所有 fish 相关手册
ls /usr/share/man/man1/*fish*
# 查看中文手册目录
ls /usr/share/man/zh_CN/man1/
```
## 注意事项
1. **软件更新**：软件更新后手册会被覆盖，需要重新翻译
2. **权限**：安装到系统目录需要 sudo 权限
3. **备用方案**：可以放到用户目录，但需要手动指定路径
4. **格式保留**：翻译时务必保留 roff 格式标记，否则无法正常显示
## 故障排除
```bash
# 手动刷新 man 数据库
sudo mandb
# 清除 man 缓存
sudo rm -rf /var/cache/man/*
# 指定手册路径
MANPATH=/usr/share/man/zh_CN:$MANPATH man fish
# 查看所有可用语言
locale -a | grep zh
```
## 相关文件
- 已翻译的 fish 手册: `/tmp/fish_zh.1`

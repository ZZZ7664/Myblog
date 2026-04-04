---
title: 安装ArchLinux
date: 2026-04-04 18:36:18
tags: ArchLinux安装详解
---
- [重要概念讲解](#重要概念讲解)

- [手动安装](#手动安装)

- [脚本安装](#脚本安装)

- [手动安装省流版](手动安装省流版)

视频教程：[【从「Linuxmint入门」到「ArchLinux安装详解」桌面端Linux入门的最佳路径】](https://www.bilibili.com/video/BV19DBqB4EY4/?share_source=copy_web&vd_source=1c6a132d86487c8c4a29c7ff5cd8ac50)

两种安装方式，按需选择。脚本安装可能会出现意想不到的报错。新手建议先手动安装，把脚本安装当作重装系统的便利工具，否则日后出现问题自己不会解决。如果手动安装太难，就先使用开箱即用的Arch，比如CachyOS。

## 重要概念讲解

太长不看的总结：ESP（启动分区）的挂载点通常是`/boot`，但是本文为了使用btrfs快照功能将其挂载到了`/efi`。grub安装路径从默认的`/boot/grub`移动到了`/efi/grub`。

- Linux目录结构

   Linux的目录是由`/`左斜杠开头的树状结构，所以`/`被称为根目录（root目录）。例如`/home`就是根目录下的home目录，`/home/shorin`就是根目录下的home目录里面的shorin目录。

- 挂载

   意思是把硬盘分区对应到某个目录。

- 挂载点（mount point）

   假设把`/dev/nvme0n1`这个设备挂载到`/home`目录，那就称`/dev/nvme0n1`的挂载点为`/home`。

- 文件系统

   [archwiki file system](https://wiki.archlinux.org/title/File_systems)

   文件系统决定了文件的存放和检索方式，不同的文件系统有不同的功能和特性。本文使用btrfs文件系统，最大的特点是快照（相当于存档和回档）。

- Bootloader引导程序

   [archwiki_arch_boot_process](https://wiki.archlinux.org/title/Arch_boot_process#Boot_loader)

   引导程序，用来引导系统启动。Grub最为常用。

- EFI系统分区（ESP）

   [efi system partition](https://wiki.archlinux.org/title/EFI_system_partition)

   一个特殊的分区，用于存放.efi文件，这是启动系统的“第一把钥匙”，文件系统必须是FAT。

### ESP挂载点

常用挂载点为`/boot`、`/boot/efi`和`/efi`。具体挂载到哪里要看情况。

- 因素一：硬盘空间

   `/boot`是最典型的挂载点，很多Bootloader程序只有ESP挂载点为`/boot`时才能正常工作，但是`/boot`存放着系统启动和初始化相关的文件，在多内核的情况下需要1g甚至2g空间。

- 因素二：文件系统

   ESP是FAT文件系统，无法被btrfs快照记录和恢复，所以使用btrfs文件系统时ESP不能挂载到`/boot`。

   假设创建快照时的内核版本是6.16，然后更新到了6.17，然后用快照回档。此时你的系统文件会被恢复到6.16，但是`/boot`里的内核文件和initramfs因为存储在FAT文件系统导致没能回档，版本仍然是6.17。两者版本不一致导致系统无法正常启动。为了避免这种情况，使用btrfs时ESP的挂载点应该是`/boot/efi`或者`/efi`。因为`/efi`是扁平布局更加简洁，所以此时的推荐挂载点为`/efi`。

## 手动安装

参考链接：

[archlinux 简明指南](https://arch.icekylin.online/)

[安装指南 - Arch Linux 中文维基](https://wiki.archlinuxcn.org/wiki/%E5%AE%89%E8%A3%85%E6%8C%87%E5%8D%97)

### 可选：调大字体

```
setfont ter-v32n
```

或者

```
setfont -d
```

### 确认是UEFI固件

```
cat /sys/firmware/efi/fw_platform_size
```

>`cat`命令将文件内容打印在终端

>`/sys/firmware/efi/fw_platform_size`这是一个文件的绝对路径

如果输出`64`，说明主板是64位x64 UEFI固件；如果输出`32`，说明是32位UEFI；如果提示`No such file or directory`没有文件或目录，说明是BIOS。本文只涉及x64 UEFI情况下安装，如果你不是的话安装引导的步骤会不一样，可以查阅[ArchWiki_Grub](https://wiki.archlinux.org/title/GRUB#GUID_Partition_Table_(GPT)_specific_instructions)。

如果你是虚拟机，并且是BIOS固件，推荐在虚拟机设置里调整为UEFI。

### 连接网络

有线网自动连接，还可以用数据线分享手机的网络。

确认网络连接使用：

```
ip a #查看网络连接信息，如果出现了紫色的ip地址说明成功连接
ping bilibili.com #确认网络正常
```

Ctrl+C可以中止正在运行的命令。

- 使用iwctl命令行工具连接wifi（此工具由`iwd`提供）

  1. 启动

     ```
     iwctl
     ```

     此时会进入iwctl，提示符会产生变化。

  2. 连接

     ```
     device list #列出设备
     
     station wlan0 scan #扫描网络

     station wlan0 get-networks #列出所有扫描的的wifi

     station wlan0 connect 【此处是你的wifi名字（不能是中文）】
     ```

  3. 退出iwctl

     ```
     exit
     ```

### 确认开启了NTP（网络时间协议）

运行`timedatectl`，应该会在输出看到NTP已经开启，否则在安装时可能会出现验证方面的报错：

```
NTP service: active
```

手动开启使用：

```shell
timedatectl set-ntp true 
```

### reflector自动设置镜像源

用`reflector`配置最快最新的镜像源，大幅提高软件下载速度。

```
reflector -p https -a 12 -c cn --v --sort rate --save /etc/pacman.d/mirrorlist 

# -p（protocol） https 指定https协议的链接
# -a（age） 12 指定最近24小时更新过的源
# -c（country） cn 指定国家为中国（可以增加邻国）
# --v（verbose） 过程可视化
# --sort rate 按照下载速度排序（经过前面几道筛选，镜像源通常已经足够稳定，所以这里直接按照速度排序即可）
# --save /etc/pacman.d/mirrorlist 将结果保存到/etc/pacman.d/mirrorlist
```

然后同步软件列表数据

```
pacman -Sy
```

### 可选：探索Linux文件

我们从u盘加载的其实也是一个archlinux系统，称为live环境。如果你有兴趣，可以安装一个终端管理器查看当前Live环境的目录。（btw，我把live环境称作icu）

```
pacman -S yazi
```

[yazi](https://yazi-rs.github.io/)是好用的终端文档管理器，功能方便的同时内存占用也很低。如果`yazi`出现依赖问题安装失败可以试试同时安装`lua`和`yazi`，或者使用[ranger](https://github.com/ranger/ranger)。

用`yazi`命令开启鸭子（ranger使用`ranger`命令开启）

```
yazi
```

此时应该会处在一个空的/root目录，按左方向键切换到上级目录。

左中右三块区域，左边是上级目录，中间是当前目录，右边是下级目录。上下左右键切换（或者使用vim key，jkhl对应上下左右）。

我重点提几个。

- `/bin` 存放二进制可执行文件，可以找到我们之前运行过的`pacman` `timedatectl` `reflector`之类的命令

- `/dev` 存放硬件设备对应的文件。（是的，硬件在linux上也以文件的形式存在）

- `/etc` 系统级配置文件。比如pacman包管理器的配置、grub引导程序的配置等等。

- `/home` 普通用户的家目录，存放用户数据。如果新建了一个名叫shorin的用户，那么他的所有文件都会存放在`/home/shorin`

- `/boot` 存放内核、initramfs（系统初始化相关）等文件。这个目录下的文件和系统的启动息息相关。

- `/mnt` 用来手动临时挂在外部存储设备，比如我们接下来安装系统要使用的系统分区。

- `/tmp` 这里面的数据存储在内存中，重启后会消失。

其他的目录有兴趣的可以自己了解一下。

q键退出yazi。`ctrl+L`清屏。

### 硬盘分区

```shell
lsblk -pf  #查看当前分区情况
fdisk -l /dev/想要查询详细情况的硬盘  #小写字母l，查看详细分区信息
```

```shell
cfdisk /dev/nvme0n1 #选择自己要使用的硬盘进行分区
```

1. 如果是新硬盘的话会弹出选项，选GPT。

2. efi分区

   上下方向键选中空闲空间，左右方向键选择NEW创建512MB的分区，类型（type）选择efi system。

   PS：如果你的类型里没有efi system说明你的硬盘不是gpt分区表，可以使用`cfdisk -z 设备名`以空分区表打开硬盘，选择gpt分区表即可。⚠️警告⚠️ 这个操作会清空硬盘上的分区。

   PS：也可以直接使用windows的efi，如果使用win的efi分区的话跳过下面格式化efi分区的步骤（windows更新会搞坏linux的引导，建议给linux单独创建efi分区）。

3. 根分区

   其余空间全部分到一个分区里，类型linux filesystem不需要更改。

4. 保存

   选择`write`，输入`yes`保存。`quit`退出。

#### 格式化分区

通过格式化创建需要的文件系统

1. 再次查看分区情况

   ```shell
   lsblk -pf #查看分区情况
   fdisk -l /dev/想要查询详细情况的硬盘  #小写字母l，查看详细分区信息
   ```

2. 格式化efi分区

   ```shell
   mkfs.fat -F 32 /dev/nvme0n1p1（EFI分区名）
   ```

3. 格式化btrfs根分区

   ```shell
   mkfs.btrfs /dev/nvme0n1p2（根分区名）
   
   #加上-f参数可以强制格式化
   ```

#### 创建btrfs子卷

子卷是btrfs的一个特性，跟快照有关。通常至少要创建root子卷（存放系统文件）和home子卷（存放用户文件），根据命名规范取名为`@`和`@home`。由于这两者是平级关系，所以创建`@`快照时不会包含`@home`中的内容。这样就可以只恢复系统文件，不影响用户数据。

- 挂载

  ```shell
  mount -t btrfs /dev/nvme0n1p2（根分区名） /mnt
  ```

  `mount`挂载命令；

  `-t`指定文件系统；
  
  这条命令把`/dev/nvme0n1p2`分区挂载到了`/mnt`目录，而`/dev/nvme0n1p2`是我们将要安装的系统的`根分区`，这意味着`/mnt`成为了我们将要安装的系统的`根`。

- 创建子卷

  ```shell
  btrfs subvolume create /mnt/@
  btrfs subvolume create /mnt/@home
  btrfs subvolume create /mnt/@swap #不需要休眠到硬盘功能的话跳过这个
  ```

- 可选：确认

  ```shell
  btrfs subvolume list /mnt
  ```

- 取消挂载

  ```shell
  umount /mnt
  ```

### 正式挂载

1. 挂载root子卷

   ```
   mount -t btrfs -o subvol=/@,compress=zstd /dev/nvme0n1p2 /mnt
   
   # -o 指定额外的挂载参数
   # compress=zstd 指定透明压缩，zstd是压缩算法
   ```

   和刚刚的挂载是一样的操作，不过这次是把`/dev/nvme0n1p2上`的`@`子卷挂载到了`/mnt`，而不是把`/dev/nvme0n1p2`挂载到`/mnt`。

   `compress`是btrfs的另一个特性，透明压缩。在数据写入磁盘前先进行压缩，提升读写性能，节省空间，延长寿命。可以像这样zstd:3指定压缩等级，最高15。默认为3，在意cpu性能可以设置成1。

2. 挂载home子卷

   ```
   mount --mkdir -t btrfs -o subvol=/@home,compress=zstd /dev/nvme0n1p2 /mnt/home
   ```

   由于`/mnt`下没有`/mnt/home`这个目录，所以要加上`--mkdir`命令创建`/mnt/home`用来挂载。把`@home`子卷挂载到了`/mnt/home`。

3. 可选：挂载swap子卷（不需要休眠功能的话跳过这一步）

   ```
   mount --mkdir -t btrfs -o subvol=/@swap,compress=zstd /dev/nvme0n1p2 /mnt/swap
   ```

4. 挂载efi分区（ESP）

   ```
   mount --mkdir /dev/nvme0n1p1 /mnt/efi
   ```

   记得把`/dev/nvme0n1p1`替换为自己对应的efi分区设备名。

5. 可选：复查挂载情况

   ```
   df -h
   ```

### 安装系统

```
pacstrap -K /mnt base base-devel linux linux-firmware btrfs-progs networkmanager vim sudo amd-ucode

# -K 初始化密钥
# base-devel是编译其他软件的时候用的
# linux是内核，可以更换
# linux-firmware是固件
# btrfs-progs是btrfs文件系统的管理工具
# networkmanager 是联网用的，是各个桌面环境标配的联网工具
# vim 是文本编辑器，也可以换成别的，比如nano、neovim
# sudo 和权限管理有关
# amd-ucode 是微码，用来修复和优化cpu，intel用户安装intel-ucode
```

`pacstrap`命令是把软件安装到指定的根目录下。

注意：如果你使用的是marvell的无线网卡，这里要额外安装`linux-firmware-marvell`，否则进系统找不到网卡。

#### ⚠️没有联网软件的话一会安装完系统连不了网⚠️

#### vim文本编辑器基础操作

vim是以键盘操作为核心理念的文本编辑器，很陌生，但是绝对值得一学。

`i`键进入编辑模式；

`esc` 回到普通模式；

`u` 撤销；

`/`左斜杠进入搜索模式，回车跳转到搜索到的第一个，`n`n键跳转到搜索到的下一个，`Shift+n`跳转到搜索到的上一个；

`:w` 冒号小写w写入；

`:q` 冒号小写q退出；

`:wq`冒号小写wq保存并退出；

`!`命令后加上感叹号代表强制执行。

知道这些就可以开始使用了。不习惯的话可以安装`nano`。`nano`的基础操作只需要记住`Ctrl+F`搜索、`Ctrl+S`保存和`Ctrl+X`退出即可。你也可以选择安装`neovim`，vim的加强版，更现代更好用。如果安装`neovim`的话后面所有`vim`命令都改成`nvim`

### 可选：swap交换空间

参考链接：

[电源管理/挂起与睡眠 - Arch Linux 中文维基](https://wiki.archlinuxcn.org/wiki/%E7%94%B5%E6%BA%90%E7%AE%A1%E7%90%86/%E6%8C%82%E8%B5%B7%E4%B8%8E%E4%BC%91%E7%9C%A0#%E7%A6%81%E7%94%A8_zswap_%E5%86%99%E5%9B%9E%E4%BB%A5%E4%BB%85%E5%B0%86%E4%BA%A4%E6%8D%A2%E7%A9%BA%E9%97%B4%E7%94%A8%E4%BA%8E%E4%BC%91%E7%9C%A0)

[Swap - ArchWiki](https://wiki.archlinux.org/title/Swap)

[Swap - Manjaro](https://wiki.manjaro.org/index.php/Swap)

swap用来存放内存中的冷数据，提高电脑的运行速度。还能把硬盘当作虚拟内存使用。设置了硬盘swap还可以使用休眠功能。休眠指的是把系统当前状态写入硬盘，然后电脑完全断电，下一次开机恢复到休眠前的状态。硬盘swap有swap分区或者swap文件两种方式，前者配置更简单，后者配置稍复杂，但是更加灵活。这里采用交换文件的方式。

内存swap比硬盘swap更合适现代设备，如果你不需要休眠功能的话跳过这一步，后续会有将内存用作swap的设置（zram）。

swap大小参考：

| 内存(GB) | 不需要休眠(GB) | 需要休眠（GB） | 不建议超过（GB） |
| -------- | -------------- | -------------- | ---------------- |
| 1        | 1              | 2              | 2                |
| 2        | 2              | 3              | 4                |
| 3        | 3              | 5              | 6                |
| 4        | 4              | 6              | 8                |
| 5        | 2              | 7              | 10               |
| 6        | 2              | 8              | 12               |
| 8        | 3              | 11             | 16               |
| 12       | 3              | 15             | 24               |
| 16       | 4              | 20             | 32               |
| 24       | 5              | 29             | 48               |
| 32       | 6              | 38             | 64               |
| 64       | 8              | 72             | 128              |
| 128      | 11             | 139            | 256              |
| 256      | 16             | 272            | 512              |

1. 创建swap文件

   此处的`64g`应该是你实际需求的swap大小

   ```
   btrfs filesystem mkswapfile --size 64g --uuid clear /mnt/swap/swapfile
   ```

2. 启动swap

   ```
   swapon /mnt/swap/swapfile
   ```

### 生成fstab文件

系统会根据fstab中的内容自动进行挂载。

```shell
genfstab -U /mnt > /mnt/etc/fstab


# genfstab（生成文件系统表）
# -U 用uuid指定分区
# > 大于号代表输出结果覆盖写入到有右边的文件里
# 如果是>>两个大于号则代表追加写入
```

### 更换根目录（change root）

进入刚刚安装的系统

```shell
arch-chroot /mnt
```

此时根目录从live环境变成了/mnt，可以注意到提示符的变化。

### 设置时间和时区

```shell
timedatectl set-timezone Asia/Shanghai
```

```
hwclock --systohc 
```

`hwclock --systohc`生成调节时间误差的文件。

除了`timedatectl`命令，还可以手动创建链接。

```
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# ln 是link的缩写
# -s代表跨文件系统的软链接
# -f代表强制执行
```

### 本地化设置

1. 编辑配置文件

   ```
   vim /etc/locale.gen
   ```

   左斜杠键进行搜索；`x键`剪贴掉`en_US.UTF-8 UTF-8`和`zh_CN.UTF-8 UTF-8`的前面代表注释的井号；`:wq`保存并退出。

2. 生成本地化配置

   ```
   locale-gen
   ```

3. 设置系统语言

   ```
   vim /etc/locale.conf
   ```

   `i`键进入编辑模式；写入`LANG=en_US.UTF-8`设置系统语言为英文；

   ```
   LANG=en_US.UTF-8
   ```

   `esc`退出编辑模式；`:wq`保存并退出。

   `/etc/locale.conf`这个文件是系统级的语言设置，`zh_CN.UTF-8`是中文，但是会导致tty的中文字符全部变成豆腐块，所以不建议这么做。后续安装完桌面环境后在用户空间修改系统语言。

### 设置主机名

```
vim /etc/hostname
```

`i`键进入编辑模式；取一个自己喜欢的主机名，比如`archlinux`；`esc`退出编辑模式；`:wq`保存并退出。

PS：此时你应该已经相当熟悉vim编辑器最基本的操作了，所以后面我会省略vim的操作讲解。

### 设置root密码

```
passwd 
```

输入过程不显示，直接输入回车即可。

### 安装引导程序

这是uefi引导的安装方式，如果你是bios设备请看archwiki的grub页面。

就像前面[重要概念讲解](#重要概念讲解)部分说的那样，根据ESP挂载点和个人需求的不同，bootloader的选择也会不同。这里安装最常用的`grub`，采用的是ESP挂载点为`/efi`且`grub`装进ESP的方案。

1. 安装必要的软件包

   ```shell
   pacman -S grub efibootmgr os-prober exfat-utils
   ```

   `efibootmgr` 管理uefi启动项；

   `os-prober`和`exfat-utils` 用来搜索win11（不配置双系统的话可以不装）。

2. 安装grub

   ```
   grub-install --target=x86_64-efi --efi-directory=/efi --boot-directory=/efi --bootloader-id=ARCH 
   ```

   `grub-install`安装grub；

   `--target` 指定架构；

   `--efi-directory` 指定ESP位置；

   `--boot-directory` 指定grub的安装目录；

   `--bootloader-id` 任意取一个启动项名字；

   PS：如果是移动设备或者主板只支持默认的efi路径要加上`--removable`选项。

3. 编辑grub的源文件

   ```
   vim /etc/default/grub
   ```

   这是生成grub的配置文件时需要用到的东西。

   - 启动项记忆功能

     `GRUB_DEFAULT=0`改成`=saved`，再取消`GRUB_SAVEDEFAULT=true`的注释。

   - 显示开机日志

     `GRUB_CMDLINE_LINUX_DEFAULT`里面去掉`quiet`以显示开机日志。再设置`loglevel=5`把日志等级为5。`loglevel`共7级，5级是一个信息量的平衡点。

   - 禁用watchdog

     `GRUB_CMDLINE_LINUX_DEFAULT`里添加`nowatchdog`以及`modprobe.blacklist=sp5100_tco`。intelcpu用户把`sp5100_tco`换成`iTCO_wdt`

     watchdog的目的简单来说是在系统死机的时候自动重启系统。对个人用户来说没有意义，禁用以节省系统资源、提高开机和关机速度。

   - 允许使用os-prober搜索其他系统

     取消最后一行`GRUB_DISABLE_OS_PROBER=false`的注释。

4. 在grub的默认安装位置创建链接

   ```
   ln -sf /efi/grub /boot/grub
   ```

   大多数程序会默认检测`/boot/grub`作为grub的安装位置，所以创建一个链接方便使用。

5. 生成grub的配置文件

   ```
   grub-mkconfig -o /boot/grub/grub.cfg
   ```

以上的grub配置方法已经足够使用，但存储在FAT文件系统上的`grub.cfg`无法被btrfs快照回档，极端情况下仍会出现问题，例如在快照启动项里生成了`grub.cfg`导致永远启动进快照启动项。如果你想要绝对稳定的回档，看进阶内容：[可选：grub在btrfs文件系统下的最佳配置方法](附录#grub在btrfs文件系统的最佳配置方法)

### zram

[zswap - ArchWiki](https://wiki.archlinux.org/title/Zswap)

[zram - ArchWiki](https://wiki.archlinux.org/title/Zram)

zram将内存的一部分空间用作交换空间，如果你没有配置swap，请一定配置zram。

1. 安装zram-generator

   ```
   pacman -S zram-generator
   ```

2. 编辑配置文件

   ```
   vim  /etc/systemd/zram-generator.conf
   ```

   ```
   [zram0]
   zram-size = ram
   compression-algorithm = zstd 
   ```

   `zram-size`设置最多存储多少数据，注意这里设置的是压缩之前的大小。

   `compression-algorithm`这一行设置使用zstd算法。

3. 禁用zswap

   zswap是swap的缓存。需要交换的数据在存入交换空间之前会先被zswap压缩后暂时放进内存里。和zram功能重复且引入了复杂性，故禁用。

   ```
   vim /etc/default/grub
   ```

   在GRUB_CMDLINE_LINUX_DEFAULT=""里写入`zswap.enabled=0`

   ```
   GRUB_CMDLINE_LINUX_DEFAULT="... zswap.enabled=0 ... "
   ```

4. 重新生成grub的配置文件

   ```
   grub-mkconfig -o /efi/grub/grub.cfg
   ```

### 启用网络服务

开启新系统的NetworkManager服务，注意大小写

```
systemctl enable NetworkManager 
```

`systemctl`调用systemd进行操作

`enbale`代表从下一次开机开始自动启动

- 可选：替换网络后端为`iwd`

   NetworkManager的无线网默认后端是`wpa_supplicant`，可以更换为更现代的`iwd`。注意：部分设备更换`iwd`后端可能无法正常联网。

   1. 安装`iwd`

      ```
      pacman -S iwd impala
      ```

      `impala`是`iwd`的tui

   2. 编辑配置文件

      ```
      # 创建配置文件目录，-p代表如果已经存在就跳过
      mkdir -p /etc/NetworkManager/conf.d

      # 新建配置文件并用vim进行编辑
      vim /etc/NetworkManager/conf.d/iwd.conf
      ```

      写入：

      ```
      [device]
      wifi.backend=iwd
      ```

### 退出chroot

```
exit
```

此时就回到了live环境，可以注意到提示符的变化。

### 重启电脑

```
reboot
```

此时会自动取消所有的挂载。

### 拔掉系统u盘

如果u盘没拔掉的话记得拔掉

### 选择BIOS启动项

通常默认就是刚刚安装的arch，如果不是的话选择一下启动项。有的电脑的启动项可能埋在子菜单里，仔细找一下。

如果没有出现archlinux的启动项，看这个页面：<https://wiki.archlinux.org/title/GRUB>

### 登录root账户

用户名为root，密码刚刚设置过了。

### 连接网络

1. 验证是否有网

   ```
   ip a
   ping bilibili.com
   ```

2. 连接wifi

   ```
   nmtui
   ```

   `nmtui`是networkmanager提供的TUI（终端用户交互程序）。如果你使用的是`iwd`后端还可以用`impala`连接wifi。

   - 选择activate a connection
   - 选择自己的wifi进行连接
   - esc退出
   - Ctrl+L或者`clear`清屏

### 放松一下吧

恭喜你成功手动安装了archlinux，现在小小地奖励一下自己吧。

```
pacman -S fastfetch lolcat cmatrix
```

不做讲解，自己运行命令试试吧。

```
fastfetch
```

```
fastfetch | lolcat 
```

```
cmatrix
```

```
cmatrix | lolcat

cmatrix -r
```

`|`竖线叫作pipeline管道符，作用是把左边程序的输出结果输入到右边的程序里。

下一节：[安装桌面环境前的准备](安装桌面环境前的准备)

---

## 脚本安装

这部分是arch自带的archinstall脚本使用教程。这部分只介绍必要的选项，没提到的选项保持默认。想研究的话可以自己看看。

### 开启archinstall

新版本archinstall脚本提供了连接网络的功能，可以进iso之后直接运行`archinstall`命令，失败的话重试一下。

```
archinstall
```

第一项是脚本语言，第二项是系统本地化，保持英文就行，改了会乱码，等进桌面之后再改中文。直接看第三项。

### Mirrors and repositories 设置镜像源

1. 选择第一项`Select regions`设置自己的所在地。加载会比较慢，耐心等一等。左斜杠可以搜索。

2. 选择第三项`optional repositories`回车激活`multilib`。这是32位程序的源。

### Disk configuration 磁盘分区

选择`partitioning`进入磁盘分区

第一项是自动分区，默认格式化整块硬盘，ESP挂载到`/boot`。

我要把ESP挂载到`/efi`，所以使用手动分区，具体原因看[重要概念讲解](#重要概念讲解)。

选择第二项手动分区 > 要使用的硬盘

1. 创建启动分区

   选中要使用的空闲空间 > Size（分区大小）`512MB` > Filesystem（文件系统）`fat32` > Mountpoint（挂载点）`/efi`

   选中刚刚创建的分区，回车设置`bootable`和`ESP`。

2. 可选：创建swap分区

   **如果你不需要休眠功能的话跳过这一步**。休眠指的是把系统当前状态写入硬盘，然后电脑完全断电，下一次开机恢复到休眠前的状态。

   swap交换空间与虚拟内存和休眠有关。有swap分区或者swap文件两种方式，前者配置更简单，后者配置稍复杂，但是更加灵活。这里采用交换分区的方式。

   | 内存(GB) | 不需要休眠(GB) | 需要休眠（GB） | 不建议超过（GB） |
   | -------- | -------------- | -------------- | ---------------- |
   | 1        | 1              | 2              | 2                |
   | 2        | 2              | 3              | 4                |
   | 3        | 3              | 5              | 6                |
   | 4        | 4              | 6              | 8                |
   | 5        | 2              | 7              | 10               |
   | 6        | 2              | 8              | 12               |
   | 8        | 3              | 11             | 16               |
   | 12       | 3              | 15             | 24               |
   | 16       | 4              | 20             | 32               |
   | 24       | 5              | 29             | 48               |
   | 32       | 6              | 38             | 64               |
   | 64       | 8              | 72             | 128              |
   | 128      | 11             | 139            | 256              |
   | 256      | 16             | 272            | 512              |

   Size参考上面的表 > Filesystem选`linux-swap`

3. 创建root分区

   Size部分直接回车分配全部空间 > Filesystem选`btrfs`

   选中刚刚创建的btrfs，回车。选择`Mark/Unmark as compressed`设置透明压缩；再选择`Set subvolumes`（创建子卷）> 选`Add subvolume`添加子卷

   第一个子卷Subvolume name输入`@`，回车设置Subvolume mountpoint是`/` ；

   第二个子卷name是`@home`，mountpoint是`/home`

   `confirm and exit` > `confirm and exit` > `back` 完成硬盘分区

   关于子卷是什么，可以看[创建btrfs子卷](#创建btrfs子卷)

### Bootloader引导系统

如果你不知道选什么的话选`Grub`

### Kernels

tab键勾选需要的内核，通常使用`linux`即可。台式机可以选`linux-zen`以些许功耗为代价提高性能，

### Hostname主机名

设置一个自己想要的主机名

### Authentication身份认证

- `Root password`设置管理员密码

- `User account` > `Add a user` 创建普通用户

  `Should "你的用户名" be a superuser(sudo)`是问你要不要给这个用户管理员权限，选yes就行。

### Profile

`Type` > `Minimal` 是最小化安装。

`Desktop`可以自动安装桌面，如果不知道装什么桌面就装KDE Plasma。选择自动安装桌面的话还会出现`Graphics driver`选项，可以自动安装显卡驱动。

- 关于N卡驱动

  去[CodeNames · freedesktop.org](https://nouveau.freedesktop.org/CodeNames.html)这个页面搜索你的显卡型号，确认对应的NV family；NV160以后的显卡选`Nvidia (open kernel module ...)`；NV110~NV140的选`Nvidia (proprietary)`；其他的看[ArchWiki_NVIDIA](https://wiki.archlinux.org/title/NVIDIA)

### Applications（蓝牙和音视频）

- `Audio` > `pipewire` 自动安装音视频服务

- `Bluetooth` > `Yes` 自动安装蓝牙

- `Print service` >  `yes` 安装打印机驱动

### Network configuration （网络配置）

不知道选什么就选第四项 `NetworkManager（iwd backend）`。

### Additional packages（自定义安装其他软件包）

左斜杠键搜索，tab键选择。

- 必须安装

   `vim`（任意终端文本编辑器）

   如果你使用的是marvell的无线网卡，这里要额外安装`linux-firmware-marvell`，否则进系统找不到网卡。

### Timezone（时区）

左斜杠键搜索`Shanghai`

### Install

选择install安装

### 双系统

安装完成后配置windows和linux的双系统。

1. archinstall安装完成后选择`chroot`

2. 安装需要的组件

   ```
   pacman -S os-prober exfat-utils
   ```

3. 编辑grub的源文件

   ```
   vim /etc/default/grub
   ```

   方向键移动光标；`i`键进入编辑模式；取消最后一行`GRUB_DISABLE_OS_PROBER=false`的注释；`esc`退出编辑模式；`:wq`保存并退出。

   还有一些其他的设置：

   - 启动项记忆功能

     `GRUB_DEFAULT=0`改成`=saved`，再取消`GRUB_SAVEDEFAULT=true`的注释。

   - 显示开机日志

     `GRUB_CMDLINE_LINUX_DEFAULT`里面去掉`quiet`以显示开机日志。再设置`loglevel=5`把日志等级为5。`loglevel`共7级，5级是一个信息量的平衡点。

   - 禁用watchdog

     `GRUB_CMDLINE_LINUX_DEFAULT`里添加`nowatchdog`以及`modprobe.blacklist=sp5100_tco`。intelcpu用户把`sp5100_tco`换成`iTCO_wdt`

     watchdog的目的简单来说是在系统死机的时候自动重启系统。对个人用户来说没有意义，禁用以节省系统资源、提高开机和关机速度。

4. 生成grub的配置文件

   ```
   grub-mkconfig -o /efi/grub/grub.cfg
   ```

5. 在grub的默认安装位置创建链接

   ```
   ln -sf /efi/grub /boot/grub
   ```

   我们的grub在`/efi/grub`，大多数程序会默认检测`/boot/grub`作为grub的安装位置，所以创建一个链接方便使用。

6. 退出chroot

   ```
   exit
   ```

7. 重启

   ```
   reboot
   ```

8. 选择bios启动项

如果没有出现archlinux的启动项，看这个页面：<https://wiki.archlinux.org/title/GRUB>

以上的grub配置方法已经足够使用，但存储在FAT文件系统上的`grub.cfg`无法被btrfs快照回档，极端情况下仍会出现问题，例如在快照启动项里生成了`grub.cfg`导致永远启动进快照启动项。如果你想要绝对稳定的回档，看进阶内容：[可选：grub在btrfs文件系统下的最佳配置方法](附录#grub在btrfs文件系统的最佳配置方法)

## 下一节：[安装桌面环境前的准备](安装桌面环境前的准备)


> 以上文章来自 [Shorin](https://github.com/SHORiN-KiWATA)

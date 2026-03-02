# 网络问题排查指南

## 常见问题

### 1. 连接 GitHub 超时

如果你遇到类似以下错误：

```
Failed to connect to github.com port 443 after 21110 ms: Could not connect to server
```

这通常是由于网络连接问题导致的。

## 解决方案

### 方案 1: 配置代理（推荐）

如果你在中国大陆或公司防火墙后，配置代理是最有效的解决方案。

#### Windows (CMD)
```cmd
set HTTP_PROXY=http://127.0.0.1:7890
set HTTPS_PROXY=http://127.0.0.1:7890
vibe add helloggx/skill
```

#### Windows (PowerShell)
```powershell
$env:HTTP_PROXY="http://127.0.0.1:7890"
$env:HTTPS_PROXY="http://127.0.0.1:7890"
vibe add helloggx/skill
```

#### Linux/macOS
```bash
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
vibe add helloggx/skill
```

> 注意：将 `127.0.0.1:7890` 替换为你的实际代理地址和端口

### 方案 2: 使用 Git 镜像

配置 GitHub 镜像加速：

```bash
# 使用 ghproxy 镜像
git config --global url."https://mirror.ghproxy.com/https://github.com/".insteadOf "https://github.com/"

# 或使用 fastgit 镜像
git config --global url."https://hub.fastgit.xyz/".insteadOf "https://github.com/"
```

使用后记得恢复：
```bash
git config --global --unset url."https://mirror.ghproxy.com/https://github.com/".insteadOf
```

### 方案 3: 手动克隆后使用本地路径

如果网络实在不稳定，可以先手动克隆仓库，然后使用本地路径：

```bash
# 1. 手动克隆（可以使用任何方式，包括下载 ZIP）
git clone https://github.com/helloggx/skill.git

# 2. 使用本地路径安装
vibe add ./skill
```

### 方案 4: 使用 SSH 代替 HTTPS

如果你配置了 SSH 密钥，可以使用 SSH 协议：

```bash
# 配置 SSH 代理（如果需要）
git config --global http.proxy socks5://127.0.0.1:7890

# 使用 SSH URL
vibe add git@github.com:helloggx/skill.git
```

## 自动重试机制

`vibe` CLI 已内置自动重试机制：

- 默认重试 3 次
- 使用指数退避策略（1秒、2秒、4秒）
- 自动检测网络错误并重试
- 认证错误不会重试（避免账号锁定）

## 检查网络连接

在使用 `vibe` 之前，可以先检查网络连接：

```bash
# 检查是否能访问 GitHub
ping github.com

# 测试 HTTPS 连接
curl -I https://github.com

# 测试 Git 连接
git ls-remote https://github.com/helloggx/skill.git
```

## 代理配置持久化

### 方案 1: 系统环境变量（推荐）

#### Windows
1. 右键"此电脑" → "属性" → "高级系统设置" → "环境变量"
2. 在"用户变量"中新建：
   - 变量名：`HTTP_PROXY`
   - 变量值：`http://127.0.0.1:7890`
3. 同样添加 `HTTPS_PROXY`

#### Linux/macOS
在 `~/.bashrc` 或 `~/.zshrc` 中添加：
```bash
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
```

### 方案 2: Git 全局配置

```bash
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890
```

查看配置：
```bash
git config --global --get http.proxy
git config --global --get https.proxy
```

取消配置：
```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

## 常见代理软件端口

| 软件 | 默认端口 |
|------|---------|
| Clash | 7890 |
| V2Ray | 10808 |
| Shadowsocks | 1080 |
| Proxifier | 8080 |

## 故障排查清单

- [ ] 检查网络连接是否正常
- [ ] 确认代理软件是否运行
- [ ] 验证代理端口是否正确
- [ ] 测试代理是否生效：`curl -x http://127.0.0.1:7890 https://www.google.com`
- [ ] 检查防火墙设置
- [ ] 尝试关闭 VPN 后重试
- [ ] 检查 DNS 设置（可尝试使用 8.8.8.8）

## 获取帮助

如果以上方案都无法解决问题，请：

1. 查看详细错误信息
2. 在 GitHub Issues 中搜索类似问题
3. 提交新的 Issue，包含：
   - 操作系统版本
   - 网络环境（公司/家庭/学校）
   - 完整的错误信息
   - 已尝试的解决方案

# KCL启动器 · 网站

纯静态中文宣传站，包含 TCL启动器 1.2.1 下载入口与 MKZY 服务器信息。

## 本地预览

```powershell
python -m http.server 8080
```

打开 `http://127.0.0.1:8080/`。

## 下载地址

网站没有把 106 MB 的完整离线包放进仓库，避免 GitHub 25 MB 单文件限制。

1. 在 GitHub 仓库创建 Release，标签 `v1.2.1`。
2. 上传 `TCL-1.2.1-win-x64.zip` 作为 Release asset（ZIP 根目录直接包含 `TCL启动器.exe`）。
3. 打开 `index.html`，把这一行改成你的地址：

```js
const TCL_DOWNLOAD_URL = "https://github.com/YOUR_NAME/TCL-Launcher/releases/download/v1.2.1/TCL-1.2.1-win-x64.zip";
```

所有下载按钮会自动使用这个地址。

## GitHub Pages

把本目录作为仓库根目录，在 **Settings → Pages** 选择 `Deploy from a branch`，分支 `main`、目录 `/ (root)`。

当前仓库已使用 `main` 分支根目录部署；修改 `TCL_DOWNLOAD_URL` 后重新上传 `index.html` 即可。

## 文件

- `index.html`：页面
- `assets/css/site.css`：白色主题样式
- `assets/img/logo.png`：KCL 标识
- `assets/img/screenshots/home-white.png`：启动器白色主题截图
- `assets/img/backgrounds/daylight.svg`：白昼雪原背景

## 说明

- 页面无外部字体、框架或 CDN 依赖。
- 网站与 Mojang Studios、Microsoft 无隶属关系；Minecraft 是 Mojang Studios 的商标。

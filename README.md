# Onello-010

个人作品集网站（Personal Portfolio Website），已整理为工程化目录结构，可直接部署到 GitHub Pages。

## 目录结构

```
Onello-010/
├── index.html              # 作品集主页
├── works/                  # 作品详情页
│   ├── game-detail.html        # 01 游戏界面设计
│   ├── craft-detail.html       # 02 文创设计
│   ├── brand-detail.html       # 03 品牌设计
│   └── book-detail.html        # 04 书籍设计
├── css/                    # 样式文件
│   └── main.css                # 主页样式
├── js/                     # 脚本文件
│   └── main.js                 # 主页交互逻辑
├── assets/                 # 静态资源
│   ├── images/             # 图片资源
│   └── fonts/              # 字体文件
├── package.json            # 项目配置与预览脚本
├── .gitignore              # Git 忽略规则
└── README.md               # 项目说明
```

## 技术说明

- 纯静态网站，基于原生 HTML / CSS / JavaScript 构建
- 无外部构建依赖，可直接部署到 GitHub Pages
- 设计基准分辨率为 1920px 宽度

## 本地预览

任选一种方式：

1. 直接双击 `index.html` 在浏览器中打开
2. 使用本地静态服务器（推荐）：

```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js
npx serve .

# 或使用项目内置脚本
npm run dev
```

然后在浏览器访问 `http://localhost:8000`。

## GitHub Pages 部署

1. 将本目录下所有文件推送到 GitHub 仓库 `Onello-010`
2. 进入仓库 **Settings → Pages**
3. Source 选择 **Deploy from a branch**，分支选择 `main`，文件夹选择 `/ (root)`
4. 保存后等待部署完成，访问 `https://<你的用户名>.github.io/Onello-010/`

## 更新图片

如需替换作品详情页图片，将新图片放入 `assets/images/`，并修改对应 `works/*-detail.html` 中的 `<img src="...">` 路径即可。

## 注意事项

- 网站使用固定视口宽度 `width=1920`，建议在桌面端浏览以获得最佳效果
- 所有页面链接均为相对路径，可直接在任意域名下运行

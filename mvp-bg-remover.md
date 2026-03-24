# Image Background Remover — MVP 需求文档

> 版本：v1.0
> 日期：2026-03-24
> 状态：待开发

---

## 1. 产品概述

**产品名称：** BG Remover（待定）

**一句话描述：** 上传图片，自动移除背景，下载透明PNG

**目标用户：** 设计师、电商卖家、内容创作者

**核心价值：** 5秒内完成图片去背景，无需Photoshop

---

## 2. 功能需求

### 2.1 核心功能

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 图片上传 | P0 | 支持拖拽、点击上传 |
| 自动去背景 | P0 | 调用 Remove.bg API 处理 |
| 结果预览 | P0 | 处理后实时展示透明背景图 |
| 下载结果 | P0 | 下载为 PNG 格式 |
| 进度指示 | P0 | 上传中/处理中/完成 三种状态 |

### 2.2 扩展功能（v2）

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 批量处理 | P1 | 一次处理多张图片 |
| 背景替换 | P2 | 替换为纯色/指定图片 |
| 历史记录 | P3 | 本地存储处理历史 |

---

## 3. 技术方案

### 3.1 技术栈

| 部分 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js 14（App Router） | 部署在 Cloudflare Pages |
| 后端 API | Next.js API Routes | 自动部署为 Cloudflare Workers |
| AI 服务 | Remove.bg API | 第三方背景移除服务 |
| 样式 | Tailwind CSS | 赛博科技蓝色系风格 |
| 域名 | 待定 | 部署后绑定 |

### 3.2 API 设计

#### POST /api/remove

**请求：**
```typescript
FormData {
  image: File  // 图片文件（PNG/JPG/WebP，最大 10MB）
}
```

**响应：**
```typescript
// 成功
{
  "success": true,
  "data": {
    "result": "data:image/png;base64,xxxxx",
    "originalName": "photo.jpg"
  }
}

// 失败
{
  "success": false,
  "error": "错误描述"
}
```

### 3.3 Remove.bg API 集成

```typescript
// API Endpoint
POST https://api.remove.bg/v1.0/removebg

// Headers
X-Api-Key: {REMOVE_BG_API_KEY}

// FormData
image_file: File
size: "auto"
output_format: "png"
```

---

## 4. UI/UX 设计

### 4.1 页面结构

```
首页
├── 顶部导航（Logo + 域名）
├── 主内容区
│   ├── 上传区域（拖拽 + 点击）
│   ├── 预览区（原始图 + 处理后对比）
│   └── 下载按钮
└── 底部（版权 + 链接）
```

### 4.2 交互流程

```
用户进入页面
    ↓
拖拽/点击上传图片
    ↓
显示上传进度
    ↓
自动调用 API 处理
    ↓
展示处理结果（透明背景预览）
    ↓
点击下载 → 下载 PNG
    ↓
可继续上传新图片
```

### 4.3 视觉风格

- **主题色：** 赛博蓝色（#00aaff / #0066ff）
- **背景：** 深色（#060b18）
- **风格：** 简洁，科技感

---

## 5. 错误处理

| 场景 | 处理 |
|------|------|
| 文件过大（>10MB） | 提示"图片不超过10MB" |
| 文件格式不支持 | 提示"仅支持 PNG/JPG/WebP" |
| API Key 无效 | 提示"服务配置错误，请联系管理员" |
| Remove.bg 配额用完 | 提示"今日配额已用完，请明天再来" |
| 网络错误 | 提示"网络错误，请重试" |

---

## 6. 非功能需求

| 需求 | 说明 |
|------|------|
| 响应时间 | 处理一张图片 < 5秒 |
| 并发 | 支持 10 人同时使用 |
| 安全性 | API Key 存在 Cloudflare 环境变量 |
| 限制 | 单用户每分钟最多 10 次请求 |

---

## 7. 待确认事项

| 项目 | 状态 |
|------|------|
| Remove.bg API Key | ⏳ 待提供 |
| 部署域名 | ⏳ 待确认 |
| 产品名称 | ⏳ 待定 |
| Logo 设计 | ⏳ 待定 |

---

## 8. 开发计划

### Phase 1 — MVP（1-2天）
- [ ] 项目初始化（Next.js + Cloudflare Pages）
- [ ] 前端页面（上传 + 预览 + 下载）
- [ ] 后端 API（调用 Remove.bg）
- [ ] 基础错误处理
- [ ] 部署上线

### Phase 2 — 体验优化
- [ ] 批量处理
- [ ] 背景替换
- [ ] 使用文档

---

## 9. 参考资料

- Remove.bg API Docs: https://www.remove.bg/api
- Cloudflare Pages + Next.js: https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/

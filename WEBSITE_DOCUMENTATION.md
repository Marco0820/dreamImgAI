# DreamImg AI 网站详细说明文档

## 项目概述

DreamImg AI 是一个现代化的 AI 图像生成平台，为用户提供免费、强大且注重隐私的图像创作服务。该项目采用先进的技术栈，集成多个顶级AI模型，为用户提供专业级的图像生成体验。

### 核心特性

- ✨ **完全免费使用** - 无需注册即可使用基础功能
- 🚀 **多模型支持** - 集成 Flux.1 系列和 Seedream3.0 模型
- 🎨 **丰富的风格控制** - 17种艺术风格、7种色彩方案、11种光照效果
- 🔒 **隐私优先** - 零数据保留策略，图像不存储在服务器
- 🌍 **国际化支持** - 支持 20+ 种语言
- 📱 **响应式设计** - 完美适配移动端和桌面端

## 技术架构

### 前端架构 (Next.js 14)

```
frontend/
├── src/
│   ├── components/           # 组件库
│   │   ├── ui/              # 基础UI组件
│   │   ├── landing/         # 着陆页组件
│   │   ├── SDXLGenerator.tsx # 核心生成器组件
│   │   └── Layout.tsx       # 布局组件
│   ├── pages/               # 页面路由
│   │   ├── api/            # API路由
│   │   ├── index.tsx       # 首页
│   │   ├── generate.tsx    # 生成页面
│   │   ├── documentation.tsx # 文档页面
│   │   └── ...
│   ├── lib/                # 工具库
│   ├── hooks/              # 自定义钩子
│   ├── store/              # 状态管理
│   └── styles/             # 样式文件
├── public/                 # 静态资源
│   ├── locales/           # 国际化文件
│   └── images/            # 图片资源
└── prisma/                # 数据库配置
```

### 后端架构 (FastAPI)

```
backend/
├── app/
│   ├── api/                # API路由
│   │   └── endpoints/      # 具体端点
│   │       ├── images.py   # 图像生成API
│   │       └── users.py    # 用户管理API
│   ├── core/               # 核心配置
│   │   ├── config.py       # 应用配置
│   │   └── security.py     # 安全配置
│   ├── models/             # 数据模型
│   │   ├── user.py         # 用户模型
│   │   └── image.py        # 图像模型
│   ├── crud/               # 数据库操作
│   ├── schemas.py          # Pydantic模式
│   └── main.py             # 应用入口
└── requirements.txt        # 依赖清单
```

## 核心功能详解

### 1. AI 图像生成

#### 支持的模型

| 模型名称 | 类型 | 特点 | 使用场景 |
|---------|------|------|----------|
| Flux.1 Dev (Schnell) | 免费 | 快速生成，标准质量 | 日常创作，快速预览 |
| Flux.1 Dev (Original) | 免费 | 平衡模式，良好质量 | 通用图像生成 |
| Flux.1 Pro | 付费 | 最高质量，专业级 | 商业用途，高质量需求 |
| Seedream3.0 | 付费 | 创新算法，独特风格 | 艺术创作，特殊效果 |

#### 生成流程

1. **用户输入** - 文本提示词 + 可选参数
2. **参数处理** - 风格、颜色、光照、构图组合
3. **安全验证** - Cloudflare Turnstile 人机验证
4. **AI处理** - 调用相应模型生成图像
5. **结果返回** - Base64 格式图像数据
6. **客户端展示** - 实时显示生成结果

### 2. 风格控制系统

#### 风格分类

**艺术风格 (17种)**
- 动漫风格 (anime style)
- 数字艺术 (digital art)
- 幻想艺术 (fantasy art)
- 赛博朋克 (cyberpunk)
- 电影感 (cinematic)
- 摄影 (photographic)
- 等等...

**色彩方案 (7种)**
- 暖色调 (warm color palette)
- 冷色调 (cool color palette)
- 柔和色彩 (soft colors)
- 鲜艳色彩 (vibrant colors)
- 粉彩 (pastel colors)
- 黑白 (black and white)

**光照效果 (11种)**
- 戏剧性光照 (dramatic lighting)
- 体积光 (volumetric lighting)
- 黄金时段 (golden hour)
- 影棚光 (studio lighting)
- 逆光 (backlight)
- 等等...

**构图方式 (8种)**
- 特写镜头 (close-up shot)
- 广角镜头 (wide-angle shot)
- 微距摄影 (macro photography)
- 浅景深 (shallow depth of field)
- 等等...

### 3. 用户管理系统

#### 认证机制
- **NextAuth.js** - 安全的认证框架
- **多种登录方式** - 邮箱/密码、OAuth
- **会话管理** - JWT token + 数据库会话
- **权限控制** - 基于角色的访问控制

#### 积分系统
- **免费用户** - 基础模型免费使用
- **积分制** - 高级模型按积分消费
- **订阅制** - Ultimate 会员无限制使用
- **灵活计费** - 支持多种付费模式

### 4. 安全与隐私

#### 安全措施
1. **Cloudflare Turnstile** - 防止机器人攻击
2. **HTTPS 加密** - 全站 SSL/TLS 加密
3. **CORS 策略** - 严格的跨域访问控制
4. **SQL 注入防护** - ORM 层面的安全保护
5. **输入验证** - Pydantic 数据验证

#### 隐私保护
1. **零数据保留** - 生成的图像不存储在服务器
2. **最小数据收集** - 仅收集必要的用户信息
3. **匿名使用** - 支持无需注册即可使用
4. **数据加密** - 敏感数据加密存储
5. **定期清理** - 自动清理临时数据

## API 接口文档

### 图像生成 API

**端点**: `POST /api/v1/images/generate/`

**请求参数**:
```json
{
  "prompt": "string",                    // 必需：图像描述
  "negative_prompt": "string",           // 可选：负面提示词
  "style": "string",                     // 可选：艺术风格
  "color": "string",                     // 可选：色彩方案
  "lighting": "string",                  // 可选：光照效果
  "composition": "string",               // 可选：构图方式
  "aspect_ratio": "1:1",                // 可选：宽高比
  "model": "tt-flux1-schnell",          // 可选：模型选择
  "turnstile_token": "string",          // 必需：人机验证token
  "image_b64": "string",                // 可选：参考图像
  "reference_strength": 0.5             // 可选：参考强度
}
```

**响应格式**:
```json
{
  "images": [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  ]
}
```

### 用户管理 API

**用户注册**: `POST /api/auth/register`
**用户登录**: `POST /api/auth/login`
**获取积分**: `GET /api/user/credits`
**系统健康检查**: `GET /api/v1/images/healthcheck/`

## 部署与运维

### 开发环境搭建

#### 前端开发
```bash
cd frontend
npm install
npm run dev
```

#### 后端开发
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### 数据库设置
```bash
# 设置环境变量
export DATABASE_URL="postgresql://user:password@localhost/dreamimg"

# 运行迁移
cd frontend
npx prisma migrate dev
```

### 生产环境部署

#### 容器化部署 (Docker)
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://backend:8000
  
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/dreamimg
  
  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=dreamimg
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
```

#### 云部署 (AWS CDK)
项目包含完整的 AWS CDK 部署配置：
```bash
cd deployment
npm install
npm run build
cdk deploy
```

### 环境变量配置

#### 前端 (.env.local)
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=your-site-key
```

#### 后端 (.env)
```env
DATABASE_URL=postgresql://user:password@localhost/dreamimg
FIREWORKS_API_KEY=your-fireworks-api-key
TTAPI_KEY=your-ttapi-key
CLOUDFLARE_TURNSTILE_SECRET_KEY=your-secret-key
CREEM_API_KEY=your-creem-api-key
CLIENT_BASE_URL=http://localhost:3000
```

## 性能优化

### 前端优化
1. **代码分割** - Next.js 自动代码分割
2. **图像优化** - Next.js Image 组件优化
3. **缓存策略** - React Query 数据缓存
4. **懒加载** - 组件和图像懒加载
5. **压缩打包** - 生产环境代码压缩

### 后端优化
1. **异步处理** - FastAPI 异步编程
2. **连接池** - 数据库连接池优化
3. **缓存机制** - Redis 缓存热点数据
4. **负载均衡** - 多实例负载均衡
5. **CDN 加速** - 静态资源 CDN 分发

### 数据库优化
1. **索引优化** - 关键字段建立索引
2. **查询优化** - SQL 查询优化
3. **分区策略** - 大表分区存储
4. **备份策略** - 定期数据备份
5. **监控告警** - 性能监控和告警

## 监控与日志

### 系统监控
- **性能指标** - CPU、内存、磁盘使用率
- **API 响应时间** - 接口性能监控
- **错误率统计** - 错误日志分析
- **用户行为** - 用户操作行为分析

### 日志管理
- **结构化日志** - JSON 格式日志
- **日志等级** - DEBUG/INFO/WARN/ERROR
- **日志轮转** - 自动日志文件轮转
- **集中收集** - ELK 技术栈日志收集

## 扩展开发

### 添加新的AI模型
1. 在 `MODEL_MAP` 中添加模型配置
2. 更新前端模型选择器
3. 配置相应的API密钥
4. 测试模型集成

### 添加新的风格选项
1. 更新 `styleOptions.ts` 配置
2. 添加相应的翻译文本
3. 测试风格效果
4. 更新文档说明

### 添加新的语言支持
1. 在 `public/locales/` 下添加语言文件
2. 更新 `next-i18next.config.js` 配置
3. 添加语言切换选项
4. 测试翻译完整性

## 常见问题解决

### 开发环境问题

**Q: 前端启动失败**
A: 检查 Node.js 版本 (>=16)，清除 node_modules 重新安装

**Q: 后端API连接失败**
A: 检查后端服务是否启动，确认端口号 8000 未被占用

**Q: 数据库连接错误**
A: 检查 DATABASE_URL 配置，确认 PostgreSQL 服务正常运行

### 生产环境问题

**Q: 图像生成超时**
A: 检查 AI 服务提供商 API 状态，增加超时时间设置

**Q: 内存使用过高**
A: 优化图像处理流程，添加内存监控和自动重启机制

**Q: 并发处理能力不足**
A: 增加服务器实例，配置负载均衡器

## 贡献指南

### 代码规范
- **TypeScript** - 前端使用 TypeScript 严格模式
- **Python** - 后端遵循 PEP 8 规范
- **Git** - 使用语义化提交信息
- **测试** - 添加单元测试和集成测试

### 提交流程
1. Fork 项目仓库
2. 创建功能分支
3. 编写代码和测试
4. 提交 Pull Request
5. 代码审查和合并

## 版本更新记录

### v1.0.0 (当前版本)
- ✅ 基础图像生成功能
- ✅ 多模型支持
- ✅ 风格控制系统
- ✅ 用户管理系统
- ✅ 国际化支持
- ✅ 响应式设计

### 未来版本规划
- 🚧 v1.1.0 - 增加更多AI模型
- 🚧 v1.2.0 - 视频生成功能
- 🚧 v1.3.0 - 社区功能
- 🚧 v1.4.0 - API 开放平台

## 联系方式

- **项目仓库**: [GitHub链接]
- **技术支持**: lvyuzhen0820@gmail.com
- **功能建议**: 通过 GitHub Issues 提交
- **商务合作**: 邮件联系

---

*本文档由项目团队维护，最后更新时间：2024年12月*

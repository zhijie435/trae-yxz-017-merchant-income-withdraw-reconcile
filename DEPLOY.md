# 门店端收益提现对账系统 - 部署文档

## 1. 系统概述

门店端收益提现对账系统是面向门店经营者的财务管理平台，提供账户资金可视化、收益明细查询、收款账户管理、提现申请审核、分账记录追踪及数据导出等核心功能。

### 1.1 功能模块

| 模块 | 功能描述 | 核心文件 |
|------|----------|----------|
| 账户信息区 | 展示账户余额、可提现金额、冻结金额、累计营收 | [AccountInfoArea.vue](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/017-门店端收益提现对账/src/components/AccountInfoArea.vue) |
| 收益记录 | 收益明细查询、筛选、统计展示 | [RevenueRecordArea.vue](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/017-门店端收益提现对账/src/components/RevenueRecordArea.vue) |
| 收款账户管理 | 银行账户增删改查、设置默认账户 | [BankAccountPage.vue](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/017-门店端收益提现对账/src/pages/BankAccountPage.vue) |
| 提现审核 | 提现申请提交、状态追踪、审核流程 | [withdraw.ts](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/017-门店端收益提现对账/src/api/withdraw.ts) |
| 分账记录 | 城市合伙人分账记录查询 | [SplitRecordPage.vue](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/017-门店端收益提现对账/src/pages/SplitRecordPage.vue) |
| 数据导出 | Excel格式导出各类业务数据 | [useExport.ts](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/017-门店端收益提现对账/src/composables/useExport.ts) |

---

## 2. 环境要求

### 2.1 运行环境

| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 18.0.0 | 建议使用 LTS 版本 |
| pnpm | >= 8.0.0 | 包管理器 |
| 浏览器 | Chrome >= 90, Firefox >= 88, Safari >= 14 | 现代浏览器支持 |

### 2.2 技术栈

**前端：**
- Vue 3.4.15 + TypeScript 5.3.3
- Vite 5.0.12 (构建工具)
- Tailwind CSS 3.4.1 (样式框架)
- Vue Router 4.2.5 (路由管理)
- Lucide Vue Next (图标库)

**后端：**
- Express 4.21.2
- TypeScript (ESM)
- 支持 Serverless 部署 (Vercel)

---

## 3. 部署步骤

### 3.1 本地开发环境部署

#### 步骤 1：安装依赖

```bash
# 进入项目目录
cd 017-门店端收益提现对账

# 使用 pnpm 安装依赖
pnpm install
```

#### 步骤 2：配置环境变量

创建 `.env` 文件（可选，当前项目使用 Mock 数据无需额外配置）：

```env
# 服务端口（默认 3001）
PORT=3001

# API 基础路径
VITE_API_BASE_URL=/api
```

#### 步骤 3：启动开发服务

```bash
# 同时启动前端和后端开发服务
pnpm dev
```

服务启动后：
- 前端地址：http://localhost:5173
- 后端 API 地址：http://localhost:3001
- API 代理：前端请求 `/api/*` 会自动代理到后端

#### 步骤 4：访问验证

在浏览器中访问 http://localhost:5173，确认以下页面正常加载：
- 首页（账户信息区）- `/`
- 收款账户管理 - `/bank-account`
- 城市合伙人 - `/city-partner`
- 分账记录 - `/split-record`

### 3.2 生产环境构建

#### 步骤 1：执行构建命令

```bash
# 类型检查 + 构建
pnpm build
```

构建完成后，产物将生成在 `dist/` 目录下：

```
dist/
├── assets/          # 静态资源（JS/CSS/图片）
├── index.html       # 入口 HTML
└── favicon.svg      # 网站图标
```

#### 步骤 2：本地预览构建产物

```bash
# 预览构建结果
pnpm preview
```

### 3.3 Vercel 部署（推荐）

项目已配置 `vercel.json`，支持一键部署到 Vercel 平台。

#### 配置说明

`vercel.json` 配置内容：

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

- API 请求 `/api/*` 转发到 Serverless 函数 `/api/index.ts`
- 其他请求走前端路由，由 `index.html` 处理

#### 部署步骤

1. 安装 Vercel CLI：
```bash
npm install -g vercel
```

2. 登录 Vercel：
```bash
vercel login
```

3. 执行部署：
```bash
# 开发环境部署
vercel

# 生产环境部署
vercel --prod
```

### 3.4 传统服务器部署

#### 使用 PM2 部署后端

```bash
# 全局安装 PM2
npm install -g pm2

# 构建后端（如果需要）
npx tsc --project tsconfig.json

# 启动后端服务
pm2 start api/server.ts --name store-finance-api --interpreter tsx

# 配置 Nginx 反向代理（示例）
# location /api/ {
#     proxy_pass http://localhost:3001/;
#     proxy_set_header Host $host;
#     proxy_set_header X-Real-IP $remote_addr;
# }
```

#### 前端静态资源部署

将 `dist/` 目录上传到 Web 服务器（Nginx/Apache），配置示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # 前端路由 fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 4. 功能验收命令

### 4.1 代码质量检查

#### 类型检查

```bash
# 运行 TypeScript 类型检查
pnpm check
```

预期结果：无类型错误，输出 `Found 0 errors.`

#### 代码规范检查

```bash
# 运行 ESLint 检查
pnpm lint

# 自动修复可修复的问题
pnpm lint:fix
```

预期结果：无 lint 错误

---

### 4.2 收款账户管理 - 验收命令

收款账户模块核心功能：账户增删改查、筛选查询、设置默认账户。

#### 运行单元测试

```bash
# 运行收款账户专项测试
pnpm test -- src/composables/useBankAccount.test.ts

# 查看测试覆盖率
pnpm test:coverage -- src/composables/useBankAccount.test.ts
```

#### 测试覆盖项

| 测试项 | 验证点 |
|--------|--------|
| 账户列表查询 | 无筛选、按类型筛选(debit/credit/public)、按状态筛选(active/inactive)、关键字搜索 |
| 默认账户管理 | 获取默认账户、设置默认账户、取消默认账户 |
| 账户CRUD | 创建账户（勾选默认）、更新账户（修改默认勾选）、删除账户 |
| 异常处理 | 服务端错误、网络异常、参数校验错误 |

#### API 验收命令

```bash
# 获取收款账户列表
curl "http://localhost:3001/api/bank-account?page=1&pageSize=10"

# 按类型筛选（储蓄卡）
curl "http://localhost:3001/api/bank-account?page=1&pageSize=10&type=debit"

# 按状态筛选（已启用）
curl "http://localhost:3001/api/bank-account?page=1&pageSize=10&status=active"

# 关键字搜索
curl "http://localhost:3001/api/bank-account?page=1&pageSize=10&keyword=工商"

# 获取默认账户
curl "http://localhost:3001/api/bank-account/default"

# 获取账户详情
curl "http://localhost:3001/api/bank-account/BA001"

# 创建收款账户（勾选默认）
curl -X POST "http://localhost:3001/api/bank-account" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "张三",
    "bankBranch": "杭州余杭支行",
    "accountNo": "622202999988887777",
    "bankName": "招商银行",
    "type": "debit",
    "isDefault": true,
    "status": "active"
  }'

# 设置默认账户
curl -X PUT "http://localhost:3001/api/bank-account/BA002/default"

# 更新账户信息
curl -X PUT "http://localhost:3001/api/bank-account/BA001" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "张三",
    "bankBranch": "杭州西湖支行",
    "accountNo": "62220212345678901234",
    "bankName": "中国工商银行",
    "type": "debit",
    "isDefault": false,
    "status": "active"
  }'

# 删除账户
curl -X DELETE "http://localhost:3001/api/bank-account/BA003"
```

---

### 4.3 提现审核 - 验收命令

提现模块核心功能：提现申请提交、状态追踪、取消申请、统计查询。

#### 运行单元测试

```bash
# 运行提现 API 专项测试
pnpm test -- src/api/withdraw.test.ts

# 查看测试覆盖率
pnpm test:coverage -- src/api/withdraw.test.ts
```

#### 测试覆盖项

| 测试项 | 验证点 |
|--------|--------|
| 提现统计 | 今日/本月/累计提现金额、处理中笔数 |
| 提现记录 | 列表查询、日期筛选、状态筛选(pending/processing/success/failed/cancelled) |
| 可提现查询 | 获取可提现金额、可用收款账户 |
| 提现申请 | 提交申请（含手续费计算）、最小金额、大额提现、余额不足校验 |
| 取消申请 | 取消待处理申请、已处理申请不可取消 |
| 异常处理 | 账户冻结、账户不存在、参数校验 |

#### API 验收命令

```bash
# 获取提现统计
curl "http://localhost:3001/api/withdraw/stats"

# 获取可提现金额
curl "http://localhost:3001/api/withdraw/available-amount"

# 获取可用收款账户
curl "http://localhost:3001/api/withdraw/available-accounts"

# 获取提现记录列表
curl "http://localhost:3001/api/withdraw/list?page=1&pageSize=10"

# 按日期范围筛选提现记录
curl "http://localhost:3001/api/withdraw/list?page=1&pageSize=10&startDate=2024-01-01&endDate=2024-01-31"

# 按状态筛选（待审核）
curl "http://localhost:3001/api/withdraw/list?page=1&pageSize=10&status=pending"

# 按状态筛选（处理中）
curl "http://localhost:3001/api/withdraw/list?page=1&pageSize=10&status=processing"

# 按状态筛选（成功）
curl "http://localhost:3001/api/withdraw/list?page=1&pageSize=10&status=success"

# 按状态筛选（失败）
curl "http://localhost:3001/api/withdraw/list?page=1&pageSize=10&status=failed"

# 按状态筛选（已取消）
curl "http://localhost:3001/api/withdraw/list?page=1&pageSize=10&status=cancelled"

# 提交提现申请
curl -X POST "http://localhost:3001/api/withdraw/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 80000,
    "bankAccountId": "BA001",
    "remark": "日常运营提现"
  }'

# 取消提现申请
curl -X POST "http://localhost:3001/api/withdraw/WD002/cancel"
```

---

### 4.4 数据导出 - 验收命令

导出模块核心功能：收益明细导出、提现记录导出、分账记录导出。

#### 运行单元测试

```bash
# 运行导出功能专项测试
pnpm test -- src/composables/useExport.test.ts

# 查看测试覆盖率
pnpm test:coverage -- src/composables/useExport.test.ts
```

#### 测试覆盖项

| 测试项 | 验证点 |
|--------|--------|
| 文件下载 | 创建下载链接、触发浏览器下载 |
| 文件名解析 | 从 Content-Disposition 解析文件名（含中文） |
| 文件名优先级 | Content-Disposition > fallback > 默认 > 自动生成 |
| 异常处理 | 导出失败、网络异常、错误信息重置 |
| 连续导出 | 多次导出状态正确切换 |

#### API 验收命令

```bash
# 导出收益明细（无筛选）
curl -O -J "http://localhost:3001/api/revenue/export"

# 导出收益明细（日期筛选）
curl -O -J "http://localhost:3001/api/revenue/export?startDate=2024-01-01&endDate=2024-01-31"

# 导出收益明细（类型+状态筛选）
curl -O -J "http://localhost:3001/api/revenue/export?type=订单收益&status=success"

# 导出提现记录（无筛选）
curl -O -J "http://localhost:3001/api/withdraw/export"

# 导出提现记录（日期+状态筛选）
curl -O -J "http://localhost:3001/api/withdraw/export?startDate=2024-01-01&endDate=2024-01-31&status=success"

# 导出分账记录
curl -O -J "http://localhost:3001/api/partner/splits/export?startDate=2024-01-01&endDate=2024-01-31"

# 验证导出文件格式（检查响应头）
curl -I "http://localhost:3001/api/revenue/export"
# 预期包含：
# Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
# Content-Disposition: attachment; filename="xxx.xlsx"
```

---

### 4.5 分账记录 - 验收命令

```bash
# 运行分账记录专项测试
pnpm test -- src/composables/useSplitRecord.test.ts
```

#### API 验收命令

```bash
# 获取分账统计
curl "http://localhost:3001/api/partner/splits/stats"

# 获取分账记录列表
curl "http://localhost:3001/api/partner/splits?page=1&pageSize=10"

# 按日期范围筛选
curl "http://localhost:3001/api/partner/splits?page=1&pageSize=10&startDate=2024-01-01&endDate=2024-01-31"

# 按合伙人筛选
curl "http://localhost:3001/api/partner/splits?page=1&pageSize=10&partnerId=CP001"

# 按状态筛选
curl "http://localhost:3001/api/partner/splits?page=1&pageSize=10&status=success"
```

---

## 5. 完整验收流程

### 5.1 一键运行所有测试

```bash
# 运行全部单元测试
pnpm test

# 运行全部测试并生成覆盖率报告
pnpm test:coverage
```

### 5.2 完整质量检查流水线

```bash
# 1. 类型检查
pnpm check

# 2. 代码规范检查
pnpm lint

# 3. 单元测试
pnpm test

# 4. 生产构建验证
pnpm build
```

全部通过后即为验收合格。

---

## 6. 常见问题排查

### 6.1 开发环境问题

**Q: 启动后 API 请求 404？**
- 确认后端服务已启动：`lsof -i :3001`
- 检查代理配置：`vite.config.ts` 中 proxy 配置是否正确

**Q: 热更新不生效？**
- 清除浏览器缓存
- 确认 Vite 配置正确

### 6.2 构建问题

**Q: TypeScript 构建失败？**
- 运行 `pnpm check` 查看具体错误
- 检查 `shared/types.ts` 类型定义是否完整

**Q: 构建产物体积过大？**
- 检查是否有不必要的依赖
- 开启 Vite 的代码分割和压缩（已默认配置）

### 6.3 部署问题

**Q: Vercel 部署后 API 500？**
- 检查 Serverless 函数日志
- 确认 `api/index.ts` 导出正确
- 检查依赖是否全部在 `dependencies` 中

**Q: 导出功能在生产环境失效？**
- 确认响应头 `Content-Disposition` 正确设置
- 检查是否有 CDN 缓存导致响应头丢失

---

## 7. 监控与运维

### 7.1 关键监控指标

| 指标 | 告警阈值 | 说明 |
|------|----------|------|
| API 响应时间 | > 500ms | 接口性能 |
| API 错误率 | > 1% | 服务可用性 |
| 导出接口超时 | > 30s | 大数据量导出 |
| 并发用户数 | > 100 | 系统容量 |

### 7.2 日志配置

后端服务关键日志：
- API 请求日志（方法、路径、状态码、耗时）
- 错误日志（异常堆栈、请求上下文）
- 导出操作日志（文件大小、导出耗时）

---

## 附录：API 接口清单

| 模块 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 账户 | GET | `/api/account/info` | 获取账户信息 |
| 收益 | GET | `/api/revenue/stats` | 获取收益统计 |
| 收益 | GET | `/api/revenue/list` | 获取收益列表 |
| 收益 | GET | `/api/revenue/export` | 导出收益明细 |
| 收款账户 | GET | `/api/bank-account` | 账户列表 |
| 收款账户 | GET | `/api/bank-account/default` | 获取默认账户 |
| 收款账户 | GET | `/api/bank-account/:id` | 账户详情 |
| 收款账户 | POST | `/api/bank-account` | 创建账户 |
| 收款账户 | PUT | `/api/bank-account/:id` | 更新账户 |
| 收款账户 | PUT | `/api/bank-account/:id/default` | 设置默认 |
| 收款账户 | DELETE | `/api/bank-account/:id` | 删除账户 |
| 提现 | GET | `/api/withdraw/stats` | 提现统计 |
| 提现 | GET | `/api/withdraw/list` | 提现列表 |
| 提现 | GET | `/api/withdraw/available-amount` | 可提现金额 |
| 提现 | GET | `/api/withdraw/available-accounts` | 可用账户 |
| 提现 | POST | `/api/withdraw/submit` | 提交提现 |
| 提现 | POST | `/api/withdraw/:id/cancel` | 取消提现 |
| 提现 | GET | `/api/withdraw/export` | 导出提现记录 |
| 分账 | GET | `/api/partner/splits/stats` | 分账统计 |
| 分账 | GET | `/api/partner/splits` | 分账列表 |
| 分账 | GET | `/api/partner/splits/export` | 导出分账记录 |

---

**文档版本：** v1.0
**最后更新：** 2026-06-20

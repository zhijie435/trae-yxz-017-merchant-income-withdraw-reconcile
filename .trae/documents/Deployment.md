# 门店端收益提现对账 - 部署与验收文档

> 本文档面向门店财务模块的**部署配置**与**上线验收**，重点覆盖：**收款账户**、**提现审核**、**导出**三个模块的接口清单与可执行的验收命令。所有验收命令均已在本地服务（Express `3001` 端口）实测通过。

## 1. 文档范围

| 模块 | 后端路由前缀 | 关键能力 | 验收命令位置 |
|------|--------------|----------|--------------|
| 收款账户 | `/api/bank-account` | 账户增删改查、默认账户、启用/停用 | [§6.1](#61-收款账户验收) |
| 提现审核 | `/api/withdraw` | 提现统计、待审核/处理中单据查询、提现申请提交与校验 | [§6.2](#62-提现审核验收) |
| 导出 | `/api/revenue/export`、`/api/withdraw/export` | 收益明细 / 提现记录 Excel 导出 | [§6.3](#63-导出验收) |

## 2. 运行环境与依赖

| 项 | 说明 |
|----|------|
| Node.js | `>= 18`（ESM 项目） |
| 包管理 | `pnpm`（仓库已提供 `pnpm-lock.yaml`），亦可用 `npm` |
| 前端 | Vue@3 + TypeScript + Vite，开发端口 `5173` |
| 后端 | Express@4 + TypeScript（ESM，经 `tsx` 运行），端口 `3001` |
| 数据 | Mock 数据，金额单位为「分」，展示时换算为「元」 |
| 环境变量 | `PORT`（后端端口，缺省 `3001`，见 [api/server.ts](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/017-门店端收益提现对账/api/server.ts#L9)）、`NODE_ENV` |

> 前端 Vite 通过代理把 `/api` 转发到 `http://localhost:3001`（见 [vite.config.ts](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/017-门店端收益提现对账/vite.config.ts#L30-L49)），因此验收时既可直连后端 `3001`，也可经由前端 `5173`。

## 3. 本地开发部署

```bash
# 1. 安装依赖
pnpm install            # 或 npm install

# 2. 同时启动前端(5173)与后端(3001)
pnpm dev                # 等价 npm run dev = concurrently "vite" "nodemon"

# 单独启动后端（验收接口最常用）
pnpm server:dev         # 等价 nodemon，经 tsx 运行 api/server.ts
# 或直接：
PORT=3001 npx tsx api/server.ts
```

启动成功标志：终端输出 `Server ready on port 3001`，且 `GET /api/health` 返回 `200`。

## 4. 生产构建与部署

### 4.1 构建
```bash
pnpm check              # vue-tsc 类型检查（构建前置）
pnpm build              # vue-tsc -b && vite build，产物输出至 dist/
pnpm preview            # 本地预览构建产物
```

### 4.2 Vercel 部署
- Serverless 入口：[api/index.ts](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/017-门店端收益提现对账/api/index.ts)，将 Express `app` 导出为 Vercel handler。
- 路由重写：[vercel.json](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/017-门店端收益提现对账/vercel.json)，`/api/(.*)` → `/api/index`，其余回退至 `index.html`。
- 部署后验收：将下文命令中的 `http://localhost:3001` 替换为线上域名即可。

## 5. 模块接口清单

### 5.1 收款账户（[api/routes/bankAccount.ts](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/017-门店端收益提现对账/api/routes/bankAccount.ts)）
| 方法 | 路径 | 用途 |
|------|------|------|
| GET | `/api/bank-account` | 收款账户列表（支持 page/pageSize/type/status/keyword） |
| GET | `/api/bank-account/default` | 获取默认收款账户 |
| GET | `/api/bank-account/:id` | 账户详情 |
| POST | `/api/bank-account` | 新建账户（需 accountName/bankBranch/accountNo；accountNo 需匹配 `^\d{8,30}$`） |
| PUT | `/api/bank-account/:id` | 更新账户 |
| PUT | `/api/bank-account/:id/default` | 设为默认账户 |
| DELETE | `/api/bank-account/:id` | 删除账户 |

### 5.2 提现审核（[api/routes/withdraw.ts](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/017-门店端收益提现对账/api/routes/withdraw.ts)）
| 方法 | 路径 | 用途 |
|------|------|------|
| GET | `/api/withdraw/stats` | 提现统计（含 `processingCount` 待审核/处理中计数） |
| GET | `/api/withdraw/list` | 提现记录列表（支持 startDate/endDate/status/page/pageSize） |
| POST | `/api/withdraw/submit` | 提交提现申请（进入 `pending` 待审核） |
| GET | `/api/withdraw/export` | 导出提现记录 Excel |

提现状态机：`pending`（待处理/待审核）→ `processing`（处理中）→ `success`/`failed`；另有 `cancelled`（已取消）。
提现规则（见 [api/data/mockWithdraw.ts](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/017-门店端收益提现对账/api/data/mockWithdraw.ts#L129-L142)）：
- 最低提现额 `1` 元（`minWithdrawAmount = 100` 分），最高 `50000` 元（`maxWithdrawAmount = 5000000` 分）。
- 手续费率 `0.001`（`fee = floor(amount * 0.001)`），`actualAmount = amount - fee`。
- 必须选择收款账户（`bankAccountId`），金额须 `> 0`。

### 5.3 导出
| 方法 | 路径 | 用途 |
|------|------|------|
| GET | `/api/revenue/export` | 导出收益明细 Excel（startDate/endDate/type/status） |
| GET | `/api/withdraw/export` | 导出提现记录 Excel（startDate/endDate/status） |

两者均返回 `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`，并通过 `Content-Disposition: attachment; filename*=UTF-8''...` 下发中文文件名。

## 6. 验收命令

> 约定：`BASE=http://localhost:3001`。Mock 统计数据在每次服务重启时随机重算，故**通过标准以结构为准**（`code:0`、状态字段匹配筛选、字段类型正确），具体数值仅作示例。

### 6.0 前置：健康检查
```bash
# 期望：HTTP 200
curl -s -o /dev/null -w "%{http_code}\n" $BASE/api/health
```

### 6.1 收款账户验收
```bash
# 1) 列表：期望 code:0，list 非空，accountNo 为数字串
curl -s "$BASE/api/bank-account?page=1&pageSize=10"

# 2) 默认账户：期望 code:0，data.isDefault=true、status=active
curl -s "$BASE/api/bank-account/default"

# 3) 详情：取列表首条 id 后查询，期望 code:0 且 id 一致
ID=$(curl -s "$BASE/api/bank-account?page=1&pageSize=1" | python3 -c 'import sys,json;print(json.load(sys.stdin)["data"]["list"][0]["id"])')
curl -s "$BASE/api/bank-account/$ID"

# 4) 新建账户：期望 code:0、message=创建成功、返回新 id
curl -s -X POST "$BASE/api/bank-account" -H 'Content-Type: application/json' \
  -d '{"accountName":"验收测试账户","bankName":"中国工商银行","bankBranch":"南京验收支行","accountNo":"6222020000999999","type":"debit","isDefault":false,"status":"active","remark":"部署验收"}'

# 5) 设为默认：期望 code:0、message=设置默认账户成功（将上一步返回的 id 替换 NEW_ID）
curl -s -X PUT "$BASE/api/bank-account/NEW_ID/default"

# 6) 更新账户：期望 code:0、message=更新成功
curl -s -X PUT "$BASE/api/bank-account/NEW_ID" -H 'Content-Type: application/json' \
  -d '{"accountName":"验收测试账户-改","bankBranch":"南京验收支行","accountNo":"6222020000888888","type":"debit","isDefault":false,"status":"active"}'

# 7) 删除账户：期望 code:0、message=删除成功
curl -s -X DELETE "$BASE/api/bank-account/NEW_ID"

# 8) 校验-账号格式非法：期望 code:-1、message=收款账号格式不正确
curl -s -X POST "$BASE/api/bank-account" -H 'Content-Type: application/json' \
  -d '{"accountName":"验收测试账户","bankBranch":"南京验收支行","accountNo":"abc"}'

# 9) 校验-缺少必要参数：期望 code:-1、message=缺少必要参数...
curl -s -X POST "$BASE/api/bank-account" -H 'Content-Type: application/json' -d '{}'
```

### 6.2 提现审核验收
```bash
# 1) 提现统计：期望 code:0，包含 recordCount/processingCount 等字段
curl -s "$BASE/api/withdraw/stats"

# 2) 待审核单据（status=pending）：期望 code:0，每条 status=pending
curl -s "$BASE/api/withdraw/list?status=pending&page=1&pageSize=10"

# 3) 处理中单据（status=processing）：期望 code:0，每条 status=processing
curl -s "$BASE/api/withdraw/list?status=processing&page=1&pageSize=10"

# 4) 审核完成单据（status=success）：期望 code:0，每条 status=success
curl -s "$BASE/api/withdraw/list?status=success&page=1&pageSize=10"

# 5) 日期范围审核：期望 code:0，applyTime 落在区间内
curl -s "$BASE/api/withdraw/list?startDate=2026-06-01&endDate=2026-06-20&page=1&pageSize=10"

# 6) 提交提现申请（合法）：期望 code:0、status=pending、fee=amount*0.001、actualAmount=amount-fee
curl -s -X POST "$BASE/api/withdraw/submit" -H 'Content-Type: application/json' \
  -d '{"amount":50000,"bankAccountId":"BA202501010001","remark":"部署验收提现"}'

# 7) 校验-未选收款账户：期望 code:-1、message=请选择收款账户
curl -s -X POST "$BASE/api/withdraw/submit" -H 'Content-Type: application/json' -d '{"amount":50000}'

# 8) 校验-低于最低提现额（1 元）：期望 code:-1、message=提现金额不能低于 1 元
curl -s -X POST "$BASE/api/withdraw/submit" -H 'Content-Type: application/json' \
  -d '{"amount":50,"bankAccountId":"BA202501010001"}'

# 9) 校验-超过最高提现额（50000 元）：期望 code:-1、message=提现金额不能高于 50000 元
curl -s -X POST "$BASE/api/withdraw/submit" -H 'Content-Type: application/json' \
  -d '{"amount":5000001,"bankAccountId":"BA202501010001"}'
```

### 6.3 导出验收
```bash
# 1) 收益明细导出：期望 200，Content-Type 为 xlsx，文件名形如 收益明细_YYYYMMDD_HHMM.xlsx
curl -s -D - -o /tmp/revenue.xlsx "$BASE/api/revenue/export?startDate=2026-05-01&endDate=2026-06-20&status=success" \
  | grep -iE 'content-type|content-disposition'
file /tmp/revenue.xlsx          # 期望：Microsoft Excel 2007+

# 2) 提现记录导出：期望 200，文件名形如 提现记录_YYYYMMDD_HHMM.xlsx
curl -s -D - -o /tmp/withdraw.xlsx "$BASE/api/withdraw/export?status=pending" \
  | grep -iE 'content-type|content-disposition'
file /tmp/withdraw.xlsx        # 期望：Microsoft Excel 2007+

# 3) 仅校验响应头与大小（不落盘）
curl -s -o /dev/null -w "type=%{content_type} size=%{size_download} code=%{http_code}\n" \
  "$BASE/api/revenue/export"
curl -s -o /dev/null -w "type=%{content_type} size=%{size_download} code=%{http_code}\n" \
  "$BASE/api/withdraw/export"
```

### 6.4 单元测试与类型验收
```bash
# 单元测试：期望 5 个测试文件、140 用例全部通过
pnpm test               # vitest run

# 类型检查：见 §8 已知限制
pnpm check              # vue-tsc -b
```

## 7. 验收通过标准汇总

| 验收项 | 通过标准 |
|--------|----------|
| 健康检查 | `GET /api/health` → `200` |
| 收款账户-列表/默认/详情 | `code:0`，字段完整，默认账户 `isDefault=true` |
| 收款账户-增/改/删/设默认 | `code:0` 且对应 `message` 正常 |
| 收款账户-参数校验 | 非法账号 `code:-1` 且 `message=收款账号格式不正确` |
| 提现审核-统计 | `code:0`，含 `recordCount`/`processingCount` |
| 提现审核-按状态筛选 | `code:0`，返回记录 `status` 与筛选值一致 |
| 提现审核-提交申请 | `code:0`，`status=pending`，`fee=amount*0.001` |
| 提现审核-校验 | 缺账户/越界金额 `code:-1` 且 `message` 正确 |
| 导出-收益/提现 | `200`，`Content-Type` 为 xlsx，`file` 命令识别为 Excel 2007+ |
| 单元测试 | `pnpm test` 全部通过（140 用例） |

## 8. 已知限制与部署前置（重要）

以下为当前仓库的既存问题，**不影响 `tsx` 运行时与 Vercel 接口能力**，但会影响全新部署的「生产构建」与「导出」可用性，上线前需处理：

1. **`xlsx` 依赖未声明**：导出服务 [api/services/revenueService.ts](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/017-门店端收益提现对账/api/services/revenueService.ts#L11) 与 [api/services/withdrawService.ts](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/017-门店端收益提现对账/api/services/withdrawService.ts#L16) `import XLSX from 'xlsx'`，但 [package.json](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/017-门店端收益提现对账/package.json) 未声明该依赖（当前仅作为游离存在于 `.pnpm` 中）。
   - 风险：全新 `pnpm install` 后 `xlsx` 不会被安装，导出接口运行时报 `Cannot find module 'xlsx'`。
   - 修复：`pnpm add xlsx`（已验证可用版本 `0.18.5`）后重新构建。

2. **`pnpm check` / `pnpm build` 类型报错**：查询类型（如 `RevenueListQuery`、`WithdrawRecordListQuery` 等）含 `[key: string]: unknown` 索引签名，与 [src/api/client.ts](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/017-门店端收益提现对账/src/api/client.ts#L6) 的 `params?: Record<string, string | number | boolean>` 不兼容，导致 `vue-tsc -b` 报 `TS2322`，进而 `pnpm build` 失败。
   - 修复建议：将 [shared/types.ts](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/017-门店端收益提现对账/shared/types.ts) 中各 `*ListQuery` 的 `[key: string]: unknown` 调整为 `[key: string]: string | number | boolean | undefined`，或将 `client.ts` 的 `params` 类型放宽以兼容 `undefined`（`buildQueryString` 已在运行时过滤 `undefined/null/''`）。

> 说明：第 6 节的 API 验收命令在「启动后端服务」即可全部通过，不依赖生产构建；上述两项仅作为生产部署前的前置整改项。

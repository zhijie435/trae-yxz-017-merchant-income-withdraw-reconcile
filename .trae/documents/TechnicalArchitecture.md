# 门店端收益提现对账 - 账户信息区 技术架构文档

## 1. 架构设计
```mermaid
flowchart TD
    subgraph Frontend["前端层"]
        F1["Vue3 + TS 页面"]
        F2["账户信息区组件"]
    end
    subgraph Backend["后端层"]
        B1["Express 路由"]
        B2["Account Service"]
        B3["Mock 数据"]
    end
    F1 --> F2 -->|HTTP GET /api/account/info| B1
    B1 --> B2 --> B3
    B3 --> B2 --> B1 -->|JSON 响应| F2
```

## 2. 技术说明
- 前端：Vue@3 + TypeScript + Vite + Tailwind CSS + vue-router
- 初始化工具：vite-init（vue-express-ts 模板）
- 后端：Express@4 + TypeScript（ESM）
- 数据：Mock 数据（前端可通过 API 获取），金额单位为「分」，前端展示时换算为「元」

## 3. 路由定义
| 路由 | 用途 |
|------|------|
| / | 账户信息区主页面 |

## 4. API 定义

### 4.1 获取账户信息
- 路径：`GET /api/account/info`
- 请求参数：无
- 响应：
```typescript
interface AccountInfo {
  code: number;        // 0 表示成功
  message: string;
  data: {
    storeName: string;        // 门店名称
    storeNo: string;          // 门店编号
    accountBalance: number;   // 账户余额（分）
    availableAmount: number;  // 可提现金额（分）
    frozenAmount: number;     // 冻结金额（分）
    totalRevenue: number;     // 累计营收（分）
    frozenReason: string;     // 冻结原因
  }
}
```

### 4.2 获取收益统计
- 路径：`GET /api/revenue/stats`
- 请求参数：无
- 响应：
```typescript
interface RevenueStats {
  code: number;
  message: string;
  data: {
    recordCount: number;     // 收益笔数
    todayRevenue: number;    // 今日收益（分）
    monthRevenue: number;    // 本月收益（分）
    totalRevenue: number;    // 总收益（分）
  }
}
```

### 4.3 获取收益明细列表
- 路径：`GET /api/revenue/list`
- 请求参数：
  - `page`: number，页码（默认 1）
  - `pageSize`: number，每页条数（默认 10）
  - `startDate`: string，开始日期（YYYY-MM-DD，可选）
  - `endDate`: string，结束日期（YYYY-MM-DD，可选）
  - `type`: string，收益类型（可选）
  - `status`: string，状态（可选）
- 响应：
```typescript
interface RevenueListResponse {
  code: number;
  message: string;
  data: {
    list: {
      id: string;
      orderNo: string;
      tradeTime: string;
      type: string;
      amount: number;
      status: 'success' | 'pending' | 'failed';
      remark: string;
    }[];
    total: number;
    page: number;
    pageSize: number;
  }
}
```

### 4.4 导出收益明细 Excel
- 路径：`GET /api/revenue/export`
- 请求参数：同列表接口（startDate、endDate、type、status）
- 响应：`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`，下载 xlsx 文件

## 5. 服务端架构图
```mermaid
flowchart LR
    R1["Router /api/account/info"] --> C1["Controller getAccountInfo"]
    C1 --> S1["Service fetchAccountInfo"]
    S1 --> D["MockData"]
    R2["Router /api/revenue/stats"] --> C2["Controller getRevenueStats"]
    C2 --> S2["Service getRevenueStats"]
    S2 --> D
    R3["Router /api/revenue/list"] --> C3["Controller getRevenueList"]
    C3 --> S3["Service getRevenueList"]
    S3 --> D
    R4["Router /api/revenue/export"] --> C4["Controller exportRevenue"]
    C4 --> S4["Service exportRevenueExcel"]
    S4 --> D
    S4 --> X["xlsx 生成器"]
    D --> S1 --> C1 --> R1
    D --> S2 --> C2 --> R2
    D --> S3 --> C3 --> R3
    D --> S4 --> X --> C4 --> R4
```

## 6. 数据模型
本项目当前使用 Mock 数据，无需持久化数据库。Mock 数据结构如下：

### 6.1 账户数据定义
```typescript
const accountInfo = {
  storeName: "南京新街口旗舰店",
  storeNo: "NJ-00128",
  accountBalance: 1286750,   // 12867.50 元
  availableAmount: 982300,   // 9823.00 元
  frozenAmount: 304450,      // 3044.50 元
  totalRevenue: 56982100,    // 569821.00 元
  frozenReason: "存在进行中的提现申请，对应金额暂时冻结"
}
```

### 6.2 收益记录数据定义
```typescript
const revenueStats = {
  recordCount: 1258,
  todayRevenue: 45600,      // 456.00 元
  monthRevenue: 1286750,    // 12867.50 元
  totalRevenue: 56982100,   // 569821.00 元
}

const revenueRecords = [
  {
    id: "RV202606200001",
    orderNo: "DD2026062088765",
    tradeTime: "2026-06-20T14:30:00.000Z",
    type: "订单收益",
    amount: 12900,          // 129.00 元
    status: "success",
    remark: "用户订单支付完成"
  }
  // ... 更多记录
]
```

## 7. 目录结构
```
017-门店端收益提现对账/
├── src/                      # 前端代码
│   ├── components/
│   │   ├── AccountInfoArea.vue      # 账户信息区组件
│   │   ├── RevenueRecordArea.vue    # 收益记录区组件
│   │   ├── MoneyStatCard.vue        # 资金统计卡片组件
│   │   ├── RevenueFilter.vue        # 收益筛选组件
│   │   └── RevenueTable.vue         # 收益列表组件
│   ├── composables/
│   │   ├── useAccountInfo.ts        # 账户信息请求逻辑
│   │   └── useRevenue.ts            # 收益记录请求逻辑
│   ├── utils/
│   │   └── format.ts                # 金额格式化工具
│   ├── views/
│   │   └── HomePage.vue
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── api/                      # 后端代码
│   ├── routes/
│   │   ├── account.ts
│   │   └── revenue.ts             # 收益相关路由
│   ├── services/
│   │   ├── accountService.ts
│   │   └── revenueService.ts      # 收益业务逻辑
│   ├── data/
│   │   ├── mockAccount.ts
│   │   └── mockRevenue.ts         # 收益 Mock 数据
│   └── server.ts
└── shared/                   # 前后端共享类型
    └── types.ts
```

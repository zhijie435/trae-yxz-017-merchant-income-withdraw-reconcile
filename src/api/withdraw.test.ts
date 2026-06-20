import { describe, it, expect, beforeEach, vi } from 'vitest'
import { withdrawApi } from './withdraw'
import type {
  BankAccount,
  WithdrawRecord,
  WithdrawForm,
  WithdrawStatsData,
  WithdrawListData,
  WithdrawListQuery,
  WithdrawSubmitResult,
} from '../../shared/types'

const mockWithdrawStats: WithdrawStatsData = {
  recordCount: 56,
  todayWithdrawAmount: 28000,
  monthWithdrawAmount: 356000,
  totalWithdrawAmount: 2856000,
  processingCount: 3,
}

const mockWithdrawList: WithdrawListData = {
  list: [
    {
      id: 'WD001',
      withdrawNo: 'WITHDRAW20240115001',
      amount: 100000,
      fee: 100,
      actualAmount: 99900,
      bankAccountId: 'BA001',
      bankAccountName: '张三',
      bankName: '中国工商银行',
      bankBranch: '杭州西湖支行',
      accountNo: '6222****1234',
      status: 'success',
      applyTime: '2024-01-15T09:00:00Z',
      processTime: '2024-01-15T10:00:00Z',
      completeTime: '2024-01-15T14:30:00Z',
      remark: '日常提现',
    },
    {
      id: 'WD002',
      withdrawNo: 'WITHDRAW20240116001',
      amount: 50000,
      fee: 50,
      actualAmount: 49950,
      bankAccountId: 'BA001',
      bankAccountName: '张三',
      bankName: '中国工商银行',
      bankBranch: '杭州西湖支行',
      accountNo: '6222****1234',
      status: 'pending',
      applyTime: '2024-01-16T09:00:00Z',
    },
  ],
  total: 2,
  page: 1,
  pageSize: 10,
}

const mockAvailableAccounts: BankAccount[] = [
  {
    id: 'BA001',
    accountName: '张三',
    bankBranch: '杭州西湖支行',
    accountNo: '62220212345678901234',
    bankName: '中国工商银行',
    type: 'debit',
    isDefault: true,
    status: 'active',
    createdAt: '2023-12-01T00:00:00Z',
  },
]

const mockWithdrawSubmitResult: WithdrawSubmitResult = {
  id: 'WD003',
  withdrawNo: 'WITHDRAW20240117001',
  amount: 80000,
  fee: 80,
  actualAmount: 79920,
  status: 'pending',
}

function createApiResponse<T>(data: T, code = 0, message = 'ok') {
  return new Response(JSON.stringify({ code, message, data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function createApiError(status: number, message: string, code?: number) {
  return new Response(JSON.stringify({ code: code ?? status, message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('withdrawApi - 提现申请相关接口', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('getStats - 获取提现统计', () => {
    it('成功获取提现统计数据', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createApiResponse(mockWithdrawStats),
      )

      const result = await withdrawApi.getStats()

      expect(result).toEqual(mockWithdrawStats)
      expect(global.fetch).toHaveBeenCalledTimes(1)
      const fetchArgs = (global.fetch as any).mock.calls[0]
      expect(fetchArgs[0]).toContain('/api/withdraw/stats')
    })

    it('服务端返回非0 code时抛出ApiError', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createApiResponse(null, 500, '统计服务异常'),
      )

      await expect(withdrawApi.getStats()).rejects.toThrow('统计服务异常')
    })

    it('HTTP 401错误时抛出异常', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createApiError(401, '未授权'),
      )

      await expect(withdrawApi.getStats()).rejects.toThrow('未授权')
    })

    it('网络异常时抛出网络错误', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network Error'))

      await expect(withdrawApi.getStats()).rejects.toThrow('网络错误')
    })
  })

  describe('getList - 获取提现记录列表（筛选）', () => {
    it('不带筛选参数查询列表', async () => {
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        expect(url).toContain('/api/withdraw/list')
        return Promise.resolve(createApiResponse(mockWithdrawList))
      })

      const query: WithdrawListQuery = { page: 1, pageSize: 10 }
      const result = await withdrawApi.getList(query)

      expect(result).toEqual(mockWithdrawList)
    })

    it('带日期范围筛选参数', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createApiResponse(mockWithdrawList))
      })

      await withdrawApi.getList({
        page: 1,
        pageSize: 10,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      })

      expect(capturedUrl).toContain('startDate=2024-01-01')
      expect(capturedUrl).toContain('endDate=2024-01-31')
    })

    it('带状态筛选（待处理 pending）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createApiResponse(mockWithdrawList))
      })

      await withdrawApi.getList({
        page: 1,
        pageSize: 10,
        status: 'pending',
      })

      expect(capturedUrl).toContain('status=pending')
    })

    it('带状态筛选（处理中 processing）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createApiResponse(mockWithdrawList))
      })

      await withdrawApi.getList({
        page: 1,
        pageSize: 10,
        status: 'processing',
      })

      expect(capturedUrl).toContain('status=processing')
    })

    it('带状态筛选（成功 success）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createApiResponse(mockWithdrawList))
      })

      await withdrawApi.getList({
        page: 1,
        pageSize: 10,
        status: 'success',
      })

      expect(capturedUrl).toContain('status=success')
    })

    it('带状态筛选（失败 failed）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createApiResponse(mockWithdrawList))
      })

      await withdrawApi.getList({
        page: 1,
        pageSize: 10,
        status: 'failed',
      })

      expect(capturedUrl).toContain('status=failed')
    })

    it('带状态筛选（已取消 cancelled）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createApiResponse(mockWithdrawList))
      })

      await withdrawApi.getList({
        page: 1,
        pageSize: 10,
        status: 'cancelled',
      })

      expect(capturedUrl).toContain('status=cancelled')
    })

    it('分页参数正确传递', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createApiResponse(mockWithdrawList))
      })

      await withdrawApi.getList({ page: 3, pageSize: 25 })

      expect(capturedUrl).toContain('page=3')
      expect(capturedUrl).toContain('pageSize=25')
    })

    it('组合条件筛选（日期+状态+分页）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createApiResponse(mockWithdrawList))
      })

      await withdrawApi.getList({
        page: 2,
        pageSize: 15,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        status: 'success',
      })

      expect(capturedUrl).toContain('page=2')
      expect(capturedUrl).toContain('pageSize=15')
      expect(capturedUrl).toContain('startDate=2024-01-01')
      expect(capturedUrl).toContain('endDate=2024-01-31')
      expect(capturedUrl).toContain('status=success')
    })

    it('服务端错误时抛出异常', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createApiResponse(null, 400, '查询参数错误'),
      )

      await expect(
        withdrawApi.getList({ page: 1, pageSize: 10 }),
      ).rejects.toThrow('查询参数错误')
    })
  })

  describe('getAvailableAmount - 获取可提现金额', () => {
    it('成功获取可提现金额', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createApiResponse({ availableAmount: 1256800 }),
      )

      const result = await withdrawApi.getAvailableAmount()

      expect(result).toEqual({ availableAmount: 1256800 })
      const fetchArgs = (global.fetch as any).mock.calls[0]
      expect(fetchArgs[0]).toContain('/api/withdraw/available-amount')
    })

    it('服务端返回0可提现金额', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createApiResponse({ availableAmount: 0 }),
      )

      const result = await withdrawApi.getAvailableAmount()

      expect(result.availableAmount).toBe(0)
    })

    it('账户冻结时服务端返回错误', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createApiResponse(null, 403, '账户已冻结，无法提现'),
      )

      await expect(withdrawApi.getAvailableAmount()).rejects.toThrow('账户已冻结，无法提现')
    })
  })

  describe('getAvailableAccounts - 获取可用银行账户', () => {
    it('成功获取可用银行账户列表', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createApiResponse(mockAvailableAccounts),
      )

      const result = await withdrawApi.getAvailableAccounts()

      expect(result).toEqual(mockAvailableAccounts)
      expect(result.length).toBe(1)
      expect(result[0].isDefault).toBe(true)
      const fetchArgs = (global.fetch as any).mock.calls[0]
      expect(fetchArgs[0]).toContain('/api/withdraw/available-accounts')
    })

    it('返回空列表时处理正确', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createApiResponse([] as BankAccount[]),
      )

      const result = await withdrawApi.getAvailableAccounts()

      expect(result).toEqual([])
      expect(result.length).toBe(0)
    })

    it('无可用账户时返回错误', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createApiResponse(null, 404, '暂无可用收款账户'),
      )

      await expect(withdrawApi.getAvailableAccounts()).rejects.toThrow('暂无可用收款账户')
    })
  })

  describe('create - 提交提现申请', () => {
    it('成功提交提现申请', async () => {
      vi.spyOn(global, 'fetch').mockImplementationOnce((_url, options) => {
        const body = JSON.parse((options as RequestInit).body as string)
        expect(body.amount).toBe(80000)
        expect(body.bankAccountId).toBe('BA001')
        expect(body.remark).toBe('春节前提现')
        return Promise.resolve(createApiResponse(mockWithdrawSubmitResult))
      })

      const form: WithdrawForm = {
        amount: 80000,
        bankAccountId: 'BA001',
        remark: '春节前提现',
      }
      const result = await withdrawApi.create(form)

      expect(result).toEqual(mockWithdrawSubmitResult)
      expect(result.status).toBe('pending')
      expect(result.withdrawNo).toBe('WITHDRAW20240117001')
      const fetchArgs = (global.fetch as any).mock.calls[0]
      expect(fetchArgs[0]).toContain('/api/withdraw')
      expect(fetchArgs[1].method).toBe('POST')
      expect(fetchArgs[1].headers['Content-Type']).toBe('application/json')
    })

    it('提交最小金额提现', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createApiResponse({
          id: 'WD004',
          withdrawNo: 'WITHDRAW20240117002',
          amount: 100,
          fee: 1,
          actualAmount: 99,
          status: 'pending',
        } as WithdrawSubmitResult),
      )

      const form: WithdrawForm = {
        amount: 100,
        bankAccountId: 'BA001',
      }
      const result = await withdrawApi.create(form)

      expect(result.amount).toBe(100)
      expect(result.actualAmount).toBe(99)
    })

    it('提交大额提现申请', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createApiResponse({
          id: 'WD005',
          withdrawNo: 'WITHDRAW20240117003',
          amount: 5000000,
          fee: 5000,
          actualAmount: 4995000,
          status: 'pending',
        } as WithdrawSubmitResult),
      )

      const form: WithdrawForm = {
        amount: 5000000,
        bankAccountId: 'BA001',
      }
      const result = await withdrawApi.create(form)

      expect(result.amount).toBe(5000000)
      expect(result.fee).toBe(5000)
    })

    it('提现金额不足时返回错误', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createApiResponse(null, 400, '可提现金额不足'),
      )

      const form: WithdrawForm = {
        amount: 99999999,
        bankAccountId: 'BA001',
      }

      await expect(withdrawApi.create(form)).rejects.toThrow('可提现金额不足')
    })

    it('银行账户不存在时返回错误', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createApiResponse(null, 404, '收款账户不存在或已停用'),
      )

      const form: WithdrawForm = {
        amount: 10000,
        bankAccountId: 'INVALID_ID',
      }

      await expect(withdrawApi.create(form)).rejects.toThrow('收款账户不存在或已停用')
    })

    it('提交无备注的提现申请', async () => {
      vi.spyOn(global, 'fetch').mockImplementationOnce((_url, options) => {
        const body = JSON.parse((options as RequestInit).body as string)
        expect(body.remark).toBeUndefined()
        return Promise.resolve(createApiResponse(mockWithdrawSubmitResult))
      })

      const form: WithdrawForm = {
        amount: 80000,
        bankAccountId: 'BA001',
      }
      await withdrawApi.create(form)
    })
  })

  describe('cancel - 取消提现申请', () => {
    it('成功取消待处理的提现申请', async () => {
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        expect(url).toContain('/api/withdraw/WD002/cancel')
        return Promise.resolve(createApiResponse(true))
      })

      const result = await withdrawApi.cancel('WD002')

      expect(result).toBe(true)
      const fetchArgs = (global.fetch as any).mock.calls[0]
      expect(fetchArgs[1].method).toBe('POST')
    })

    it('取消已处理的提现申请失败', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createApiResponse(null, 400, '当前状态不允许取消'),
      )

      await expect(withdrawApi.cancel('WD001')).rejects.toThrow('当前状态不允许取消')
    })

    it('取消不存在的提现申请', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createApiResponse(null, 404, '提现记录不存在'),
      )

      await expect(withdrawApi.cancel('INVALID_ID')).rejects.toThrow('提现记录不存在')
    })
  })

  describe('export - 导出提现记录Excel', () => {
    it('不带筛选条件导出', async () => {
      const mockBlob = new Blob(['mock excel data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        expect(url).toContain('/api/withdraw/export')
        return Promise.resolve(new Response(mockBlob, {
          status: 200,
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="withdraw_records.xlsx"',
          },
        }))
      })

      const result = await withdrawApi.export({})

      expect(result).toBeInstanceOf(Response)
      expect(result.ok).toBe(true)
    })

    it('带筛选条件导出（日期范围+状态）', async () => {
      let capturedUrl = ''
      const mockBlob = new Blob(['excel data'])
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(new Response(mockBlob, { status: 200 }))
      })

      await withdrawApi.export({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        status: 'success',
      })

      expect(capturedUrl).toContain('startDate=2024-01-01')
      expect(capturedUrl).toContain('endDate=2024-01-31')
      expect(capturedUrl).toContain('status=success')
      expect(capturedUrl).not.toContain('page=')
      expect(capturedUrl).not.toContain('pageSize=')
    })

    it('导出服务异常时抛出错误', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createApiError(500, '导出服务异常'),
      )

      await expect(withdrawApi.export({})).rejects.toThrow('导出服务异常')
    })
  })
})

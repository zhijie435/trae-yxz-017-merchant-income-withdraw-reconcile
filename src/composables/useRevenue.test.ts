import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useRevenue } from './useRevenue'
import type {
  RevenueStatsData,
  RevenueStatsResponse,
  RevenueListData,
  RevenueListResponse,
  RevenueListQuery,
} from '../../shared/types'

const mockStatsData: RevenueStatsData = {
  recordCount: 128,
  todayRevenue: 56800,
  monthRevenue: 128600,
  totalRevenue: 1568900,
}

const mockListData: RevenueListData = {
  list: [
    {
      id: 'RV001',
      orderNo: 'ORD20240101001',
      tradeTime: '2024-01-15T10:30:00Z',
      type: '订单收益',
      amount: 12800,
      status: 'success',
      remark: '订单结算',
    },
    {
      id: 'RV002',
      orderNo: 'ORD20240101002',
      tradeTime: '2024-01-15T11:00:00Z',
      type: '退款',
      amount: -5600,
      status: 'success',
      remark: '用户退款',
    },
  ],
  total: 2,
  page: 1,
  pageSize: 10,
}

function createMockResponse<T>(data: T, code = 0, message = '') {
  return new Response(JSON.stringify({ code, message, data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function createMockErrorResponse(status: number, message: string) {
  return new Response(JSON.stringify({ code: status, message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('useRevenue - 收益统计与列表', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('初始化时状态应为默认值', () => {
    const {
      stats,
      statsLoading,
      statsError,
      list,
      listLoading,
      listError,
      exporting,
    } = useRevenue()

    expect(stats.value).toBeNull()
    expect(statsLoading.value).toBe(false)
    expect(statsError.value).toBeNull()
    expect(list.value).toBeNull()
    expect(listLoading.value).toBe(false)
    expect(listError.value).toBeNull()
    expect(exporting.value).toBe(false)
  })

  describe('fetchStats - 获取收益统计', () => {
    it('成功获取收益统计数据', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse<RevenueStatsData>(mockStatsData),
      )

      const { stats, statsLoading, statsError, fetchStats } = useRevenue()

      const promise = fetchStats()
      expect(statsLoading.value).toBe(true)

      await promise

      expect(statsLoading.value).toBe(false)
      expect(statsError.value).toBeNull()
      expect(stats.value).toEqual(mockStatsData)
      expect(global.fetch).toHaveBeenCalledWith('/api/revenue/stats')
    })

    it('服务端返回非0 code时应设置错误信息', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(null, 500, '服务器内部错误'),
      )

      const { stats, statsError, fetchStats } = useRevenue()
      await fetchStats()

      expect(statsError.value).toBe('服务器内部错误')
      expect(stats.value).toBeNull()
    })

    it('服务端返回非0 code且无message时使用默认错误信息', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(null, 400, ''),
      )

      const { statsError, fetchStats } = useRevenue()
      await fetchStats()

      expect(statsError.value).toBe('获取收益统计失败')
    })

    it('网络异常时应设置网络错误信息', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network Error'))

      const { statsError, fetchStats } = useRevenue()
      await fetchStats()

      expect(statsError.value).toBe('网络异常，请稍后重试')
    })

    it('HTTP 404错误时应设置网络错误信息', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockErrorResponse(404, 'Not Found'),
      )

      const { statsError, fetchStats } = useRevenue()
      await fetchStats()

      expect(statsError.value).toBe('网络异常，请稍后重试')
    })
  })

  describe('fetchList - 收益筛选（列表查询）', () => {
    it('不带筛选条件查询列表', async () => {
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        expect(url).toContain('/api/revenue/list?')
        return Promise.resolve(createMockResponse<RevenueListData>(mockListData))
      })

      const { list, listLoading, listError, fetchList } = useRevenue()

      const query: RevenueListQuery = { page: 1, pageSize: 10 }
      const promise = fetchList(query)
      expect(listLoading.value).toBe(true)

      await promise

      expect(listLoading.value).toBe(false)
      expect(listError.value).toBeNull()
      expect(list.value).toEqual(mockListData)
    })

    it('带日期范围筛选', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createMockResponse<RevenueListData>(mockListData))
      })

      const { fetchList } = useRevenue()
      const query: RevenueListQuery = {
        page: 1,
        pageSize: 10,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      }
      await fetchList(query)

      expect(capturedUrl).toContain('startDate=2024-01-01')
      expect(capturedUrl).toContain('endDate=2024-01-31')
    })

    it('带收益类型筛选', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createMockResponse<RevenueListData>(mockListData))
      })

      const { fetchList } = useRevenue()
      const query: RevenueListQuery = {
        page: 1,
        pageSize: 10,
        type: '订单收益',
      }
      await fetchList(query)

      expect(capturedUrl).toContain('type=%E8%AE%A2%E5%8D%95%E6%94%B6%E7%9B%8A')
    })

    it('带状态筛选（成功 status=success）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createMockResponse<RevenueListData>(mockListData))
      })

      const { fetchList } = useRevenue()
      const query: RevenueListQuery = {
        page: 1,
        pageSize: 10,
        status: 'success',
      }
      await fetchList(query)

      expect(capturedUrl).toContain('status=success')
    })

    it('带状态筛选（处理中 status=pending）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createMockResponse<RevenueListData>(mockListData))
      })

      const { fetchList } = useRevenue()
      const query: RevenueListQuery = {
        page: 1,
        pageSize: 10,
        status: 'pending',
      }
      await fetchList(query)

      expect(capturedUrl).toContain('status=pending')
    })

    it('带状态筛选（失败 status=failed）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createMockResponse<RevenueListData>(mockListData))
      })

      const { fetchList } = useRevenue()
      const query: RevenueListQuery = {
        page: 1,
        pageSize: 10,
        status: 'failed',
      }
      await fetchList(query)

      expect(capturedUrl).toContain('status=failed')
    })

    it('带全部筛选条件组合（日期+类型+状态+分页）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createMockResponse<RevenueListData>(mockListData))
      })

      const { fetchList } = useRevenue()
      const query: RevenueListQuery = {
        page: 2,
        pageSize: 20,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        type: '补贴',
        status: 'success',
      }
      await fetchList(query)

      expect(capturedUrl).toContain('page=2')
      expect(capturedUrl).toContain('pageSize=20')
      expect(capturedUrl).toContain('startDate=2024-01-01')
      expect(capturedUrl).toContain('endDate=2024-01-31')
      expect(capturedUrl).toContain('type=%E8%A1%A5%E8%B4%B4')
      expect(capturedUrl).toContain('status=success')
    })

    it('分页参数正确传递', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createMockResponse<RevenueListData>(mockListData))
      })

      const { fetchList } = useRevenue()
      const query: RevenueListQuery = { page: 5, pageSize: 50 }
      await fetchList(query)

      expect(capturedUrl).toContain('page=5')
      expect(capturedUrl).toContain('pageSize=50')
    })

    it('服务端返回非0 code时设置错误信息', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(null, 400, '参数错误'),
      )

      const { list, listError, fetchList } = useRevenue()
      await fetchList({ page: 1, pageSize: 10 })

      expect(listError.value).toBe('参数错误')
      expect(list.value).toBeNull()
    })

    it('服务端返回非0 code且无message时使用默认错误', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(null, 400, ''),
      )

      const { listError, fetchList } = useRevenue()
      await fetchList({ page: 1, pageSize: 10 })

      expect(listError.value).toBe('获取收益明细失败')
    })

    it('网络异常时设置网络错误信息', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network Error'))

      const { listError, fetchList } = useRevenue()
      await fetchList({ page: 1, pageSize: 10 })

      expect(listError.value).toBe('网络异常，请稍后重试')
    })

    it('loading状态在请求完成后正确重置', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network Error'))

      const { listLoading, fetchList } = useRevenue()
      await fetchList({ page: 1, pageSize: 10 })

      expect(listLoading.value).toBe(false)
    })
  })

  describe('exportExcel - 导出收益Excel', () => {
    const mockExcelBlob = new Blob(
      ['PK\x03\x04mock-revenue-excel'],
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    )

    function createExportResponse(blob: Blob, contentDisposition?: string): Response {
      const headers = new Headers()
      if (contentDisposition) {
        headers.set('Content-Disposition', contentDisposition)
      }
      return new Response(blob, { status: 200, headers })
    }

    beforeEach(() => {
      document.body.innerHTML = ''
      vi.spyOn(window.URL, 'createObjectURL').mockImplementation(
        (blob: Blob | MediaSource) => `mock-url-${(blob as Blob).size}`,
      )
      vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {})
    })

    it('成功导出收益明细Excel', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createExportResponse(
          mockExcelBlob,
          "attachment; filename*=UTF-8''%E6%94%B6%E7%9B%8A%E6%98%8E%E7%BB%86_202401.xlsx",
        ),
      )

      const { exporting, exportExcel } = useRevenue()

      const promise = exportExcel({})
      expect(exporting.value).toBe(true)

      await promise

      expect(exporting.value).toBe(false)
      const links = document.querySelectorAll('a')
      expect(links.length).toBe(1)
    })

    it('默认文件名解析正确', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createExportResponse(mockExcelBlob),
      )

      const { exportExcel } = useRevenue()
      await exportExcel({})

      const link = document.querySelector('a') as HTMLAnchorElement
      expect(link.download).toBe('收益明细.xlsx')
    })

    it('从 Content-Disposition 解析 UTF-8 编码文件名', async () => {
      const encodedFileName = encodeURIComponent('门店收益_2024年1月.xlsx')
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createExportResponse(
          mockExcelBlob,
          `attachment; filename*=UTF-8''${encodedFileName}`,
        ),
      )

      const { exportExcel } = useRevenue()
      await exportExcel({})

      const link = document.querySelector('a') as HTMLAnchorElement
      expect(link.download).toBe('门店收益_2024年1月.xlsx')
    })

    it('无筛选条件导出时URL中不包含分页参数', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createExportResponse(mockExcelBlob))
      })

      const { exportExcel } = useRevenue()
      await exportExcel({})

      expect(capturedUrl).toContain('/api/revenue/export')
      expect(capturedUrl).not.toContain('page=')
      expect(capturedUrl).not.toContain('pageSize=')
    })

    it('带日期范围导出', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createExportResponse(mockExcelBlob))
      })

      const { exportExcel } = useRevenue()
      await exportExcel({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      })

      expect(capturedUrl).toContain('startDate=2024-01-01')
      expect(capturedUrl).toContain('endDate=2024-01-31')
    })

    it('带收益类型导出', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createExportResponse(mockExcelBlob))
      })

      const { exportExcel } = useRevenue()
      await exportExcel({ type: '订单收益' })

      expect(capturedUrl).toContain('type=%E8%AE%A2%E5%8D%95%E6%94%B6%E7%9B%8A')
    })

    it('带状态导出（成功success）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createExportResponse(mockExcelBlob))
      })

      const { exportExcel } = useRevenue()
      await exportExcel({ status: 'success' })

      expect(capturedUrl).toContain('status=success')
    })

    it('带状态导出（处理中pending）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createExportResponse(mockExcelBlob))
      })

      const { exportExcel } = useRevenue()
      await exportExcel({ status: 'pending' })

      expect(capturedUrl).toContain('status=pending')
    })

    it('带状态导出（失败failed）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createExportResponse(mockExcelBlob))
      })

      const { exportExcel } = useRevenue()
      await exportExcel({ status: 'failed' })

      expect(capturedUrl).toContain('status=failed')
    })

    it('全部筛选条件组合导出（日期+类型+状态）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createExportResponse(mockExcelBlob))
      })

      const { exportExcel } = useRevenue()
      const query: RevenueListQuery = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        type: '补贴',
        status: 'success',
      }
      await exportExcel(query)

      expect(capturedUrl).toContain('startDate=2024-01-01')
      expect(capturedUrl).toContain('endDate=2024-01-31')
      expect(capturedUrl).toContain('type=%E8%A1%A5%E8%B4%B4')
      expect(capturedUrl).toContain('status=success')
      expect(capturedUrl).not.toContain('page=')
      expect(capturedUrl).not.toContain('pageSize=')
    })

    it('HTTP 500错误时exporting状态正确重置', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response('Internal Server Error', { status: 500 }),
      )

      const { exporting, exportExcel } = useRevenue()

      try {
        await exportExcel({})
      } catch {
        // 预期抛出
      }

      expect(exporting.value).toBe(false)
    })

    it('网络异常时exporting状态正确重置', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network Error'))

      const { exporting, exportExcel } = useRevenue()

      try {
        await exportExcel({})
      } catch {
        // 预期抛出
      }

      expect(exporting.value).toBe(false)
    })

    it('导出时正确创建临时a标签并清理', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createExportResponse(mockExcelBlob, 'attachment; filename="cleanup_test.xlsx"'),
      )

      const { exportExcel } = useRevenue()
      await exportExcel({})

      expect(document.querySelectorAll('a').length).toBe(0)
    })

    it('导出时调用 URL.createObjectURL 和 revokeObjectURL', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createExportResponse(mockExcelBlob),
      )

      const { exportExcel } = useRevenue()
      await exportExcel({})

      expect(window.URL.createObjectURL).toHaveBeenCalled()
      expect(window.URL.revokeObjectURL).toHaveBeenCalled()
    })
  })
})

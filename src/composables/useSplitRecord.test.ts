import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSplitRecord } from './useSplitRecord'
import type {
  SplitRecordStatsData,
  SplitRecordListData,
  SplitRecordListQuery,
} from '../../shared/types'

const mockStatsData: SplitRecordStatsData = {
  recordCount: 256,
  todaySplitAmount: 12800,
  monthSplitAmount: 256800,
  totalSplitAmount: 3568900,
}

const mockListData: SplitRecordListData = {
  list: [
    {
      id: 'SP001',
      orderNo: 'ORD20240115001',
      partnerId: 'CP001',
      partnerName: '李四',
      tradeTime: '2024-01-15T10:30:00Z',
      totalAmount: 128000,
      splitRatio: 10,
      splitAmount: 12800,
      status: 'success',
      remark: '订单分账',
    },
    {
      id: 'SP002',
      orderNo: 'ORD20240115002',
      partnerId: 'CP002',
      partnerName: '王五',
      tradeTime: '2024-01-15T14:00:00Z',
      totalAmount: 256000,
      splitRatio: 15,
      splitAmount: 38400,
      status: 'pending',
      remark: '分账处理中',
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

describe('useSplitRecord - 分账记录', () => {
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
    } = useSplitRecord()

    expect(stats.value).toBeNull()
    expect(statsLoading.value).toBe(false)
    expect(statsError.value).toBeNull()
    expect(list.value).toBeNull()
    expect(listLoading.value).toBe(false)
    expect(listError.value).toBeNull()
  })

  describe('fetchStats - 获取分账统计', () => {
    it('成功获取分账统计数据', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(mockStatsData),
      )

      const { stats, statsLoading, statsError, fetchStats } = useSplitRecord()

      const promise = fetchStats()
      expect(statsLoading.value).toBe(true)

      await promise

      expect(statsLoading.value).toBe(false)
      expect(statsError.value).toBeNull()
      expect(stats.value).toEqual(mockStatsData)
      expect(global.fetch).toHaveBeenCalledWith('/api/partner/splits/stats')
    })

    it('统计数据字段值正确', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(mockStatsData),
      )

      const { stats, fetchStats } = useSplitRecord()
      await fetchStats()

      expect(stats.value!.recordCount).toBe(256)
      expect(stats.value!.todaySplitAmount).toBe(12800)
      expect(stats.value!.monthSplitAmount).toBe(256800)
      expect(stats.value!.totalSplitAmount).toBe(3568900)
    })

    it('服务端返回非0 code时设置错误信息', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(null, 500, '分账统计服务异常'),
      )

      const { stats, statsError, fetchStats } = useSplitRecord()
      await fetchStats()

      expect(statsError.value).toBe('分账统计服务异常')
      expect(stats.value).toBeNull()
    })

    it('服务端返回非0 code且无message时使用默认错误', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(null, 400, ''),
      )

      const { statsError, fetchStats } = useSplitRecord()
      await fetchStats()

      expect(statsError.value).toBe('获取分账统计失败')
    })

    it('网络异常时设置网络错误信息', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network Error'))

      const { statsError, fetchStats } = useSplitRecord()
      await fetchStats()

      expect(statsError.value).toBe('网络异常，请稍后重试')
    })

    it('HTTP错误时设置网络错误', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response('Internal Server Error', { status: 500 }),
      )

      const { statsError, fetchStats } = useSplitRecord()
      await fetchStats()

      expect(statsError.value).toBe('网络异常，请稍后重试')
    })

    it('loading状态在异常后正确重置', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network Error'))

      const { statsLoading, fetchStats } = useSplitRecord()
      await fetchStats()

      expect(statsLoading.value).toBe(false)
    })
  })

  describe('fetchList - 分账记录列表（筛选）', () => {
    it('不带筛选条件查询列表', async () => {
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        expect(url).toContain('/api/partner/splits?')
        return Promise.resolve(createMockResponse(mockListData))
      })

      const { list, listLoading, listError, fetchList } = useSplitRecord()

      const query: SplitRecordListQuery = { page: 1, pageSize: 10 }
      const promise = fetchList(query)
      expect(listLoading.value).toBe(true)

      await promise

      expect(listLoading.value).toBe(false)
      expect(listError.value).toBeNull()
      expect(list.value).toEqual(mockListData)
    })

    it('列表记录数据正确', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(mockListData),
      )

      const { list, fetchList } = useSplitRecord()
      await fetchList({ page: 1, pageSize: 10 })

      expect(list.value!.list.length).toBe(2)
      expect(list.value!.list[0].partnerId).toBe('CP001')
      expect(list.value!.list[0].partnerName).toBe('李四')
      expect(list.value!.list[0].splitRatio).toBe(10)
      expect(list.value!.list[0].splitAmount).toBe(12800)
      expect(list.value!.list[0].status).toBe('success')
      expect(list.value!.list[1].status).toBe('pending')
    })

    it('带日期范围筛选', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createMockResponse(mockListData))
      })

      const { fetchList } = useSplitRecord()
      const query: SplitRecordListQuery = {
        page: 1,
        pageSize: 10,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      }
      await fetchList(query)

      expect(capturedUrl).toContain('startDate=2024-01-01')
      expect(capturedUrl).toContain('endDate=2024-01-31')
    })

    it('带合伙人ID筛选', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createMockResponse(mockListData))
      })

      const { fetchList } = useSplitRecord()
      const query: SplitRecordListQuery = {
        page: 1,
        pageSize: 10,
        partnerId: 'CP001',
      }
      await fetchList(query)

      expect(capturedUrl).toContain('partnerId=CP001')
    })

    it('带状态筛选（成功 status=success）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createMockResponse(mockListData))
      })

      const { fetchList } = useSplitRecord()
      const query: SplitRecordListQuery = {
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
        return Promise.resolve(createMockResponse(mockListData))
      })

      const { fetchList } = useSplitRecord()
      const query: SplitRecordListQuery = {
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
        return Promise.resolve(createMockResponse(mockListData))
      })

      const { fetchList } = useSplitRecord()
      const query: SplitRecordListQuery = {
        page: 1,
        pageSize: 10,
        status: 'failed',
      }
      await fetchList(query)

      expect(capturedUrl).toContain('status=failed')
    })

    it('组合条件筛选（日期+合伙人+状态+分页）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createMockResponse(mockListData))
      })

      const { fetchList } = useSplitRecord()
      const query: SplitRecordListQuery = {
        page: 2,
        pageSize: 20,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        partnerId: 'CP001',
        status: 'success',
      }
      await fetchList(query)

      expect(capturedUrl).toContain('page=2')
      expect(capturedUrl).toContain('pageSize=20')
      expect(capturedUrl).toContain('startDate=2024-01-01')
      expect(capturedUrl).toContain('endDate=2024-01-31')
      expect(capturedUrl).toContain('partnerId=CP001')
      expect(capturedUrl).toContain('status=success')
    })

    it('分页参数正确传递', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createMockResponse(mockListData))
      })

      const { fetchList } = useSplitRecord()
      const query: SplitRecordListQuery = { page: 10, pageSize: 50 }
      await fetchList(query)

      expect(capturedUrl).toContain('page=10')
      expect(capturedUrl).toContain('pageSize=50')
    })

    it('服务端返回非0 code时设置错误信息', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(null, 400, '查询参数错误'),
      )

      const { list, listError, fetchList } = useSplitRecord()
      await fetchList({ page: 1, pageSize: 10 })

      expect(listError.value).toBe('查询参数错误')
      expect(list.value).toBeNull()
    })

    it('服务端返回非0 code且无message时使用默认错误', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(null, 400, ''),
      )

      const { listError, fetchList } = useSplitRecord()
      await fetchList({ page: 1, pageSize: 10 })

      expect(listError.value).toBe('获取分账记录列表失败')
    })

    it('网络异常时设置网络错误信息', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network Error'))

      const { listError, fetchList } = useSplitRecord()
      await fetchList({ page: 1, pageSize: 10 })

      expect(listError.value).toBe('网络异常，请稍后重试')
    })

    it('loading状态在请求异常后正确重置', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network Error'))

      const { listLoading, fetchList } = useSplitRecord()
      await fetchList({ page: 1, pageSize: 10 })

      expect(listLoading.value).toBe(false)
    })

    it('空列表数据处理正确', async () => {
      const emptyList: SplitRecordListData = {
        list: [],
        total: 0,
        page: 1,
        pageSize: 10,
      }
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(emptyList),
      )

      const { list, fetchList } = useSplitRecord()
      await fetchList({ page: 1, pageSize: 10 })

      expect(list.value!.list.length).toBe(0)
      expect(list.value!.total).toBe(0)
    })
  })
})

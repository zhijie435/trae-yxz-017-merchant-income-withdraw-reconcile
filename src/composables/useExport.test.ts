import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useExport, getFileNameFromContentDisposition } from './useExport'

describe('useExport - 导出Excel通用功能', () => {
  beforeEach(() => {
    vi.restoreAllMocks()

    document.body.innerHTML = ''

    vi.spyOn(window.URL, 'createObjectURL').mockImplementation(
      (blob: Blob | MediaSource) => `mock-url-${(blob as Blob).size}`,
    )
    vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {})
  })

  it('初始化时状态应为默认值', () => {
    const { exporting, exportError } = useExport()

    expect(exporting.value).toBe(false)
    expect(exportError.value).toBeNull()
  })

  it('使用自定义默认文件名初始化', () => {
    const { exporting, exportError, handleExport } = useExport({
      fileName: '自定义导出.xlsx',
    })

    expect(exporting.value).toBe(false)
    expect(exportError.value).toBeNull()
    expect(handleExport).toBeDefined()
  })

  describe('getFileNameFromContentDisposition - 从响应头解析文件名', () => {
    it('解析标准 Content-Disposition 文件名（带引号）', () => {
      const disposition = 'attachment; filename="revenue_2024_01.xlsx"'
      const result = getFileNameFromContentDisposition(disposition)
      expect(result).toBe('revenue_2024_01.xlsx')
    })

    it('解析无引号文件名', () => {
      const disposition = 'attachment; filename=export.xlsx'
      const result = getFileNameFromContentDisposition(disposition)
      expect(result).toBe('export.xlsx')
    })

    it('解析带单引号文件名', () => {
      const disposition = "attachment; filename='data_export.xlsx'"
      const result = getFileNameFromContentDisposition(disposition)
      expect(result).toBe('data_export.xlsx')
    })

    it('null输入返回null', () => {
      expect(getFileNameFromContentDisposition(null)).toBeNull()
    })

    it('空字符串输入返回null', () => {
      expect(getFileNameFromContentDisposition('')).toBeNull()
    })

    it('无filename属性返回null', () => {
      const disposition = 'attachment; size=12345'
      const result = getFileNameFromContentDisposition(disposition)
      expect(result).toBeNull()
    })

    it('解析复杂的文件名（含空格和特殊字符）', () => {
      const disposition = 'attachment; filename="收益明细 - 2024年1月.xlsx"'
      const result = getFileNameFromContentDisposition(disposition)
      expect(result).toBe('收益明细 - 2024年1月.xlsx')
    })
  })

  describe('handleExport - 执行导出操作', () => {
    const mockExcelBlob = new Blob(
      ['PK\x03\x04mock-excel-data'],
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    )

    function createExportResponse(
      blob: Blob,
      contentDisposition?: string,
    ): Response {
      const headers = new Headers()
      if (contentDisposition) {
        headers.set('Content-Disposition', contentDisposition)
      }
      return new Response(blob, {
        status: 200,
        headers,
      })
    }

    it('成功导出并创建下载链接', async () => {
      const mockFn = vi.fn().mockResolvedValue(
        createExportResponse(mockExcelBlob, 'attachment; filename="test_export.xlsx"'),
      )

      const { exporting, handleExport } = useExport()

      const promise = handleExport(mockFn)
      expect(exporting.value).toBe(true)

      const result = await promise

      expect(exporting.value).toBe(false)
      expect(result).toBe(true)
      expect(mockFn).toHaveBeenCalledTimes(1)

      const links = document.querySelectorAll('a')
      expect(links.length).toBe(1)
      const link = links[0] as HTMLAnchorElement
      expect(link.download).toBe('test_export.xlsx')
      expect(link.href).toContain('mock-url-')
      expect(document.body.contains(link)).toBe(false)
    })

    it('从 Content-Disposition 解析中文文件名', async () => {
      const fileName = '收益明细_2024.xlsx'
      const mockFn = vi.fn().mockResolvedValue(
        createExportResponse(mockExcelBlob, `attachment; filename="${fileName}"`),
      )

      const { handleExport } = useExport()
      await handleExport(mockFn)

      const link = document.querySelector('a') as HTMLAnchorElement
      expect(link.download).toBe(fileName)
    })

    it('无 Content-Disposition 时使用 fallback 文件名', async () => {
      const mockFn = vi.fn().mockResolvedValue(
        createExportResponse(mockExcelBlob),
      )

      const { handleExport } = useExport()
      await handleExport(mockFn, 'fallback_name.xlsx')

      const link = document.querySelector('a') as HTMLAnchorElement
      expect(link.download).toBe('fallback_name.xlsx')
    })

    it('无 Content-Disposition 且无 fallback 时使用 options 默认文件名', async () => {
      const mockFn = vi.fn().mockResolvedValue(
        createExportResponse(mockExcelBlob),
      )

      const { handleExport } = useExport({ fileName: 'default_export.xlsx' })
      await handleExport(mockFn)

      const link = document.querySelector('a') as HTMLAnchorElement
      expect(link.download).toBe('default_export.xlsx')
    })

    it('均无文件名时使用自动生成文件名', async () => {
      const mockFn = vi.fn().mockResolvedValue(
        createExportResponse(mockExcelBlob),
      )

      const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(1705449600000)

      const { handleExport } = useExport()
      await handleExport(mockFn)

      const link = document.querySelector('a') as HTMLAnchorElement
      expect(link.download).toBe('export_1705449600000.xlsx')

      dateSpy.mockRestore()
    })

    it('优先级：Content-Disposition > fallback > options.default > auto', async () => {
      const mockFn = vi.fn().mockResolvedValue(
        createExportResponse(mockExcelBlob, 'attachment; filename="from_header.xlsx"'),
      )

      const { handleExport } = useExport({ fileName: 'from_options.xlsx' })
      await handleExport(mockFn, 'from_fallback.xlsx')

      const link = document.querySelector('a') as HTMLAnchorElement
      expect(link.download).toBe('from_header.xlsx')
    })

    it('优先级验证：fallback 文件名优先于 options 中默认', async () => {
      const mockFn = vi.fn().mockResolvedValue(
        createExportResponse(mockExcelBlob),
      )

      const { handleExport } = useExport({ fileName: 'from_options.xlsx' })
      await handleExport(mockFn, 'from_fallback.xlsx')

      const link = document.querySelector('a') as HTMLAnchorElement
      expect(link.download).toBe('from_fallback.xlsx')
    })

    it('正确调用 URL.createObjectURL 和 URL.revokeObjectURL', async () => {
      const mockFn = vi.fn().mockResolvedValue(
        createExportResponse(mockExcelBlob),
      )

      const { handleExport } = useExport()
      await handleExport(mockFn, 'test.xlsx')

      expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockExcelBlob)
      expect(window.URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('导出函数抛出异常时设置错误信息并返回false', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Export API failed'))

      const { exporting, exportError, handleExport } = useExport()

      const result = await handleExport(mockFn, 'error_test.xlsx')

      expect(exporting.value).toBe(false)
      expect(result).toBe(false)
      expect(exportError.value).toBe('Export API failed')
    })

    it('导出函数抛出无message异常时使用默认错误', async () => {
      const mockFn = vi.fn().mockRejectedValue({ code: 500 })

      const { exportError, handleExport } = useExport()
      const result = await handleExport(mockFn)

      expect(result).toBe(false)
      expect(exportError.value).toBe('导出失败')
    })

    it('loading状态在异常后正确重置', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Network Error'))

      const { exporting, handleExport } = useExport()
      await handleExport(mockFn)

      expect(exporting.value).toBe(false)
    })

    it('连续多次导出时状态正确切换', async () => {
      let resolveFn: (value: Response) => void
      const mockFn = vi.fn().mockImplementation(
        () => new Promise<Response>((resolve) => {
          resolveFn = resolve
        }),
      )

      const { exporting, exportError, handleExport } = useExport()

      const promise1 = handleExport(mockFn, 'first.xlsx')
      expect(exporting.value).toBe(true)

      resolveFn!(createExportResponse(mockExcelBlob, 'attachment; filename="first.xlsx"'))
      const result1 = await promise1

      expect(result1).toBe(true)
      expect(exporting.value).toBe(false)
      expect(exportError.value).toBeNull()

      const mockFn2 = vi.fn().mockResolvedValue(
        createExportResponse(mockExcelBlob, 'attachment; filename="second.xlsx"'),
      )
      const promise2 = handleExport(mockFn2, 'second.xlsx')
      expect(exporting.value).toBe(true)

      const result2 = await promise2

      expect(result2).toBe(true)
      expect(exporting.value).toBe(false)
    })

    it('导出的 Blob 数据正确传递', async () => {
      const testData = 'test-excel-content-bytes'
      const testBlob = new Blob([testData], { type: 'application/octet-stream' })
      const mockFn = vi.fn().mockResolvedValue(
        createExportResponse(testBlob, 'attachment; filename="bytes.xlsx"'),
      )

      const { handleExport } = useExport()
      await handleExport(mockFn)

      expect(window.URL.createObjectURL).toHaveBeenCalledWith(
        expect.any(Blob),
      )
    })

    it('错误信息可以被后续成功导出清除', async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error('First error'))

      const { exportError, handleExport } = useExport()
      await handleExport(errorFn, 'fail.xlsx')

      expect(exportError.value).toBe('First error')

      const successFn = vi.fn().mockResolvedValue(
        createExportResponse(mockExcelBlob, 'attachment; filename="success.xlsx"'),
      )
      await handleExport(successFn, 'success.xlsx')

      expect(exportError.value).toBeNull()
    })
  })
})

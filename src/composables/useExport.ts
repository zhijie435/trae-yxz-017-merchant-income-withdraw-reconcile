import { ref } from 'vue'
import type { ApiError } from '../api/client'

export interface ExportOptions {
  fileName?: string
}

function getFileNameFromContentDisposition(disposition: string | null): string | null {
  if (!disposition) return null
  const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition)
  if (matches && matches[1]) {
    return matches[1].replace(/['"]/g, '')
  }
  return null
}

export function useExport(options: ExportOptions = {}) {
  const { fileName: defaultFileName } = options

  const exporting = ref(false)
  const exportError = ref<string | null>(null)

  async function handleExport(
    exportFn: () => Promise<Response>,
    fallbackFileName?: string,
  ): Promise<boolean> {
    exporting.value = true
    exportError.value = null

    try {
      const response = await exportFn()
      const blob = await response.blob()

      const disposition = response.headers.get('Content-Disposition')
      const fileName = getFileNameFromContentDisposition(disposition) ||
        fallbackFileName ||
        defaultFileName ||
        `export_${Date.now()}.xlsx`

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return true
    } catch (err) {
      exportError.value = (err as ApiError).message || '导出失败'
      return false
    } finally {
      exporting.value = false
    }
  }

  return {
    exporting,
    exportError,
    handleExport,
  }
}

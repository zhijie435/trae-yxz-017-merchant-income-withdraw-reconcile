import type { ApiResponse } from '../../shared/types'

export interface FetchOptions extends RequestInit {
  params?: Record<string, any>
  timeout?: number
}

export class ApiError extends Error {
  status: number
  code: number
  data: any

  constructor(message: string, status: number, code: number = -1, data: any = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.data = data
  }
}

function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    searchParams.set(key, String(value))
  }
  return searchParams.toString()
}

async function request<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { params, timeout = 15000, ...fetchOptions } = options

  let fullUrl = url
  if (params && Object.keys(params).length > 0) {
    const queryString = buildQueryString(params)
    fullUrl = url.includes('?') ? `${url}&${queryString}` : `${url}?${queryString}`
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new ApiError(`请求失败 (${response.status})`, response.status)
    }

    const contentType = response.headers.get('Content-Type') || ''

    if (contentType.includes('application/json')) {
      const json = await response.json() as ApiResponse<T>
      if (json.code === 0) {
        return json.data
      } else {
        throw new ApiError(json.message || '请求失败', response.status, json.code, json.data)
      }
    } else {
      return response as unknown as T
    }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof ApiError) {
      throw error
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('请求超时，请稍后重试', 0)
    }
    throw new ApiError('网络异常，请稍后重试', 0)
  }
}

export const apiClient = {
  get<T>(url: string, params?: Record<string, any>, options?: FetchOptions): Promise<T> {
    return request<T>(url, { ...options, method: 'GET', params })
  },

  post<T>(url: string, body?: any, options?: FetchOptions): Promise<T> {
    return request<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  put<T>(url: string, body?: any, options?: FetchOptions): Promise<T> {
    return request<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  delete<T>(url: string, options?: FetchOptions): Promise<T> {
    return request<T>(url, { ...options, method: 'DELETE' })
  },

  async download(url: string, params?: Record<string, any>, defaultFileName: string = 'download.xlsx'): Promise<void> {
    let fullUrl = url
    if (params && Object.keys(params).length > 0) {
      const queryString = buildQueryString(params)
      fullUrl = url.includes('?') ? `${url}&${queryString}` : `${url}?${queryString}`
    }

    const res = await fetch(fullUrl)
    if (!res.ok) throw new ApiError(`下载失败 (${res.status})`, res.status)

    const blob = await res.blob()
    const disposition = res.headers.get('Content-Disposition') || ''
    let fileName = defaultFileName
    const match = disposition.match(/filename\*=UTF-8''(.+)/)
    if (match) fileName = decodeURIComponent(match[1])

    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(objectUrl)
  },
}

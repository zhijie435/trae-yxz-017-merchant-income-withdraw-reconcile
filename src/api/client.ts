export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
  params?: Record<string, string | number | boolean>
}

export class ApiError extends Error {
  code: number
  data: unknown

  constructor(message: string, code: number = -1, data: unknown = null) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.data = data
  }
}

function buildQueryString(params: Record<string, string | number | boolean>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 15000,
    params,
  } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const fullUrl = params ? `${url}${buildQueryString(params)}` : url

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
      signal: controller.signal,
    }

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    const response = await fetch(fullUrl, config)
    clearTimeout(timeoutId)

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP Error: ${response.status}`,
        data.code || response.status,
        data.data,
      )
    }

    if (data.code !== undefined && data.code !== 0) {
      throw new ApiError(
        data.message || '请求失败',
        data.code,
        data.data,
      )
    }

    return (data.data !== undefined ? data.data : data) as T
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof ApiError) {
      throw error
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('请求超时', -1)
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络错误',
      -1,
    )
  }
}

async function download(url: string, options: RequestOptions = {}): Promise<Response> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 30000,
    params,
  } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const fullUrl = params ? `${url}${buildQueryString(params)}` : url

    const requestHeaders: Record<string, string> = {
      ...headers,
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
      signal: controller.signal,
    }

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    const response = await fetch(fullUrl, config)
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || `HTTP Error: ${response.status}`,
        errorData.code || response.status,
      )
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof ApiError) {
      throw error
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('请求超时', -1)
    }
    throw new ApiError(
      error instanceof Error ? error.message : '网络错误',
      -1,
    )
  }
}

export const apiClient = {
  get: <T>(url: string, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(url, { ...options, method: 'POST', body }),
  put: <T>(url: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(url, { ...options, method: 'PUT', body }),
  delete: <T>(url: string, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(url, { ...options, method: 'DELETE' }),
  download,
}

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBankAccount } from './useBankAccount'
import type {
  BankAccount,
  BankAccountForm,
  BankAccountListData,
  BankAccountListQuery,
} from '../../shared/types'

const mockBankAccountList: BankAccountListData = {
  list: [
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
    {
      id: 'BA002',
      accountName: '张三',
      bankBranch: '杭州钱江支行',
      accountNo: '62284812345678905678',
      bankName: '中国农业银行',
      type: 'debit',
      isDefault: false,
      status: 'active',
      createdAt: '2023-12-15T00:00:00Z',
    },
    {
      id: 'BA003',
      accountName: '张三',
      bankBranch: '杭州滨江支行',
      accountNo: '62270012345678909999',
      bankName: '中国建设银行',
      type: 'public',
      isDefault: false,
      status: 'inactive',
      createdAt: '2024-01-01T00:00:00Z',
    },
  ],
  total: 3,
  page: 1,
  pageSize: 10,
}

const mockDefaultAccount: BankAccount = {
  id: 'BA001',
  accountName: '张三',
  bankBranch: '杭州西湖支行',
  accountNo: '62220212345678901234',
  bankName: '中国工商银行',
  type: 'debit',
  isDefault: true,
  status: 'active',
  createdAt: '2023-12-01T00:00:00Z',
}

function createMockResponse<T>(data: T, code = 0, message = '') {
  return new Response(JSON.stringify({ code, message, data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('useBankAccount - 收款账户管理（勾选默认账户）', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('初始化时状态应为默认值', () => {
    const {
      list,
      listLoading,
      listError,
      detail,
      detailLoading,
      detailError,
      defaultAccount,
      submitting,
      submitError,
      deleting,
      settingDefault,
    } = useBankAccount()

    expect(list.value).toBeNull()
    expect(listLoading.value).toBe(false)
    expect(listError.value).toBeNull()
    expect(detail.value).toBeNull()
    expect(detailLoading.value).toBe(false)
    expect(detailError.value).toBeNull()
    expect(defaultAccount.value).toBeNull()
    expect(submitting.value).toBe(false)
    expect(submitError.value).toBeNull()
    expect(deleting.value).toBe(false)
    expect(settingDefault.value).toBe(false)
  })

  describe('fetchList - 账户列表筛选', () => {
    it('无筛选条件查询账户列表', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(mockBankAccountList),
      )

      const { list, fetchList } = useBankAccount()
      await fetchList({ page: 1, pageSize: 10 })

      expect(list.value).toEqual(mockBankAccountList)
      expect(list.value!.list.length).toBe(3)
    })

    it('按账户类型筛选（储蓄卡 debit）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createMockResponse(mockBankAccountList))
      })

      const { fetchList } = useBankAccount()
      const query: BankAccountListQuery = {
        page: 1,
        pageSize: 10,
        type: 'debit',
      }
      await fetchList(query)

      expect(capturedUrl).toContain('type=debit')
    })

    it('按账户类型筛选（信用卡 credit）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createMockResponse(mockBankAccountList))
      })

      const { fetchList } = useBankAccount()
      await fetchList({ page: 1, pageSize: 10, type: 'credit' })

      expect(capturedUrl).toContain('type=credit')
    })

    it('按账户类型筛选（对公账户 public）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createMockResponse(mockBankAccountList))
      })

      const { fetchList } = useBankAccount()
      await fetchList({ page: 1, pageSize: 10, type: 'public' })

      expect(capturedUrl).toContain('type=public')
    })

    it('按状态筛选（已启用 active）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createMockResponse(mockBankAccountList))
      })

      const { fetchList } = useBankAccount()
      await fetchList({ page: 1, pageSize: 10, status: 'active' })

      expect(capturedUrl).toContain('status=active')
    })

    it('按状态筛选（已停用 inactive）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createMockResponse(mockBankAccountList))
      })

      const { fetchList } = useBankAccount()
      await fetchList({ page: 1, pageSize: 10, status: 'inactive' })

      expect(capturedUrl).toContain('status=inactive')
    })

    it('按关键字搜索（户名/卡号/支行）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createMockResponse(mockBankAccountList))
      })

      const { fetchList } = useBankAccount()
      const query: BankAccountListQuery = {
        page: 1,
        pageSize: 10,
        keyword: '工商',
      }
      await fetchList(query)

      expect(capturedUrl).toContain('keyword=%E5%B7%A5%E5%95%86')
    })

    it('组合条件筛选（类型+状态+关键字+分页）', async () => {
      let capturedUrl = ''
      vi.spyOn(global, 'fetch').mockImplementationOnce((url) => {
        capturedUrl = url as string
        return Promise.resolve(createMockResponse(mockBankAccountList))
      })

      const { fetchList } = useBankAccount()
      const query: BankAccountListQuery = {
        page: 2,
        pageSize: 20,
        type: 'debit',
        status: 'active',
        keyword: '西湖',
      }
      await fetchList(query)

      expect(capturedUrl).toContain('page=2')
      expect(capturedUrl).toContain('pageSize=20')
      expect(capturedUrl).toContain('type=debit')
      expect(capturedUrl).toContain('status=active')
      expect(capturedUrl).toContain('keyword=%E8%A5%BF%E6%B9%96')
    })

    it('列表中包含默认账户标识', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(mockBankAccountList),
      )

      const { list, fetchList } = useBankAccount()
      await fetchList({ page: 1, pageSize: 10 })

      const defaultAccount = list.value!.list.find(a => a.isDefault === true)
      expect(defaultAccount).toBeDefined()
      expect(defaultAccount!.id).toBe('BA001')

      const nonDefaultAccounts = list.value!.list.filter(a => a.isDefault === false)
      expect(nonDefaultAccounts.length).toBe(2)
    })

    it('服务端错误时设置错误信息', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(null, 500, '查询失败'),
      )

      const { listError, fetchList } = useBankAccount()
      await fetchList({ page: 1, pageSize: 10 })

      expect(listError.value).toBe('查询失败')
    })

    it('网络异常时设置默认错误信息', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network Error'))

      const { listError, fetchList } = useBankAccount()
      await fetchList({ page: 1, pageSize: 10 })

      expect(listError.value).toBe('网络异常，请稍后重试')
    })
  })

  describe('fetchDefault - 获取默认账户（勾选状态查询）', () => {
    it('成功获取默认账户', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(mockDefaultAccount),
      )

      const { defaultAccount, fetchDefault } = useBankAccount()
      await fetchDefault()

      expect(defaultAccount.value).toEqual(mockDefaultAccount)
      expect(defaultAccount.value!.isDefault).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith('/api/bank-account/default')
    })

    it('无默认账户时返回null', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(null),
      )

      const { defaultAccount, fetchDefault } = useBankAccount()
      await fetchDefault()

      expect(defaultAccount.value).toBeNull()
    })

    it('网络异常时静默处理（不设置错误）', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network Error'))

      const { defaultAccount, listError, fetchDefault } = useBankAccount()
      await fetchDefault()

      expect(defaultAccount.value).toBeNull()
      expect(listError.value).toBeNull()
    })

    it('HTTP错误时静默处理', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response('Error', { status: 500 }),
      )

      const { defaultAccount, fetchDefault } = useBankAccount()
      await fetchDefault()

      expect(defaultAccount.value).toBeNull()
    })
  })

  describe('setDefault - 设置默认账户（勾选操作）', () => {
    it('成功勾选（设置）某账户为默认账户', async () => {
      vi.spyOn(global, 'fetch').mockImplementationOnce((url, options) => {
        expect(url).toBe('/api/bank-account/BA002/default')
        expect((options as RequestInit).method).toBe('PUT')
        return Promise.resolve(createMockResponse(true))
      })

      const { settingDefault, setDefault } = useBankAccount()

      const promise = setDefault('BA002')
      expect(settingDefault.value).toBe(true)

      const result = await promise

      expect(settingDefault.value).toBe(false)
      expect(result).toBe(true)
    })

    it('勾选默认账户成功后 code=0 时返回true', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(undefined, 0),
      )

      const { setDefault } = useBankAccount()
      const result = await setDefault('BA001')

      expect(result).toBe(true)
    })

    it('勾选失败时返回false（非0 code）', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(null, 400, '账户已停用，无法设为默认'),
      )

      const { setDefault } = useBankAccount()
      const result = await setDefault('BA003')

      expect(result).toBe(false)
    })

    it('勾选已停用账户为默认时失败', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(null, 400, '该账户已停用'),
      )

      const { setDefault } = useBankAccount()
      const result = await setDefault('BA003')

      expect(result).toBe(false)
    })

    it('网络异常时返回false', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network Error'))

      const { settingDefault, setDefault } = useBankAccount()
      const result = await setDefault('BA002')

      expect(settingDefault.value).toBe(false)
      expect(result).toBe(false)
    })

    it('HTTP 404时返回false（账户不存在）', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 404, message: '账户不存在' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      const { setDefault } = useBankAccount()
      const result = await setDefault('INVALID_ID')

      expect(result).toBe(false)
    })

    it('settingDefault状态在失败后正确重置', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network Error'))

      const { settingDefault, setDefault } = useBankAccount()
      await setDefault('BA002')

      expect(settingDefault.value).toBe(false)
    })
  })

  describe('create - 创建账户时勾选默认', () => {
    it('创建新账户时勾选设为默认', async () => {
      vi.spyOn(global, 'fetch').mockImplementationOnce((_url, options) => {
        const body = JSON.parse((options as RequestInit).body as string)
        expect(body.isDefault).toBe(true)
        expect(body.accountName).toBe('张三')
        return Promise.resolve(createMockResponse({
          id: 'BA004',
          ...body,
          status: 'active',
          createdAt: '2024-01-20T00:00:00Z',
        } as BankAccount))
      })

      const { submitting, create } = useBankAccount()

      const form: BankAccountForm = {
        accountName: '张三',
        bankBranch: '杭州余杭支行',
        accountNo: '622202999988887777',
        bankName: '招商银行',
        type: 'debit',
        isDefault: true,
        status: 'active',
      }

      const promise = create(form)
      expect(submitting.value).toBe(true)

      const result = await promise

      expect(submitting.value).toBe(false)
      expect(result).not.toBeNull()
      expect(result!.isDefault).toBe(true)
    })

    it('创建账户时不勾选默认（isDefault=false）', async () => {
      vi.spyOn(global, 'fetch').mockImplementationOnce((_url, options) => {
        const body = JSON.parse((options as RequestInit).body as string)
        expect(body.isDefault).toBe(false)
        return Promise.resolve(createMockResponse({
          id: 'BA005',
          ...body,
          status: 'active',
          createdAt: '2024-01-20T00:00:00Z',
        } as BankAccount))
      })

      const { create } = useBankAccount()
      const form: BankAccountForm = {
        accountName: '张三',
        bankBranch: '杭州下城支行',
        accountNo: '622202888899990000',
        bankName: '交通银行',
        type: 'debit',
        isDefault: false,
        status: 'active',
      }

      const result = await create(form)

      expect(result).not.toBeNull()
      expect(result!.isDefault).toBe(false)
    })

    it('创建失败时submitError设置正确', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(null, 400, '卡号格式不正确'),
      )

      const { submitError, create } = useBankAccount()
      const form: BankAccountForm = {
        accountName: '张三',
        bankBranch: '杭州支行',
        accountNo: 'invalid',
        bankName: '某银行',
        type: 'debit',
        isDefault: true,
        status: 'active',
      }

      const result = await create(form)

      expect(result).toBeNull()
      expect(submitError.value).toBe('卡号格式不正确')
    })

    it('创建时网络异常', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network Error'))

      const { submitError, submitting, create } = useBankAccount()
      const form: BankAccountForm = {
        accountName: '张三',
        bankBranch: '杭州支行',
        accountNo: '622202111122223333',
        bankName: '某银行',
        type: 'debit',
        isDefault: false,
        status: 'active',
      }

      const result = await create(form)

      expect(result).toBeNull()
      expect(submitError.value).toBe('网络异常，请稍后重试')
      expect(submitting.value).toBe(false)
    })
  })

  describe('update - 更新账户时修改默认勾选状态', () => {
    it('更新账户时修改勾选（取消默认）', async () => {
      vi.spyOn(global, 'fetch').mockImplementationOnce((url, options) => {
        const body = JSON.parse((options as RequestInit).body as string)
        expect(url).toBe('/api/bank-account/BA001')
        expect((options as RequestInit).method).toBe('PUT')
        expect(body.isDefault).toBe(false)
        return Promise.resolve(createMockResponse({
          id: 'BA001',
          ...body,
          status: 'active',
          createdAt: '2023-12-01T00:00:00Z',
        } as BankAccount))
      })

      const { update } = useBankAccount()
      const form: BankAccountForm = {
        accountName: '张三',
        bankBranch: '杭州西湖支行',
        accountNo: '62220212345678901234',
        bankName: '中国工商银行',
        type: 'debit',
        isDefault: false,
        status: 'active',
      }

      const result = await update('BA001', form)

      expect(result).not.toBeNull()
      expect(result!.isDefault).toBe(false)
    })

    it('更新账户时勾选设为默认', async () => {
      vi.spyOn(global, 'fetch').mockImplementationOnce((_url, options) => {
        const body = JSON.parse((options as RequestInit).body as string)
        expect(body.isDefault).toBe(true)
        return Promise.resolve(createMockResponse({
          id: 'BA002',
          ...body,
          status: 'active',
          createdAt: '2023-12-15T00:00:00Z',
        } as BankAccount))
      })

      const { update } = useBankAccount()
      const form: BankAccountForm = {
        accountName: '张三',
        bankBranch: '杭州钱江支行',
        accountNo: '62284812345678905678',
        bankName: '中国农业银行',
        type: 'debit',
        isDefault: true,
        status: 'active',
      }

      const result = await update('BA002', form)

      expect(result!.isDefault).toBe(true)
    })

    it('更新失败时submitError设置正确', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        createMockResponse(null, 404, '账户不存在'),
      )

      const { submitError, update } = useBankAccount()
      const form: BankAccountForm = {
        accountName: '张三',
        bankBranch: '杭州支行',
        accountNo: '6222021234567890',
        bankName: '某银行',
        type: 'debit',
        isDefault: true,
        status: 'active',
      }

      const result = await update('INVALID', form)

      expect(result).toBeNull()
      expect(submitError.value).toBe('账户不存在')
    })

    it('更新网络异常时submitError设置正确', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network Error'))

      const { submitError, update } = useBankAccount()
      const form: BankAccountForm = {
        accountName: '张三',
        bankBranch: '杭州支行',
        accountNo: '6222021234567890',
        bankName: '某银行',
        type: 'debit',
        isDefault: true,
        status: 'active',
      }

      const result = await update('BA001', form)

      expect(result).toBeNull()
      expect(submitError.value).toBe('网络异常，请稍后重试')
    })
  })
})

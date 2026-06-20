/**
 * 银行卡/收款账户 API 路由
 */
import { Router, type Request, type Response } from 'express'
import {
  getBankAccountList,
  getBankAccount,
  getDefaultBankAccount,
  createBankAccount,
  updateBankAccount,
  setDefaultBankAccount,
  deleteBankAccount,
} from '../services/bankAccountService.js'
import type {
  BankAccountListQuery,
  BankAccountForm,
} from '../../shared/types.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const query: BankAccountListQuery = {
      page: req.query.page ? Number(req.query.page) : undefined,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      type: req.query.type as string | undefined,
      status: req.query.status as string | undefined,
      keyword: req.query.keyword as string | undefined,
    }
    const data = await getBankAccountList(query)
    res.json({ code: 0, message: 'success', data })
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取收款账户列表失败', data: null })
  }
})

router.get('/default', async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await getDefaultBankAccount()
    res.json({ code: 0, message: 'success', data })
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取默认收款账户失败', data: null })
  }
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const data = await getBankAccount(id)
    if (!data) {
      res.status(404).json({ code: -1, message: '收款账户不存在', data: null })
      return
    }
    res.json({ code: 0, message: 'success', data })
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取收款账户详情失败', data: null })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const form: BankAccountForm = req.body
    if (!form.accountName || !form.bankBranch || !form.accountNo) {
      res.status(400).json({ code: -1, message: '缺少必要参数（收款名称/收款支行/收款账号）', data: null })
      return
    }
    if (!/^\d{8,30}$/.test(form.accountNo.replace(/\s+/g, ''))) {
      res.status(400).json({ code: -1, message: '收款账号格式不正确', data: null })
      return
    }
    const data = await createBankAccount(form)
    res.json({ code: 0, message: '创建成功', data })
  } catch (error) {
    res.status(500).json({ code: -1, message: '创建收款账户失败', data: null })
  }
})

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const form: BankAccountForm = req.body
    if (form.accountNo !== undefined) {
      if (!/^\d{8,30}$/.test(form.accountNo.replace(/\s+/g, ''))) {
        res.status(400).json({ code: -1, message: '收款账号格式不正确', data: null })
        return
      }
    }
    const data = await updateBankAccount(id, form)
    if (!data) {
      res.status(404).json({ code: -1, message: '收款账户不存在', data: null })
      return
    }
    res.json({ code: 0, message: '更新成功', data })
  } catch (error) {
    res.status(500).json({ code: -1, message: '更新收款账户失败', data: null })
  }
})

router.put('/:id/default', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const data = await setDefaultBankAccount(id)
    if (!data) {
      res.status(404).json({ code: -1, message: '收款账户不存在', data: null })
      return
    }
    res.json({ code: 0, message: '设置默认账户成功', data })
  } catch (error) {
    res.status(500).json({ code: -1, message: '设置默认账户失败', data: null })
  }
})

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const success = await deleteBankAccount(id)
    if (!success) {
      res.status(404).json({ code: -1, message: '收款账户不存在', data: null })
      return
    }
    res.json({ code: 0, message: '删除成功', data: null })
  } catch (error) {
    res.status(500).json({ code: -1, message: '删除收款账户失败', data: null })
  }
})

export default router

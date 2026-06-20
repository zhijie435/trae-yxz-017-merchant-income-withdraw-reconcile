/**
 * 提现 API 路由
 */
import { Router, type Request, type Response } from 'express'
import {
  getWithdrawStats,
  getWithdrawList,
  submitWithdraw,
  exportWithdrawExcel,
  getWithdrawExportFileName,
} from '../services/withdrawService.js'
import type {
  WithdrawRecordListQuery,
  WithdrawForm,
} from '../../shared/types.js'

const router = Router()

router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await getWithdrawStats()
    res.json({ code: 0, message: 'success', data })
  } catch {
    res.status(500).json({ code: -1, message: '获取提现统计失败', data: null })
  }
})

router.get('/list', async (req: Request, res: Response): Promise<void> => {
  try {
    const query: WithdrawRecordListQuery = {
      page: req.query.page ? Number(req.query.page) : undefined,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      status: req.query.status as string | undefined,
    }
    const data = await getWithdrawList(query)
    res.json({ code: 0, message: 'success', data })
  } catch {
    res.status(500).json({ code: -1, message: '获取提现记录失败', data: null })
  }
})

router.post('/submit', async (req: Request, res: Response): Promise<void> => {
  try {
    const form: WithdrawForm = req.body
    if (!form.amount || form.amount <= 0) {
      res.status(400).json({ code: -1, message: '请输入有效的提现金额', data: null })
      return
    }
    if (!form.bankAccountId) {
      res.status(400).json({ code: -1, message: '请选择收款账户', data: null })
      return
    }
    const data = await submitWithdraw(form)
    res.json({ code: 0, message: '提现申请提交成功', data })
  } catch (error) {
    const msg = error instanceof Error ? error.message : '提交提现申请失败'
    res.status(400).json({ code: -1, message: msg, data: null })
  }
})

router.get('/export', async (req: Request, res: Response): Promise<void> => {
  try {
    const query: WithdrawRecordListQuery = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      status: req.query.status as string | undefined,
    }
    const buffer = await exportWithdrawExcel(query)
    const fileName = encodeURIComponent(getWithdrawExportFileName())

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${fileName}`,
    )
    res.send(buffer)
  } catch {
    res.status(500).json({ code: -1, message: '导出提现记录失败', data: null })
  }
})

export default router

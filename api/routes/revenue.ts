/**
 * 收益记录 API 路由
 */
import { Router, type Request, type Response } from 'express'
import {
  getRevenueStats,
  getRevenueList,
  exportRevenueExcel,
  getExportFileName,
} from '../services/revenueService.js'
import type { RevenueListQuery } from '../../shared/types.js'

const router = Router()

/**
 * 获取收益统计
 * GET /api/revenue/stats
 */
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await getRevenueStats()
    res.json({ code: 0, message: 'success', data })
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取收益统计失败', data: null })
  }
})

/**
 * 获取收益明细列表
 * GET /api/revenue/list
 */
router.get('/list', async (req: Request, res: Response): Promise<void> => {
  try {
    const query: RevenueListQuery = {
      page: req.query.page ? Number(req.query.page) : undefined,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      type: req.query.type as string | undefined,
      status: req.query.status as string | undefined,
    }
    const data = await getRevenueList(query)
    res.json({ code: 0, message: 'success', data })
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取收益明细失败', data: null })
  }
})

/**
 * 导出收益明细 Excel
 * GET /api/revenue/export
 */
router.get('/export', async (req: Request, res: Response): Promise<void> => {
  try {
    const query: RevenueListQuery = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      type: req.query.type as string | undefined,
      status: req.query.status as string | undefined,
    }
    const buffer = await exportRevenueExcel(query)
    const fileName = encodeURIComponent(getExportFileName())

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${fileName}`,
    )
    res.send(buffer)
  } catch (error) {
    res.status(500).json({ code: -1, message: '导出 Excel 失败', data: null })
  }
})

export default router

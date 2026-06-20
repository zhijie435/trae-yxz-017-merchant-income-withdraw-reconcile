/**
 * 账户信息 API 路由
 */
import { Router, type Request, type Response } from 'express'
import { fetchAccountInfo } from '../services/accountService.js'

const router = Router()

/**
 * 获取账户信息
 * GET /api/account/info
 */
router.get('/info', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await fetchAccountInfo()
    res.json({
      code: 0,
      message: 'success',
      data,
    })
  } catch (error) {
    res.status(500).json({
      code: -1,
      message: '获取账户信息失败',
      data: null,
    })
  }
})

export default router

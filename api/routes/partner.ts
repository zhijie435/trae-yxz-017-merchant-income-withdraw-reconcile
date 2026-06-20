/**
 * 城市合伙人与分账记录 API 路由
 */
import { Router, type Request, type Response } from 'express'
import {
  getCityPartnerList,
  getCityPartner,
  createCityPartner,
  updateCityPartner,
  deleteCityPartner,
  getAllActivePartners,
  getSplitRecordStats,
  getSplitRecordList,
} from '../services/partnerService.js'
import type {
  CityPartnerListQuery,
  CityPartnerForm,
  SplitRecordListQuery,
} from '../../shared/types.js'

const router = Router()

router.get('/partners', async (req: Request, res: Response): Promise<void> => {
  try {
    const query: CityPartnerListQuery = {
      page: req.query.page ? Number(req.query.page) : undefined,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      city: req.query.city as string | undefined,
      status: req.query.status as string | undefined,
      keyword: req.query.keyword as string | undefined,
    }
    const data = await getCityPartnerList(query)
    res.json({ code: 0, message: 'success', data })
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取城市合伙人列表失败', data: null })
  }
})

router.get('/partners/active', async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await getAllActivePartners()
    res.json({ code: 0, message: 'success', data })
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取活跃合伙人列表失败', data: null })
  }
})

router.get('/partners/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const data = await getCityPartner(id)
    if (!data) {
      res.status(404).json({ code: -1, message: '合伙人不存在', data: null })
      return
    }
    res.json({ code: 0, message: 'success', data })
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取城市合伙人详情失败', data: null })
  }
})

router.post('/partners', async (req: Request, res: Response): Promise<void> => {
  try {
    const form: CityPartnerForm = req.body
    if (!form.name || !form.phone || !form.city || form.splitRatio === undefined) {
      res.status(400).json({ code: -1, message: '缺少必要参数', data: null })
      return
    }
    if (form.splitRatio < 0 || form.splitRatio > 100) {
      res.status(400).json({ code: -1, message: '分账比例必须在 0-100 之间', data: null })
      return
    }
    const data = await createCityPartner(form)
    res.json({ code: 0, message: '创建成功', data })
  } catch (error) {
    res.status(500).json({ code: -1, message: '创建城市合伙人失败', data: null })
  }
})

router.put('/partners/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const form: CityPartnerForm = req.body
    if (form.splitRatio !== undefined && (form.splitRatio < 0 || form.splitRatio > 100)) {
      res.status(400).json({ code: -1, message: '分账比例必须在 0-100 之间', data: null })
      return
    }
    const data = await updateCityPartner(id, form)
    if (!data) {
      res.status(404).json({ code: -1, message: '合伙人不存在', data: null })
      return
    }
    res.json({ code: 0, message: '更新成功', data })
  } catch (error) {
    res.status(500).json({ code: -1, message: '更新城市合伙人失败', data: null })
  }
})

router.delete('/partners/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const success = await deleteCityPartner(id)
    if (!success) {
      res.status(404).json({ code: -1, message: '合伙人不存在', data: null })
      return
    }
    res.json({ code: 0, message: '删除成功', data: null })
  } catch (error) {
    res.status(500).json({ code: -1, message: '删除城市合伙人失败', data: null })
  }
})

router.get('/splits/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await getSplitRecordStats()
    res.json({ code: 0, message: 'success', data })
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取分账统计失败', data: null })
  }
})

router.get('/splits', async (req: Request, res: Response): Promise<void> => {
  try {
    const query: SplitRecordListQuery = {
      page: req.query.page ? Number(req.query.page) : undefined,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      partnerId: req.query.partnerId as string | undefined,
      status: req.query.status as string | undefined,
    }
    const data = await getSplitRecordList(query)
    res.json({ code: 0, message: 'success', data })
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取分账记录列表失败', data: null })
  }
})

export default router

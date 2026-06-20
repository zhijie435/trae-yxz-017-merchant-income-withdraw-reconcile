import { ref } from 'vue'
import type { ApiError } from '../api/client'

export interface UseCrudOptions<T, F> {
  createFn?: (form: F) => Promise<T>
  updateFn?: (id: string, form: F) => Promise<T>
  deleteFn?: (id: string) => Promise<boolean>
}

export function useCrud<T, F>(options: UseCrudOptions<T, F> = {}) {
  const { createFn, updateFn, deleteFn } = options

  const submitting = ref(false)
  const submitError = ref<string | null>(null)
  const deleting = ref(false)

  async function create(form: F): Promise<T | null> {
    if (!createFn) return null
    submitting.value = true
    submitError.value = null

    try {
      const result = await createFn(form)
      return result
    } catch (err) {
      submitError.value = (err as ApiError).message || '创建失败'
      return null
    } finally {
      submitting.value = false
    }
  }

  async function update(id: string, form: F): Promise<T | null> {
    if (!updateFn) return null
    submitting.value = true
    submitError.value = null

    try {
      const result = await updateFn(id, form)
      return result
    } catch (err) {
      submitError.value = (err as ApiError).message || '更新失败'
      return null
    } finally {
      submitting.value = false
    }
  }

  async function remove(id: string): Promise<boolean> {
    if (!deleteFn) return false
    deleting.value = true

    try {
      return await deleteFn(id)
    } catch {
      return false
    } finally {
      deleting.value = false
    }
  }

  return {
    submitting,
    submitError,
    deleting,
    create,
    update,
    remove,
  }
}

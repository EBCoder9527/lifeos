import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Diary } from '../types'

interface DiaryStore {
  diaries: Diary[]
  addDiary: (data: Pick<Diary, 'date' | 'content' | 'mood' | 'tags'>) => void
  updateDiary: (id: string, data: Partial<Pick<Diary, 'content' | 'mood' | 'tags'>>) => void
  deleteDiary: (id: string) => void
}

export const useDiaryStore = create<DiaryStore>()(
  persist(
    (set) => ({
      diaries: [],
      addDiary: (data) =>
        set((state) => ({
          diaries: [
            {
              id: nanoid(),
              ...data,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            ...state.diaries,
          ],
        })),
      updateDiary: (id, data) =>
        set((state) => ({
          diaries: state.diaries.map((d) =>
            d.id === id ? { ...d, ...data, updatedAt: Date.now() } : d
          ),
        })),
      deleteDiary: (id) =>
        set((state) => ({
          diaries: state.diaries.filter((d) => d.id !== id),
        })),
    }),
    {
      name: 'dayflow_diaries',
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as DiaryStore
        if (version === 0) {
          state.diaries = state.diaries.map((d) => ({
            ...d,
            tags: (d as Diary).tags ?? [],
          }))
        }
        return state
      },
    }
  )
)

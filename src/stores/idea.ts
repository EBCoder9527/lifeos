import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Idea } from '../types'

interface IdeaStore {
  ideas: Idea[]
  addIdea: (content: string, tags?: string[]) => void
  deleteIdea: (id: string) => void
}

export const useIdeaStore = create<IdeaStore>()(
  persist(
    (set) => ({
      ideas: [],
      addIdea: (content, tags = []) =>
        set((state) => ({
          ideas: [
            { id: nanoid(), content, tags, createdAt: Date.now() },
            ...state.ideas,
          ],
        })),
      deleteIdea: (id) =>
        set((state) => ({
          ideas: state.ideas.filter((i) => i.id !== id),
        })),
    }),
    { name: 'dayflow_ideas' }
  )
)

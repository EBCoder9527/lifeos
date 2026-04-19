import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Idea, IdeaCategory } from '../types'

interface IdeaStore {
  ideas: Idea[]
  addIdea: (title: string, content: string, category: IdeaCategory, tags: string[]) => void
  updateIdea: (id: string, data: Partial<Pick<Idea, 'title' | 'content' | 'category' | 'tags'>>) => void
  deleteIdea: (id: string) => void
}

export const useIdeaStore = create<IdeaStore>()(
  persist(
    (set) => ({
      ideas: [],
      addIdea: (title, content, category, tags) =>
        set((state) => ({
          ideas: [
            {
              id: nanoid(),
              title,
              content,
              category,
              tags,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            ...state.ideas,
          ],
        })),
      updateIdea: (id, data) =>
        set((state) => ({
          ideas: state.ideas.map((i) =>
            i.id === id ? { ...i, ...data, updatedAt: Date.now() } : i
          ),
        })),
      deleteIdea: (id) =>
        set((state) => ({
          ideas: state.ideas.filter((i) => i.id !== id),
        })),
    }),
    {
      name: 'dayflow_ideas',
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as IdeaStore
        if (version === 0) {
          state.ideas = state.ideas.map((idea) => ({
            ...idea,
            title: (idea as Idea).title ?? (idea as Idea).content.slice(0, 20),
            category: (idea as Idea).category ?? ('idea' as const),
            updatedAt: (idea as Idea).updatedAt ?? (idea as Idea).createdAt,
          }))
        }
        return state
      },
    }
  )
)

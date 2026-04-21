import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Idea, IdeaCategory } from '../types'
import { normalizeTags, deduplicateTags, ensureString } from '../utils/normalize'

interface IdeaStore {
  ideas: Idea[]
  addIdea: (title: string, content: string, category: IdeaCategory, tags: string[]) => void
  updateIdea: (id: string, data: Partial<Pick<Idea, 'title' | 'content' | 'category' | 'tags'>>) => void
  deleteIdea: (id: string) => void
  /** All unique tags from all ideas (for autocomplete) */
  getAllTags: () => string[]
}

/** Ensure a single idea record has all required fields (handles old/corrupt data) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeIdea(raw: any): Idea {
  const now = Date.now()
  return {
    id: ensureString(raw?.id, nanoid()),
    title: ensureString(raw?.title, ensureString(raw?.content, '').slice(0, 20) || '无标题'),
    content: ensureString(raw?.content),
    category: (['idea', 'note', 'important'] as IdeaCategory[]).includes(raw?.category) ? raw.category : 'idea',
    tags: deduplicateTags(normalizeTags(raw?.tags)),
    createdAt: typeof raw?.createdAt === 'number' ? raw.createdAt : now,
    updatedAt: typeof raw?.updatedAt === 'number' ? raw.updatedAt : (typeof raw?.createdAt === 'number' ? raw.createdAt : now),
  }
}

export const useIdeaStore = create<IdeaStore>()(
  persist(
    (set, get) => ({
      ideas: [],
      addIdea: (title, content, category, tags) =>
        set((state) => ({
          ideas: [
            {
              id: nanoid(),
              title,
              content,
              category,
              tags: deduplicateTags(normalizeTags(tags)),
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            ...state.ideas,
          ],
        })),
      updateIdea: (id, data) =>
        set((state) => ({
          ideas: state.ideas.map((i) =>
            i.id === id
              ? {
                  ...i,
                  ...data,
                  tags: data.tags ? deduplicateTags(normalizeTags(data.tags)) : i.tags,
                  updatedAt: Date.now(),
                }
              : i
          ),
        })),
      deleteIdea: (id) =>
        set((state) => ({
          ideas: state.ideas.filter((i) => i.id !== id),
        })),
      getAllTags: () => {
        const tagSet = new Set<string>()
        get().ideas.forEach((i) => normalizeTags(i.tags).forEach((t) => tagSet.add(t)))
        return Array.from(tagSet).sort()
      },
    }),
    {
      name: 'dayflow_ideas',
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const state = persistedState as any
        if (version === 0) {
          state.ideas = Array.isArray(state.ideas) ? state.ideas.map(normalizeIdea) : []
        }
        return state as IdeaStore
      },
      // Normalize on every hydration to handle corrupt data
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.ideas = Array.isArray(state.ideas) ? state.ideas.map(normalizeIdea) : []
        }
      },
    }
  )
)

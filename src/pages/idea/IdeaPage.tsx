import { useIdeaStore } from '../../stores/idea'
import dayjs from 'dayjs'

export default function IdeaPage() {
  const { ideas } = useIdeaStore()

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">灵感</h2>
      </div>

      {ideas.length === 0 ? (
        <div className="text-center text-gray-400 dark:text-gray-600 py-20">
          <p className="text-4xl mb-3">💡</p>
          <p>还没有灵感</p>
          <p className="text-sm mt-1">记录脑中闪过的想法</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
            >
              <p className="text-sm whitespace-pre-wrap">{idea.content}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1.5 flex-wrap">
                  {idea.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-2">
                  {dayjs(idea.createdAt).format('M/D HH:mm')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

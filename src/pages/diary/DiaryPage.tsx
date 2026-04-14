import { useNavigate } from 'react-router'
import { useDiaryStore } from '../../stores/diary'
import dayjs from 'dayjs'

const moodEmoji: Record<string, string> = {
  happy: '😊',
  calm: '😌',
  sad: '😢',
  angry: '😤',
  tired: '😴',
}

export default function DiaryPage() {
  const { diaries } = useDiaryStore()
  const navigate = useNavigate()

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">我的日记</h2>
        <button
          onClick={() => navigate('/diary/new')}
          className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-full font-medium"
        >
          + 写日记
        </button>
      </div>

      {diaries.length === 0 ? (
        <div className="text-center text-gray-400 dark:text-gray-600 py-20">
          <p className="text-4xl mb-3">📔</p>
          <p>还没有日记</p>
          <p className="text-sm mt-1">记录今天的心情吧</p>
        </div>
      ) : (
        <div className="space-y-3">
          {diaries.map((diary) => (
            <button
              key={diary.id}
              onClick={() => navigate(`/diary/${diary.id}`)}
              className="w-full text-left bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                <span>{dayjs(diary.date).format('YYYY年M月D日')}</span>
                <span className="text-lg">{moodEmoji[diary.mood]}</span>
              </div>
              <p className="text-sm line-clamp-3 whitespace-pre-wrap">{diary.content}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

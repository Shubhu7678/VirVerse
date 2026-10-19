import { Link, useParams } from 'react-router-dom'
import { fetchTasks } from '../api/tasks'
import useAsync from '../hooks/useAsync'
import { LoadingBlock, ErrorBlock, EmptyState } from '../components/States'
import QuestionList from '../components/QuestionList'
import ProgressBar, { progressLabel } from '../components/ProgressBar'
import Icon, { icons } from '../components/Icon'

export default function TopicDetail() {
  const { category } = useParams()
  const { data, loading, error } = useAsync(fetchTasks, 'topic')

  if (loading) return <LoadingBlock label="Loading questions…" />
  if (error) return <ErrorBlock message={error} />

  const topic = data.categories.find((c) => c.slug === category)
  if (!topic) {
    return (
      <EmptyState title="Topic not found" text="This topic does not exist.">
        <Link to="/tasks" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          Back to topics
        </Link>
      </EmptyState>
    )
  }

  const tasks = data.tasks.filter((t) => t.category === topic.slug)
  if (topic.locked) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link to="/tasks" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
          <Icon d={icons.back} className="size-4" /> All topics
        </Link>
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-xl font-bold">{topic.name} is locked</h1>
          <p className="mt-2 text-sm text-slate-700">
            Standalone learner access includes Topic 1. Join an organization with an active VirVerse subscription to unlock the remaining question bank.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/tasks" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <Icon d={icons.back} className="size-4" /> All topics
      </Link>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{topic.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{topic.description}</p>
        </div>
        {topic.nextSlug && (
          <Link
            to={`/tasks/${topic.nextSlug}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            {topic.completed === 0 ? 'Start Learning' : 'Continue Learning'}
            <Icon d={icons.arrow} className="size-4" />
          </Link>
        )}
      </div>

      <div className="mt-4 max-w-md">
        <div className="mb-1.5 flex justify-between text-xs text-slate-600">
          <span>
            {topic.completed} of {topic.total} questions completed · {progressLabel[topic.progressState]}
          </span>
          <span className="font-semibold">{topic.percent}%</span>
        </div>
        <ProgressBar percent={topic.percent} label={`${topic.name} progress`} />
      </div>

      <div className="mt-6">
        <QuestionList
          tasks={tasks}
          topicNames={{}}
          emptyState={
            <EmptyState title="No questions yet" text="Questions for this topic are on the way. Check back soon." />
          }
        />
      </div>
    </div>
  )
}

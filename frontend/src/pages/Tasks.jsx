import { Link } from 'react-router-dom'
import { fetchTasks } from '../api/tasks'
import useAsync from '../hooks/useAsync'
import { LoadingBlock, ErrorBlock, EmptyState } from '../components/States'
import QuestionList from '../components/QuestionList'

const views = {
  all: { title: 'Practice Problems', subtitle: 'Every C question in one place, ordered by the learning roadmap.' },
  pending: { title: 'My Tasks', subtitle: 'Questions you have not completed yet.' },
  completed: { title: 'Completed Tasks', subtitle: 'Questions you have solved. Great work!' },
}

export default function Tasks({ view = 'all' }) {
  const { data, loading, error } = useAsync(fetchTasks, 'tasks')

  if (loading) return <LoadingBlock label="Loading questions…" />
  if (error) return <ErrorBlock message={error} />

  const topicNames = Object.fromEntries(data.categories.map((c) => [c.slug, c.name]))
  const tasks = data.tasks.filter((t) => view === 'all' || (view === 'completed') === (t.status === 'completed'))

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight">{views[view].title}</h1>
      <p className="mt-1 mb-5 text-sm text-slate-500">{views[view].subtitle}</p>
      <QuestionList
        tasks={tasks}
        topicNames={topicNames}
        showTopic
        fixedStatus={view === 'all' ? null : view}
        emptyState={
          <EmptyState
            title={view === 'completed' ? 'Nothing completed yet' : 'No questions here'}
            text={view === 'completed' ? 'Solve a question and it will appear here.' : 'There are no questions to show.'}
          >
            <Link to="/tasks" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              Browse topics
            </Link>
          </EmptyState>
        }
      />
    </div>
  )
}

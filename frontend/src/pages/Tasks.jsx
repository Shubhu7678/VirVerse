import { Link } from 'react-router-dom'
import { fetchTasks } from '../api/tasks'
import useAsync from '../hooks/useAsync'
import { LoadingBlock, ErrorBlock, EmptyState } from '../components/States'
import QuestionList from '../components/QuestionList'
import ProgressBar from '../components/ProgressBar'

const views = {
  all: { title: 'Practice problems' },
  pending: { title: 'My tasks', subtitle: 'Questions you have not completed yet.' },
  completed: { title: 'Completed tasks', subtitle: 'Questions you have solved.' },
}

export default function Tasks({ view = 'all', language = 'c' }) {
  const title = language === 'javascript' ? 'JavaScript' : language === 'python' ? 'Python' : 'C'
  const topicsPath = language === 'c' ? '/tasks' : `/${language}`
  const { data, loading, error } = useAsync(() => fetchTasks(language), `tasks-${language}`)

  if (loading) return <LoadingBlock label="Loading questions…" />
  if (error) return <ErrorBlock message={error} />

  const topicNames = Object.fromEntries(data.categories.map((c) => [c.slug, c.name]))
  const tasks = data.tasks.filter((t) => view === 'all' || (view === 'completed') === (t.status === 'completed'))
  const isPractice = view === 'all'
  const completed = tasks.filter((task) => task.status === 'completed').length
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0
  const subtitle = isPractice
    ? `Every ${title} question in one place, ordered by the learning roadmap.`
    : views[view].subtitle

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-fg">{views[view].title}</h2>
        <p className="mt-1 text-fg-muted">{subtitle}</p>
        {isPractice && (
          <div className="mt-5 max-w-md">
            <div className="mb-2 flex items-baseline justify-between text-sm">
              <span className="text-fg-muted tabular-nums">{completed} of {tasks.length} completed</span>
              <span className="font-medium text-fg tabular-nums">{percent}%</span>
            </div>
            <ProgressBar percent={percent} label="Practice problems completed" />
          </div>
        )}
      </section>
      <QuestionList
        tasks={tasks}
        topicNames={topicNames}
        showTopic
        fixedStatus={view === 'all' ? null : view}
        language={language}
        emptyState={
          <EmptyState
            title={view === 'completed' ? 'Nothing completed yet' : 'No questions here'}
            text={view === 'completed' ? 'Solve a question and it will appear here.' : 'There are no questions to show.'}
          >
            <Link to={topicsPath} className="text-sm font-medium text-accent-text hover:underline">
              Browse topics
            </Link>
          </EmptyState>
        }
      />
    </div>
  )
}

import { Link } from 'react-router-dom'
import { fetchTasks } from '../api/tasks'
import useAsync from '../hooks/useAsync'
import { LoadingBlock, ErrorBlock, EmptyState } from '../components/States'
import QuestionList from '../components/QuestionList'
import ProgressBar from '../components/ProgressBar'
import Icon, { icons } from '../components/Icon'
import './practice.css'

const views = {
  all: { title: 'Practice Problems', subtitle: 'Every question in one place, ordered by the learning roadmap.' },
  pending: { title: 'My Tasks', subtitle: 'Questions you have not completed yet.' },
  completed: { title: 'Completed Tasks', subtitle: 'Questions you have solved. Great work!' },
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
  const topics = new Set(tasks.map((task) => task.category)).size
  const difficulties = new Set(tasks.map((task) => task.difficulty)).size
  const subtitle = isPractice
    ? `Every ${title} question in one place, ordered by the learning roadmap.`
    : views[view].subtitle

  return (
    <div className={isPractice ? 'practice-page' : 'tasks-page'}>
      {isPractice ? (
        <section className="practice-hero">
          <div className="practice-hero-copy">
            <p className="practice-eyebrow"><span /> {title.toUpperCase()} PROGRAMMING <span className="practice-eyebrow-line" /></p>
            <h1>Practice <span>Problems</span></h1>
            <p className="practice-hero-description">{subtitle}</p>
            <div className="practice-overview">
              <div className="practice-overview-ring" style={{ '--progress': `${tasks.length ? (completed / tasks.length) * 100 : 0}%` }}>
                <span>{tasks.length ? Math.round((completed / tasks.length) * 100) : 0}%</span>
              </div>
              <div className="practice-overview-progress">
                <strong>{completed} of {tasks.length} completed</strong>
                <ProgressBar percent={tasks.length ? (completed / tasks.length) * 100 : 0} label="Practice problems completed" size="h-2" />
              </div>
              <div className="practice-overview-stats">
                <span><Icon d={icons.list} /><strong>{tasks.length}</strong><small>Questions</small></span>
                <span><Icon d={icons.globe} /><strong>{topics}</strong><small>Topics</small></span>
                <span><Icon d={icons.check} /><strong>{difficulties}</strong><small>Difficulties</small></span>
              </div>
            </div>
          </div>
          <div className="practice-hero-art" aria-hidden="true">
            <div className="practice-art-orbit" />
            <div className="practice-art-window">
              <span><i /><i /><i /></span>
              <b>&lt;/&gt;</b>
              <small>solve · learn · repeat</small>
            </div>
            <div className="practice-art-c">{language === 'javascript' ? 'JS' : language === 'python' ? 'Py' : 'C'}</div>
            <span className="practice-art-spark practice-art-spark-one">✦</span>
            <span className="practice-art-spark practice-art-spark-two">✧</span>
          </div>
        </section>
      ) : (
        <>
          <h1 className="text-2xl font-bold tracking-tight">{views[view].title}</h1>
          <p className="mt-1 mb-5 text-sm text-slate-500">{subtitle}</p>
        </>
      )}
      <QuestionList
        tasks={tasks}
        topicNames={topicNames}
        showTopic
        fixedStatus={view === 'all' ? null : view}
        variant={isPractice ? 'practice' : 'tasks'}
        language={language}
        emptyState={
          <EmptyState
            title={view === 'completed' ? 'Nothing completed yet' : 'No questions here'}
            text={view === 'completed' ? 'Solve a question and it will appear here.' : 'There are no questions to show.'}
          >
            <Link to={topicsPath} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              Browse topics
            </Link>
          </EmptyState>
        }
      />
    </div>
  )
}

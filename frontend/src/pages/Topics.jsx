import { Link } from 'react-router-dom'
import { fetchTasks } from '../api/tasks'
import useAsync from '../hooks/useAsync'
import { LoadingBlock, ErrorBlock } from '../components/States'
import TopicCard from '../components/TopicCard'
import ProgressBar from '../components/ProgressBar'
import Icon, { icons } from '../components/Icon'
import { LAST_TASK_KEY } from '../utils/lastTask'
import '../styles/topics.css'

export default function Topics({ language = 'c' }) {
  const title = language === 'javascript' ? 'JavaScript' : language === 'python' ? 'Python' : 'C'
  const prefix = language === 'c' ? '' : `/${language}`
  const { data, loading, error } = useAsync(() => fetchTasks(language), `topics-${language}`)

  if (loading) return <LoadingBlock label="Loading topics…" />
  if (error) return <ErrorBlock message={error} />

  const { categories, stats, continueTask } = data
  const last = (() => {
    try {
      return JSON.parse(localStorage.getItem(LAST_TASK_KEY))
    } catch {
      return null
    }
  })()
  const resume = last && data.tasks.find((task) => task.slug === last.slug && task.status !== 'completed')
  const nextTask = resume || continueTask
  const lockedCount = categories.filter((topic) => topic.locked).length

  return (
    <div className="topics-page">
      <section className="topics-hero">
        <div className="topics-hero-copy">
          <p className="topics-eyebrow"><span /> {title.toUpperCase()} PROGRAMMING <span className="topics-eyebrow-line" /></p>
          <h1>{title} <span>Programming</span></h1>
          <p className="topics-hero-description">
            Build a strong foundation in {title}, from the basics to advanced concepts.
          </p>
          <div className="topics-hero-progress">
            <div className="topics-progress-ring" style={{ '--progress': `${stats.percent}%` }}>
              <span>{stats.percent}%</span>
            </div>
            <div className="topics-progress-detail">
              <p>{stats.completed} of {stats.total} questions completed</p>
              <ProgressBar percent={stats.percent} label="Overall topic progress" size="h-2" />
            </div>
          </div>
        </div>

        <div className="topics-hero-art" aria-hidden="true">
          <div className="topics-art-halo" />
          <span className="topics-art-spark topics-art-spark-a">✦</span>
          <span className="topics-art-spark topics-art-spark-b">✧</span>
          <div className="topics-art-float topics-art-float-left">&lt;/&gt;</div>
          <div className="topics-art-float topics-art-float-right">&lt;/&gt;</div>
          <div className="topics-art-laptop">
            <div className="topics-art-screen">
              <span className="topics-art-window"><i /><i /><i /></span>
              <div className="topics-art-code">
                <b>{language === 'javascript' ? 'JS' : language === 'python' ? 'Py' : 'C'}</b><span><i /><i /><i /><i /></span>
              </div>
            </div>
            <div className="topics-art-base" />
          </div>
          <div className="topics-art-wave" />
        </div>

        <div className="topics-hero-action">
          {nextTask ? (
            <Link to={`${prefix}/tasks/${nextTask.slug}`} className="topics-resume">
              <span className="topics-resume-play"><Icon d={icons.arrow} className="size-3.5" /></span>
              <span>{resume ? 'Resume' : 'Continue'}: {nextTask.title}</span>
              <Icon d={icons.arrow} className="size-4" />
            </Link>
          ) : (
            <span className="topics-resume topics-resume-done">All topics complete <Icon d={icons.check} className="size-4" /></span>
          )}
          <span className="topics-last-studied"><Icon d={icons.submissions} className="size-3.5" /> Your next challenge is ready</span>
        </div>
      </section>

      <section className="topics-journey">
        <span className="topics-journey-icon" aria-hidden="true">✦</span>
        <div>
          <h2>Your learning journey</h2>
          <p>Complete topics, practice problems and track your progress.</p>
        </div>
        <div className="topics-journey-graphic" aria-hidden="true">
          <Icon d={icons.arrow} className="size-5" />
          <span /><span /><span />
        </div>
      </section>

      <section className="topics-list-section" id="all-topics">
        <div className="topics-section-heading">
          <div>
            <h2>{title} Topics</h2>
            <p>Explore all {title} programming topics below.</p>
          </div>
          <a href="#topic-grid" className="topics-view-all">View all <Icon d={icons.arrow} className="size-3.5" /></a>
        </div>
        <div className="topics-card-grid" id="topic-grid">
          {categories.map((topic, index) => (
            <TopicCard key={topic.slug} topic={topic} index={index} language={language} />
          ))}
        </div>
      </section>

      {lockedCount > 0 && (
        <aside className="topics-access-note">
          <span aria-hidden="true">♛</span>
          <p><strong>Want to unlock all topics and get full access?</strong> Join an organization with an active VirVerse subscription.</p>
          <Icon d={icons.profile} className="size-4" />
        </aside>
      )}
    </div>
  )
}

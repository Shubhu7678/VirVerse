import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchTasks } from '../api/tasks'
import useAsync from '../hooks/useAsync'
import { LoadingBlock, ErrorBlock, EmptyState } from '../components/States'
import QuestionList from '../components/QuestionList'
import ProgressBar from '../components/ProgressBar'
import Icon, { icons } from '../components/Icon'
import ConceptSection from '../components/ide/ConceptSection'
import { getConceptsForTask, getLanguageLabel } from '../data/programmingConcepts'
import './practice.css'
import './topic-detail.css'
import '../components/ide/documentation.css'

const topicTabs = [
  { id: 'questions', label: 'Questions', icon: icons.code },
  { id: 'learn', label: 'Learn & Docs', icon: icons.bookOpen },
  { id: 'details', label: 'Topic Details', icon: icons.tasks },
]

function getDifficultyLabel(topic) {
  const { easy = 0, medium = 0, hard = 0 } = topic.difficulty || {}
  if (topic.total > 0 && easy === topic.total) return topic.order === 1 ? 'Beginner' : 'Easy'
  if (hard > 0) return medium > 0 || easy > 0 ? 'All levels' : 'Advanced'
  return 'Intermediate'
}

export default function TopicDetail({ language = 'c' }) {
  const { category } = useParams()
  const prefix = language === 'c' ? '' : `/${language}`
  const { data, loading, error } = useAsync(() => fetchTasks(language), `topic-${language}`)
  const [selectedTab, setSelectedTab] = useState({ category: null, id: 'questions' })

  const topic = data?.categories.find((item) => item.slug === category)
  const tasks = useMemo(
    () => data?.tasks.filter((task) => task.category === category) || [],
    [data, category],
  )
  const concepts = useMemo(() => {
    const unique = new Map()
    tasks.forEach((task) => {
      getConceptsForTask(task).forEach((item) => {
        if (!unique.has(item.id)) unique.set(item.id, { ...item, index: unique.size + 1 })
      })
    })
    return [...unique.values()]
  }, [tasks])
  const activeTab = selectedTab.category === category ? selectedTab.id : 'questions'
  const selectTab = (id) => setSelectedTab({ category, id })

  if (loading) return <LoadingBlock label="Loading questions…" />
  if (error) return <ErrorBlock message={error} />

  if (!topic) {
    return (
      <EmptyState title="Topic not found" text="This topic does not exist.">
        <Link to={prefix || '/tasks'} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          Back to topics
        </Link>
      </EmptyState>
    )
  }

  if (topic.locked) {
    return (
      <div className="task-detail-page mx-auto max-w-3xl">
        <Link to={prefix || '/tasks'} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
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

  const completed = topic.completed || 0
  const total = topic.total || tasks.length
  const percent = topic.percent || 0
  const remaining = Math.max(total - completed, 0)
  const languageName = getLanguageLabel(language)
  const difficultyLabel = getDifficultyLabel(topic)
  const minutes = Math.max(10, total * 2)

  return (
    <div className="topic-detail-page">
      <Link to={prefix || '/tasks'} className="topic-detail-back">
        <Icon d={icons.back} className="size-4" />
        <span>All topics</span>
      </Link>

      <section className="topic-detail-hero">
        <div className="topic-detail-hero-copy">
          <p className="topic-detail-eyebrow"><span /> {languageName.toUpperCase()} LEARNING PATH</p>
          <div className="topic-detail-title-row">
            <span className={`topic-detail-language-icon is-${language}`} aria-hidden="true">{topic.icon || languageName.slice(0, 2)}</span>
            <div className="topic-detail-title-copy">
              <h1>{topic.name}</h1>
              <p>{topic.description}</p>
            </div>
          </div>
          <div className="topic-detail-tags">
            <span className="topic-detail-level"><i /> {difficultyLabel}</span>
            <span><Icon d={icons.list} className="size-3.5" /> {total} Questions</span>
            <span><Icon d={icons.submissions} className="size-3.5" /> ~{minutes} mins</span>
          </div>
        </div>

        <div className="topic-detail-hero-art" aria-hidden="true">
          <div className="topic-detail-art-orbit" />
          <div className="topic-detail-art-device">
            <div className="topic-detail-art-topbar"><i /><i /><i /><span>main.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : 'c'}</span></div>
            <code>
              <b>{language === 'python' ? 'print' : language === 'javascript' ? 'console.log' : 'printf'}</b>
              (<em>"Hello, {languageName}!"</em>)
            </code>
            <span className="topic-detail-art-code-line" />
            <span className="topic-detail-art-code-line is-short" />
          </div>
          <span className="topic-detail-art-bubble">&lt;/&gt;</span>
          <span className="topic-detail-art-spark">✦</span>
        </div>
      </section>

      <section className="topic-detail-progress" aria-label="Topic progress">
        <div className="topic-detail-progress-ring" style={{ '--progress': `${percent}%` }}>
          <span>{percent}%</span>
        </div>
        <div className="topic-detail-progress-main">
          <div className="topic-detail-progress-heading">
            <strong>Topic Progress</strong>
            <span>{completed} of {total} questions completed</span>
          </div>
          <ProgressBar percent={percent} label={`${topic.name} progress`} size="h-2" />
        </div>
        <div className="topic-detail-progress-stats">
          <div><Icon d={icons.check} /><strong>{completed}</strong><span>Solved</span></div>
          <div><Icon d={icons.code} /><strong>{remaining}</strong><span>Remaining</span></div>
          <div><Icon d={icons.list} /><strong>{total}</strong><span>Total</span></div>
        </div>
      </section>

      <nav className="topic-detail-tabs" aria-label="Topic sections">
        {topicTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? 'is-active' : ''}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            onClick={() => selectTab(tab.id)}
          >
            <Icon d={tab.icon} className="size-4" />
            {tab.label}
            {tab.id === 'questions' && <span>{total}</span>}
          </button>
        ))}
        {activeTab === 'questions' && (
          <span className="topic-detail-tab-note">Pick a challenge and keep your streak going</span>
        )}
      </nav>

      {activeTab === 'questions' && (
        <section className="topic-detail-tab-panel" aria-label="Topic questions">
          <QuestionList
            tasks={tasks}
            topicNames={{}}
            variant="tasks"
            language={language}
            pageSize={9}
            hideStatusFilter
            hideSort
            hideSummary
            featuredSlug={completed < total ? topic.nextSlug : null}
            emptyState={
              <EmptyState title="No questions yet" text="Questions for this topic are on the way. Check back soon." />
            }
          />
        </section>
      )}

      {activeTab === 'learn' && (
        <section className="topic-detail-tab-panel topic-detail-learn" aria-labelledby="topic-learn-heading">
          <div className="topic-detail-panel-heading">
            <span className="topic-detail-panel-kicker">LEARN AT YOUR PACE</span>
            <h2 id="topic-learn-heading">Concepts for {topic.name}</h2>
            <p>Short, reusable lessons connected to the questions in this topic. Examples teach the building blocks without revealing complete answers.</p>
          </div>
          {concepts.length > 0 ? (
            <div className="docs-concept-list">
              {concepts.map((concept, index) => (
                <ConceptSection
                  key={concept.id}
                  concept={{ ...concept, index: index + 1 }}
                  defaultOpen={index === 0}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="Lessons are coming soon" text={`Learning notes for ${topic.name} will be available here.`} />
          )}
        </section>
      )}

      {activeTab === 'details' && (
        <section className="topic-detail-tab-panel topic-detail-overview" aria-labelledby="topic-details-heading">
          <div className="topic-detail-panel-heading">
            <span className="topic-detail-panel-kicker">YOUR LEARNING ROADMAP</span>
            <h2 id="topic-details-heading">About {topic.name}</h2>
            <p>{topic.description}</p>
          </div>
          <div className="topic-detail-facts">
            <article><span>Level</span><strong>{difficultyLabel}</strong><small>Designed to build confidence step by step</small></article>
            <article><span>Questions</span><strong>{total}</strong><small>{completed} completed · {remaining} left to explore</small></article>
            <article><span>Estimated time</span><strong>~{minutes} min</strong><small>Take breaks whenever you need them</small></article>
          </div>
          <div className="topic-detail-roadmap">
            <h3>Start with these questions</h3>
            <ol>
              {tasks.slice(0, 5).map((task) => (
                <li key={task.id}>
                  <Link to={`${prefix}/tasks/${task.slug}`}>
                    <span>Q{String(task.questionOrder).padStart(2, '0')}</span>
                    <strong>{task.title}</strong>
                    <Icon d={icons.arrow} className="size-4" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </div>
  )
}

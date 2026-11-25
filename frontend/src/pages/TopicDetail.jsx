import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchTopicTasks } from '../api/tasks'
import useAsync from '../hooks/useAsync'
import { LoadingBlock, ErrorBlock, EmptyState } from '../components/States'
import QuestionList from '../components/QuestionList'
import ProgressBar from '../components/ProgressBar'
import Icon, { icons } from '../components/Icon'
import Card from '../components/ui/Card'
import Tabs from '../components/ui/Tabs'
import ConceptSection from '../components/ide/ConceptSection'
import { getConceptsForTask, getLanguageLabel } from '../data/programmingConcepts'
import '../components/ide/documentation.css'

function getDifficultyLabel(topic) {
  const { easy = 0, medium = 0, hard = 0 } = topic.difficulty || {}
  if (topic.total > 0 && easy === topic.total) return topic.order === 1 ? 'Beginner' : 'Easy'
  if (hard > 0) return medium > 0 || easy > 0 ? 'All levels' : 'Advanced'
  return 'Intermediate'
}

function BackLink({ to }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg">
      <Icon d={icons.back} className="size-4" /> All topics
    </Link>
  )
}

function Fact({ label, value, hint }) {
  return (
    <Card>
      <p className="text-sm text-fg-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-fg tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-fg-subtle">{hint}</p>
    </Card>
  )
}

export default function TopicDetail({ language = 'c' }) {
  const { category } = useParams()
  const prefix = language === 'c' ? '' : `/${language}`
  const { data, loading, error } = useAsync(() => fetchTopicTasks(language, category), `topic-${language}-${category}`)
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
        <Link to={prefix || '/tasks'} className="text-sm font-medium text-accent-text hover:underline">
          Back to topics
        </Link>
      </EmptyState>
    )
  }

  if (topic.locked) {
    return (
      <div className="mx-auto max-w-3xl">
        <BackLink to={prefix || '/tasks'} />
        <div className="mt-6 rounded-card border border-warn/40 bg-warn-soft p-6">
          <h2 className="text-xl font-semibold text-fg">{topic.name} is locked</h2>
          <p className="mt-2 text-sm text-fg-muted">
            The first 10 questions are free. Ask your admin to unlock this language to open the remaining topics.
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

  const tabs = [
    { value: 'questions', label: 'Questions', count: total },
    { value: 'learn', label: 'Learn & docs' },
    { value: 'details', label: 'Details' },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <BackLink to={prefix || '/tasks'} />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-2xl">
          <p className="text-sm text-fg-subtle">{languageName} · {difficultyLabel} · {total} questions · about {minutes} min</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-fg">{topic.name}</h2>
          <p className="mt-1 text-fg-muted">{topic.description}</p>
        </div>
        <div className="w-full shrink-0 lg:w-72">
          <div className="mb-2 flex items-baseline justify-between text-sm">
            <span className="text-fg-muted tabular-nums">{completed} of {total} solved</span>
            <span className="font-medium text-fg tabular-nums">{percent}%</span>
          </div>
          <ProgressBar percent={percent} label={`${topic.name} progress`} />
        </div>
      </section>

      <Tabs label="Topic sections" items={tabs} value={activeTab} onChange={selectTab} />

      {activeTab === 'questions' && (
        <section aria-label="Topic questions">
          <QuestionList
            tasks={tasks}
            topicNames={{}}
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
        <section aria-labelledby="topic-learn-heading" className="max-w-3xl">
          <h3 id="topic-learn-heading" className="text-lg font-semibold text-fg">Concepts for {topic.name}</h3>
          <p className="mt-1 mb-4 text-sm text-fg-muted">
            Short, reusable lessons connected to the questions in this topic. Examples teach the building blocks without revealing complete answers.
          </p>
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
        <section aria-labelledby="topic-details-heading" className="space-y-6">
          <h3 id="topic-details-heading" className="sr-only">About {topic.name}</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <Fact label="Level" value={difficultyLabel} hint="Builds confidence step by step" />
            <Fact label="Questions" value={total} hint={`${completed} completed · ${remaining} left`} />
            <Fact label="Estimated time" value={`~${minutes} min`} hint="Take breaks whenever you need" />
          </div>
          <div>
            <h3 className="mb-3 text-lg font-semibold text-fg">Start with these questions</h3>
            <Card padded={false} as="ol" className="divide-y divide-line overflow-hidden">
              {tasks.slice(0, 5).map((task) => (
                <li key={task.id}>
                  <Link to={`${prefix}/tasks/${task.slug}`} className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-2">
                    <span className="font-mono text-xs text-fg-subtle tabular-nums">Q{String(task.questionOrder).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1 truncate font-medium text-fg">{task.title}</span>
                    <Icon d={icons.arrow} className="size-4 text-fg-subtle" />
                  </Link>
                </li>
              ))}
            </Card>
          </div>
        </section>
      )}
    </div>
  )
}

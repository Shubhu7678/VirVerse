import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Check, ChevronDown, Copy, Lock, Search } from 'lucide-react'
import { fetchGuide, fetchGuideLesson } from '../api/guides'
import useAsync from '../hooks/useAsync'
import { LoadingBlock, ErrorBlock } from '../components/States'
import ProgressBar from '../components/ProgressBar'
import Icon, { icons } from '../components/Icon'
import { HighlightedCode } from '../components/ide/ConceptSection'
import '../components/ide/documentation.css'

const LANGUAGE = 'python'
const lessonPath = (slug) => `/python/guide/${slug}`

function groupBySection(lessons) {
  const groups = []
  for (const lesson of lessons) {
    let group = groups.find((g) => g.name === lesson.section)
    if (!group) groups.push((group = { name: lesson.section, lessons: [] }))
    group.lessons.push(lesson)
  }
  return groups
}

function Marker({ lesson }) {
  const tone = lesson.solved
    ? 'border-success bg-success-soft text-success'
    : lesson.locked ? 'border-line text-fg-subtle' : 'border-line-strong text-fg-muted'
  return (
    <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg border font-mono text-xs ${tone}`}>
      {lesson.solved ? <Check className="size-4" aria-hidden="true" /> : lesson.locked ? <Lock className="size-3.5" aria-hidden="true" /> : String(lesson.n).padStart(2, '0')}
    </span>
  )
}

function LessonRow({ lesson }) {
  const body = (
    <>
      <Marker lesson={lesson} />
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-fg">{lesson.title}</h4>
        <p className="mt-0.5 truncate text-sm text-fg-muted">{lesson.summary}</p>
      </div>
      {lesson.locked ? (
        <span className="shrink-0 text-xs text-fg-subtle">Locked</span>
      ) : (
        <span className="hidden shrink-0 text-xs text-fg-subtle sm:block">{lesson.minutes} min</span>
      )}
    </>
  )
  if (lesson.locked) {
    return <div className="flex items-center gap-4 border-b border-line px-4 py-3.5 opacity-70 last:border-b-0" aria-disabled="true">{body}</div>
  }
  return (
    <Link to={lessonPath(lesson.slug)} className="group flex items-center gap-4 border-b border-line px-4 py-3.5 transition-colors last:border-b-0 hover:bg-surface-2">
      {body}
      <Icon d={icons.arrow} className="size-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

function Section({ group, open, onToggle }) {
  const done = group.lessons.filter((l) => l.solved).length
  const allLocked = group.lessons.every((l) => l.locked)
  return (
    <section aria-label={group.name} className="overflow-hidden rounded-card border border-line bg-surface">
      <button type="button" aria-expanded={open} onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-2">
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 font-semibold text-fg">
            {allLocked && <Lock className="size-3.5 text-fg-subtle" aria-hidden="true" />}
            {group.name}
          </span>
          <span className="text-xs text-fg-subtle">{group.lessons.length} lessons · {group.lessons[0].n}–{group.lessons.at(-1).n}</span>
        </span>
        <span className="w-24 shrink-0">
          <span className="mb-1 block text-right text-xs tabular-nums text-fg-muted">{done}/{group.lessons.length}</span>
          <ProgressBar percent={Math.round((done / group.lessons.length) * 100)} label={`${group.name} progress`} />
        </span>
        <ChevronDown className={`size-4 shrink-0 text-fg-subtle transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && <div className="border-t border-line">{group.lessons.map((l) => <LessonRow key={l.slug} lesson={l} />)}</div>}
    </section>
  )
}

export function PythonGuideIndex() {
  const { data, loading, error } = useAsync(() => fetchGuide(LANGUAGE), 'guide-list')
  const [query, setQuery] = useState('')
  const [toggled, setToggled] = useState({})
  const lessons = data?.lessons

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!lessons) return []
    return q ? lessons.filter((l) => `${l.title} ${l.summary} ${l.section}`.toLowerCase().includes(q)) : lessons
  }, [lessons, query])

  if (loading) return <LoadingBlock label="Loading guide…" />
  if (error) return <ErrorBlock message={error} />

  const open = lessons.filter((l) => !l.locked)
  const solved = open.filter((l) => l.solved).length
  const percent = open.length ? Math.round((solved / open.length) * 100) : 0
  const next = open.find((l) => !l.solved) || open[0]
  const lockedCount = lessons.length - open.length
  const groups = groupBySection(filtered)
  // The section holding your next lesson starts open; searching opens every match.
  const isOpen = (g) => query.trim() !== '' || (toggled[g.name] ?? g.lessons.some((l) => l.slug === next?.slug))

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-5">
        <div>
          <p className="text-sm text-fg-subtle">Python · Beginner guide</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-fg">Learn Python from zero</h2>
          <p className="mt-1 text-fg-muted">{lessons.length} short lessons for people who have never written code. Read a lesson, check yourself, then solve the question that goes with it.</p>
        </div>
        <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-baseline justify-between text-sm">
              <span className="text-fg-muted tabular-nums">{solved} of {open.length} available lessons practised</span>
              <span className="font-medium text-fg tabular-nums">{percent}%</span>
            </div>
            <ProgressBar percent={percent} label="Guide progress" />
          </div>
          {next && (
            <Link to={lessonPath(next.slug)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-cta px-5 py-2.5 text-sm font-semibold text-cta-fg transition-colors hover:bg-cta-hover">
              {solved === 0 ? 'Start lesson 1' : solved === open.length ? 'Review lesson 1' : `Continue: lesson ${next.n}`} <Icon d={icons.arrow} className="size-4" />
            </Link>
          )}
        </div>
        {lockedCount > 0 && (
          <p className="flex items-start gap-2 rounded-card border border-line bg-surface-2 p-3 text-sm text-fg-muted">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span><strong className="font-medium text-fg">{open.length} lessons are open.</strong> The other {lockedCount} unlock together with the Python questions. Ask your admin to unlock Python.</span>
          </p>
        )}
        <label className="relative block">
          <span className="sr-only">Search lessons</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons, for example “remainder”"
            className="h-10 w-full rounded-control border border-line-strong bg-surface pl-9 pr-3 text-sm text-fg placeholder:text-fg-subtle"
          />
        </label>
      </header>

      {groups.length === 0 && <p className="text-sm text-fg-muted">No lessons match “{query}”.</p>}
      <div className="space-y-3">
        {groups.map((group) => (
          <Section key={group.name} group={group} open={isOpen(group)} onToggle={() => setToggled((t) => ({ ...t, [group.name]: !isOpen(group) }))} />
        ))}
      </div>
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked: nothing to do */
    }
  }
  return (
    <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg" aria-label="Copy code">
      {copied ? <Check className="size-3.5 text-success" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function Step({ step, index }) {
  return (
    <li className="space-y-3">
      <h3 className="flex items-center gap-3 text-lg font-semibold text-fg">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-line-strong font-mono text-xs text-fg-subtle">{index + 1}</span>
        {step.title}
      </h3>
      <p className="leading-relaxed text-fg-muted">{step.text}</p>
      <div className="overflow-hidden rounded-card border border-line bg-bg">
        <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
          <span className="font-mono text-xs text-fg-subtle">Python</span>
          <CopyButton text={step.code} />
        </div>
        <pre className="overflow-x-auto p-3 font-mono text-sm leading-6 text-fg"><HighlightedCode code={step.code} language="python" /></pre>
        <div className="grid divide-y divide-line border-t border-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {step.input !== undefined && (
            <div className="p-3">
              <p className="mb-1.5 text-xs font-medium text-fg-subtle">You type</p>
              <pre className="whitespace-pre-wrap font-mono text-sm text-fg">{step.input}</pre>
            </div>
          )}
          <div className={`p-3 ${step.input === undefined ? 'sm:col-span-2' : ''}`}>
            <p className="mb-1.5 text-xs font-medium text-fg-subtle">What you see</p>
            <pre className="whitespace-pre-wrap font-mono text-sm text-success">{step.output || '(nothing is shown yet)'}</pre>
          </div>
        </div>
      </div>
    </li>
  )
}

function QuickCheck({ check }) {
  const [picked, setPicked] = useState(null)
  const answered = picked !== null
  const correct = picked === check.answer
  return (
    <section aria-labelledby="check-heading" className="rounded-card border border-line bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">Quick check</p>
      <h3 id="check-heading" className="mt-1 font-semibold text-fg">{check.question}</h3>
      <div className="mt-4 grid gap-2" role="radiogroup" aria-labelledby="check-heading">
        {check.options.map((option, i) => {
          const chosen = picked === i
          const tone = !answered
            ? 'border-line-strong hover:bg-surface-2'
            : i === check.answer ? 'border-success bg-success-soft text-fg' : chosen ? 'border-danger bg-danger-soft text-fg' : 'border-line text-fg-muted'
          return (
            <button key={option} type="button" role="radio" aria-checked={chosen} disabled={answered && correct} onClick={() => setPicked(i)} className={`flex items-center gap-3 rounded-control border px-3.5 py-2.5 text-left text-sm transition-colors ${tone}`}>
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px]">{answered && i === check.answer ? '✓' : String.fromCharCode(65 + i)}</span>
              {option}
            </button>
          )
        })}
      </div>
      {answered && (
        <p role="status" className={`mt-3 text-sm ${correct ? 'text-success' : 'text-danger'}`}>
          {correct ? 'Correct. ' : 'Not quite. '}<span className="text-fg-muted">{check.explain}</span>
          {!correct && <button type="button" onClick={() => setPicked(null)} className="ml-2 font-medium text-accent-text hover:underline">Try again</button>}
        </p>
      )}
    </section>
  )
}

// Table of contents: titles only. The current section is open, the rest are collapsed.
function Contents({ lessons, current }) {
  const currentSection = lessons.find((l) => l.slug === current)?.section
  const [toggled, setToggled] = useState({})
  return (
    <nav aria-label="Lessons" className="space-y-1 text-sm">
      {groupBySection(lessons).map((group) => {
        const open = toggled[group.name] ?? group.name === currentSection
        return (
          <div key={group.name}>
            <button type="button" aria-expanded={open} onClick={() => setToggled((t) => ({ ...t, [group.name]: !open }))} className="flex w-full items-center justify-between rounded-control px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-fg-subtle transition-colors hover:text-fg">
              <span className="truncate">{group.name}</span>
              <ChevronDown className={`size-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {open && (
              <ul className="mb-2 space-y-0.5">
                {group.lessons.map((lesson) => (
                  <li key={lesson.slug}>
                    {lesson.locked ? (
                      <span className="flex items-center gap-2 px-2 py-1.5 text-fg-subtle" aria-disabled="true">
                        <Lock className="mx-auto size-3 w-5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{lesson.title}</span>
                      </span>
                    ) : (
                      <NavLink to={lessonPath(lesson.slug)} aria-current={lesson.slug === current ? 'page' : undefined} className={`flex items-center gap-2 rounded-control px-2 py-1.5 transition-colors ${lesson.slug === current ? 'bg-surface-2 font-medium text-fg' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'}`}>
                        <span className="w-5 shrink-0 text-center font-mono text-xs text-fg-subtle">
                          {lesson.solved ? <Check className="mx-auto size-3.5 text-success" aria-label="Practised" /> : lesson.n}
                        </span>
                        <span className="truncate">{lesson.title}</span>
                      </NavLink>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </nav>
  )
}

function LockedLesson({ lesson }) {
  return (
    <div className="mx-auto max-w-xl rounded-card border border-dashed border-line-strong p-10 text-center">
      <Lock className="mx-auto size-8 text-fg-subtle" aria-hidden="true" />
      <h2 className="mt-4 text-xl font-semibold text-fg">Lesson {lesson.n} is locked</h2>
      <p className="mt-2 text-fg-muted">“{lesson.title}” opens together with the Python questions. Ask your admin to unlock Python for you.</p>
      <Link to="/python/guide" className="mt-6 inline-block text-sm font-medium text-accent-text hover:underline">Back to the lessons</Link>
    </div>
  )
}

export function PythonGuideLesson() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const list = useAsync(() => fetchGuide(LANGUAGE), 'guide-list')
  const summary = list.data?.lessons.find((l) => l.slug === slug)
  const locked = Boolean(summary?.locked)
  const { data, loading, error } = useAsync(
    () => (locked ? Promise.resolve(null) : fetchGuideLesson(LANGUAGE, slug)),
    `guide-${slug}-${locked}`,
  )

  useEffect(() => { window.scrollTo({ top: 0 }) }, [slug])
  if (list.data && !summary) return <Navigate to="/python/guide" replace />

  return (
    <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto pr-2">
          <Link to="/python/guide" className="mb-4 inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg">
            <Icon d={icons.back} className="size-4" /> All lessons
          </Link>
          {list.data && <Contents lessons={list.data.lessons} current={slug} />}
        </div>
      </aside>

      <div className="min-w-0">
        {list.data && (
          <label className="mb-6 block lg:hidden">
            <span className="mb-1 block text-xs text-fg-subtle">Jump to a lesson</span>
            <select value={slug} onChange={(e) => navigate(lessonPath(e.target.value))} className="h-10 w-full rounded-control border border-line-strong bg-surface px-3 text-sm text-fg">
              {list.data.lessons.map((l) => <option key={l.slug} value={l.slug} disabled={l.locked}>{l.n}. {l.title}{l.locked ? ' (locked)' : ''}</option>)}
            </select>
          </label>
        )}
        {locked && summary && <LockedLesson lesson={summary} />}
        {!locked && loading && <LoadingBlock label="Loading lesson…" />}
        {!locked && error && <ErrorBlock message={error} />}
        {data && <Lesson data={data} lessons={list.data?.lessons} />}
      </div>
    </div>
  )
}

function NavLinkCard({ lesson, direction }) {
  const label = direction === 'prev' ? '← Previous' : 'Next →'
  const align = direction === 'prev' ? 'text-left' : 'text-right sm:ml-auto'
  if (!lesson) return <span />
  if (lesson.locked) {
    return (
      <span className={`block max-w-xs ${align} text-fg-subtle`} aria-disabled="true">
        <span className="block text-xs">{label}</span>
        <span className="flex items-center gap-1.5 text-sm"><Lock className="size-3.5" aria-hidden="true" /> {lesson.title} (locked)</span>
      </span>
    )
  }
  return (
    <Link to={lessonPath(lesson.slug)} className={`group block max-w-xs ${align}`}>
      <span className="block text-xs text-fg-subtle">{label}</span>
      <span className="text-sm font-medium text-fg group-hover:text-accent-text">{lesson.title}</span>
    </Link>
  )
}

function Lesson({ data, lessons }) {
  const { lesson, prev, next } = data
  const find = (l) => (l ? lessons?.find((x) => x.slug === l.slug) ?? l : null)
  return (
    <article className="max-w-3xl space-y-8">
      <div>
        <Link to="/python/guide" className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg lg:hidden">
          <Icon d={icons.back} className="size-4" /> All lessons
        </Link>
        <p className="mt-4 text-sm text-fg-subtle lg:mt-0">{lesson.section} · Lesson {lesson.n} of {lesson.total} · {lesson.minutes} min</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-fg">{lesson.title}</h2>
        <div className="mt-4 rounded-card border border-line bg-surface-2 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">In plain words</p>
          <p className="mt-1.5 leading-relaxed text-fg">{lesson.intro}</p>
        </div>
      </div>

      <ol className="space-y-9">
        {lesson.steps.map((step, i) => <Step key={step.title} step={step} index={i} />)}
      </ol>

      {lesson.check && <QuickCheck key={lesson.slug} check={lesson.check} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-card border border-line bg-surface p-5">
          <h3 className="font-semibold text-fg">Common mistakes</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-fg-muted">
            {lesson.mistakes.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </section>
        <section className="rounded-card border border-line bg-surface p-5">
          <h3 className="font-semibold text-fg">Remember</h3>
          <ul className="mt-3 space-y-2 text-sm text-fg-muted">
            {lesson.recap.map((r) => (
              <li key={r} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />{r}</li>
            ))}
          </ul>
        </section>
      </div>

      <section data-tour="guide-practice" className="flex flex-col gap-4 rounded-card border border-accent-border bg-accent-soft p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent-text">Your turn</p>
          <p className="mt-1 text-fg">Now practise this in a real question.</p>
        </div>
        <Link to={`/python/tasks/${lesson.question}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-cta px-5 py-2.5 text-sm font-semibold text-cta-fg transition-colors hover:bg-cta-hover">
          Solve question {lesson.n} <Icon d={icons.arrow} className="size-4" />
        </Link>
      </section>

      <nav className="flex items-start justify-between gap-4 border-t border-line pt-5" aria-label="Lesson navigation">
        <NavLinkCard lesson={find(prev)} direction="prev" />
        <NavLinkCard lesson={find(next)} direction="next" />
      </nav>
    </article>
  )
}

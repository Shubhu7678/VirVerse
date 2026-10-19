import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { getErrorMessage } from '../../api/client'
import { useOrg } from '../../context/OrgContext'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { EmptyState, ErrorBlock, LoadingBlock } from '../../components/States'
import ProgressBar from '../../components/ProgressBar'

function Status({ value }) {
  const styles = {
    draft: 'bg-slate-100 text-slate-600',
    published: 'bg-indigo-50 text-indigo-700',
    completed: 'bg-emerald-50 text-emerald-700',
    'completed-late': 'bg-amber-50 text-amber-700',
    'in-progress': 'bg-indigo-50 text-indigo-700',
    'not-started': 'bg-slate-100 text-slate-600',
  }
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[value] ?? styles.draft}`}>{value.replaceAll('-', ' ')}</span>
}

function AssignmentComposer({ classes, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    classId: classes[0]?._id ?? '',
    startsAt: '',
    dueAt: '',
  })
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [questions, setQuestions] = useState([])
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      api.get('/orgs/question-bank', { params: { page, limit: 50, category, search } })
        .then(({ data }) => { setQuestions(data.items); setTotal(data.total) })
        .catch((err) => setError(getErrorMessage(err)))
    }, 250)
    return () => clearTimeout(timer)
  }, [page, category, search])

  const toggleTask = (id) => setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  const submit = async (status) => {
    setBusy(true)
    setError('')
    try {
      await api.post('/orgs/assignments', {
        ...form,
        startsAt: new Date(form.startsAt).toISOString(),
        dueAt: new Date(form.dueAt).toISOString(),
        taskIds: selected,
        status,
      })
      onCreated()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const questionPages = Math.max(1, Math.ceil(total / 50))

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold">Create a C assignment</h2>
      <p className="mt-1 text-sm text-slate-500">Choose a class, set availability, and select questions from the VirVerse question bank.</p>
      {error && <div className="mt-4"><ErrorBlock message={error} /></div>}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Input id="assignment-title" label="Assignment title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <div>
          <label htmlFor="assignment-class" className="mb-1.5 block text-sm font-medium">Class</label>
          <select id="assignment-class" value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm">
            <option value="">Select an assigned class</option>
            {classes.map((item) => <option key={item._id} value={item._id}>{item.name} · {item.course?.name ?? item.code}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="assignment-description" className="mb-1.5 block text-sm font-medium">Instructions (optional)</label>
          <textarea id="assignment-description" rows="3" maxLength="4000" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm" placeholder="Tell students what to focus on…" />
        </div>
        <Input id="assignment-start" label="Available from" type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} required />
        <Input id="assignment-due" label="Due date" type="datetime-local" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} required />
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-semibold">Question bank <span className="text-sm font-normal text-slate-500">· {selected.length} selected</span></h3>
            <p className="mt-1 text-xs text-slate-500">Questions are counted once per student when accepted.</p>
          </div>
          <div className="flex gap-2">
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search questions" aria-label="Search question bank" className="w-44 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
            <select aria-label="Filter topic" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
              <option value="">All topics</option>
              {['basics', 'variables', 'input-output', 'operators', 'if-else', 'switch', 'for-loops', 'while-loops', 'patterns', 'arrays', 'arrays-2d', 'strings', 'functions', 'recursion', 'pointers', 'structures', 'file-handling'].map((topic) => <option key={topic} value={topic}>{topic.replaceAll('-', ' ')}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-slate-200">
          {questions.map((question) => (
            <label key={question._id} className="flex cursor-pointer items-center gap-3 border-b border-slate-100 p-3 last:border-0 hover:bg-slate-50">
              <input type="checkbox" checked={selected.includes(question._id)} onChange={() => toggleTask(question._id)} className="size-4 accent-indigo-600" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{question.title}</span>
                <span className="text-xs capitalize text-slate-500">{question.category.replaceAll('-', ' ')} · {question.difficulty}</span>
              </span>
            </label>
          ))}
          {questions.length === 0 && <p className="p-5 text-center text-sm text-slate-500">No matching questions.</p>}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>{total} questions in bank</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border border-slate-300 px-2 py-1 disabled:opacity-40">Previous</button>
            <span>{page}/{questionPages}</span>
            <button disabled={page >= questionPages} onClick={() => setPage(page + 1)} className="rounded border border-slate-300 px-2 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button className="w-auto bg-slate-700 hover:bg-slate-800" disabled={busy || selected.length === 0 || !form.classId} loading={busy} onClick={() => submit('draft')}>Save draft</Button>
        <Button className="w-auto" disabled={busy || selected.length === 0 || !form.classId} loading={busy} onClick={() => submit('published')}>Publish assignment</Button>
      </div>
    </section>
  )
}

function AssignmentDetails({ id, role }) {
  const [assignment, setAssignment] = useState(null)
  const [error, setError] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [reload, setReload] = useState(0)
  const refresh = () => setReload((value) => value + 1)

  useEffect(() => {
    api.get(`/orgs/assignments/${id}`)
      .then((response) => { setAssignment(response.data.assignment); setError('') })
      .catch((err) => setError(getErrorMessage(err)))
  }, [id, reload])

  if (error) return <ErrorBlock message={error} />
  if (!assignment) return <LoadingBlock label="Loading assignment…" />

  const progress = assignment.progress
  const overdue = progress.state === 'completed-late'
  const publish = async () => {
    setPublishing(true)
    setError('')
    try {
      await api.post(`/orgs/assignments/${id}/publish`)
      refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link to="/organization/assignments" className="text-sm font-medium text-brand-600 hover:underline">← Assignments</Link>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2"><Status value={assignment.status} /><span className="text-xs text-slate-500">{assignment.class?.name}</span></div>
            <h1 className="mt-3 text-2xl font-bold">{assignment.title}</h1>
            {assignment.description && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{assignment.description}</p>}
          </div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm">
            <p>Opens: <b>{new Date(assignment.startsAt).toLocaleString()}</b></p>
            <p className="mt-1">Due: <b className={overdue ? 'text-red-600' : ''}>{new Date(assignment.dueAt).toLocaleString()}</b></p>
            {assignment.teacher && <p className="mt-1 text-slate-500">Teacher: {assignment.teacher.name}</p>}
          </div>
        </div>
        {assignment.status === 'draft' && role !== 'student' && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <Button className="w-auto" loading={publishing} onClick={publish}>Publish to class</Button>
            <p className="mt-2 text-xs text-slate-500">Students will see it when the availability date arrives.</p>
          </div>
        )}
      </section>

      {role === 'student' ? (
        <>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between text-sm">
              <h2 className="font-semibold">Your progress</h2>
              <span>{progress.solved}/{progress.required} questions · {progress.percent}%</span>
            </div>
            <div className="mt-3"><ProgressBar percent={progress.percent} label="Assignment progress" /></div>
            <div className="mt-3 flex items-center gap-2"><Status value={progress.state} />{progress.state === 'completed-late' && <span className="text-xs text-amber-700">Completed after the due date.</span>}</div>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold">Questions</h2>
            <ul className="mt-3 divide-y divide-slate-100">
              {assignment.tasks.map((task) => (
                <li key={task.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs capitalize text-slate-500">{task.category.replaceAll('-', ' ')} · {task.difficulty}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Status value={task.completed ? 'completed' : 'not-started'} />
                    <Link to={`/tasks/${task.slug}?assignmentId=${assignment.id}`} className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700">Open IDE</Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ['Assigned', progress.totalStudents],
              ['Started', progress.started],
              ['Completed', progress.completed],
              ['Partial', progress.partial],
              ['Not started', progress.notStarted],
              ['Late', progress.late],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p>
              </div>
            ))}
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between"><h2 className="font-semibold">Completion rate</h2><span className="text-sm font-semibold">{progress.completionPercent}%</span></div>
            <div className="mt-3"><ProgressBar percent={progress.completionPercent} label="Class completion rate" /></div>
          </section>
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-5"><h2 className="font-semibold">Student progress</h2><p className="mt-1 text-sm text-slate-500">Accepted solutions count once per assigned question.</p></div>
            {progress.students?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase"><tr><th className="p-3">Student</th><th className="p-3">Progress</th><th className="p-3">Status</th><th className="p-3">Last activity</th></tr></thead>
                  <tbody>{progress.students.map((student) => (
                    <tr key={student.id} className="border-t border-slate-100">
                      <td className="p-3"><p className="font-medium">{student.name}</p><p className="text-xs text-slate-500">{student.email}</p></td>
                      <td className="p-3">{student.solved}/{student.required} · {student.percent}%</td>
                      <td className="p-3"><Status value={student.state} /></td>
                      <td className="p-3">{student.lastActivity ? new Date(student.lastActivity).toLocaleString() : 'No activity'}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            ) : <EmptyState title="No students enrolled" text="Enroll students in this class to track assignment progress." />}
          </section>
        </>
      )}
    </div>
  )
}

export default function Assignments() {
  const { id } = useParams()
  const { activeOrganization } = useOrg()
  const [items, setItems] = useState(null)
  const [classes, setClasses] = useState([])
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const isStudent = activeOrganization?.role === 'student'
  const canCreate = ['teacher', 'org_admin'].includes(activeOrganization?.role)

  useEffect(() => {
    if (!activeOrganization || id) return
    Promise.all([
      api.get('/orgs/assignments'),
      canCreate ? api.get('/orgs/structure') : Promise.resolve({ data: { classes: [] } }),
    ])
      .then(([assignments, structure]) => {
        setItems(assignments.data.items)
        setClasses(structure.data.classes)
        setError('')
      })
      .catch((err) => setError(getErrorMessage(err)))
  }, [activeOrganization, id, reload, canCreate])

  if (id) return <AssignmentDetails id={id} role={activeOrganization?.role} />
  if (error) return <ErrorBlock message={error} />
  if (!activeOrganization || !items) return <LoadingBlock label="Loading assignments…" />
  const refresh = () => setReload((value) => value + 1)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm text-slate-500">{activeOrganization.organization.name}</p>
        <h1 className="text-2xl font-bold">{isStudent ? 'My assignments' : 'Assignments'}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {isStudent ? 'Work through your class assignments and track your own completion.' : 'Create coursework from the C question bank and monitor class progress.'}
        </p>
      </div>
      {canCreate && (classes.length ? (
        <AssignmentComposer classes={classes} onCreated={refresh} />
      ) : (
        <EmptyState title="No classes available" text="Create a class or ask an organization admin to assign you to one before creating assignments." />
      ))}
      {items.length === 0 ? (
        <EmptyState title="No assignments yet" text={isStudent ? 'Published class assignments will appear here when available.' : 'Create a class assignment to get started.'} />
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Link key={item.id} to={`/organization/assignments/${item.id}`} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md">
              <div className="flex items-center justify-between gap-2"><span className="text-xs text-slate-500">{item.class?.name}</span><Status value={item.status} /></div>
              <h2 className="mt-3 text-lg font-semibold">{item.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.description || `${item.tasks.length} C programming questions`}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>{item.tasks.length} questions</span><span>Due {new Date(item.dueAt).toLocaleDateString()}</span>
              </div>
              {isStudent ? (
                <>
                  <div className="mt-3"><ProgressBar percent={item.progress.percent} label={`${item.title} progress`} size="h-1.5" /></div>
                  <p className="mt-1 text-xs text-slate-500">{item.progress.solved}/{item.progress.required} solved</p>
                </>
              ) : (
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span>{item.progress.totalStudents} students · {item.progress.started} started</span>
                  <span className="font-semibold">{item.progress.completionPercent}% complete</span>
                </div>
              )}
            </Link>
          ))}
        </section>
      )}
    </div>
  )
}

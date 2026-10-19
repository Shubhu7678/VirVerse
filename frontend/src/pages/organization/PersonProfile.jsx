import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { getErrorMessage } from '../../api/client'
import { ErrorBlock, LoadingBlock } from '../../components/States'
import ProgressBar from '../../components/ProgressBar'

export default function OrganizationPersonProfile() {
  const { userId } = useParams()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    api.get(`/orgs/people/${userId}`)
      .then((r) => setProfile(r.data.profile))
      .catch((e) => setError(getErrorMessage(e)))
  }, [userId])

  if (error) return <ErrorBlock message={error} />
  if (!profile) return <LoadingBlock />

  const isStudent = profile.role === 'student'

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link to="/organization/people" className="text-sm font-medium text-brand-600 hover:underline">← People & performance</Link>
      <section className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex size-16 items-center justify-center rounded-full bg-brand-600 text-2xl font-semibold text-white">{profile.name.charAt(0).toUpperCase()}</div>
        <div>
          <h1 className="text-xl font-bold">{profile.name}</h1>
          <p className="text-sm text-slate-500">{profile.email}</p>
          <p className="mt-1 text-xs capitalize text-slate-400">{profile.role.replace('_', ' ')} · Member since {new Date(profile.joinedAt).toLocaleDateString()}</p>
        </div>
      </section>
      <section className={`grid gap-4 ${isStudent ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {isStudent ? (
          <>
            <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Questions solved</p><p className="mt-1 text-2xl font-semibold">{profile.questionsSolved}</p></div>
            <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Submissions</p><p className="mt-1 text-2xl font-semibold">{profile.submissions}</p></div>
          </>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Assigned classes</p>
            <p className="mt-1 text-2xl font-semibold">{profile.classes.length}</p>
          </div>
        )}
        <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Last activity</p><p className="mt-1 text-lg font-semibold">{profile.lastActivity ? new Date(profile.lastActivity).toLocaleDateString() : 'No activity'}</p></div>
      </section>
      {isStudent && profile.topicProgress.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Accepted solutions by topic</h2>
          <div className="mt-4 space-y-4">
            {profile.topicProgress.map((item) => (
              <div key={item._id}>
                <div className="mb-1 flex justify-between text-sm"><span className="capitalize">{item._id.replaceAll('-', ' ')}</span><span>{item.solved}/{item.total} ({item.percent}%)</span></div>
                <ProgressBar percent={item.percent} label={`${item._id} solved`} size="h-1.5" />
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">{profile.role === 'student' ? 'Enrolled classes' : 'Assigned classes'}</h2>
        {profile.classes.length ? (
          <ul className="mt-3 divide-y divide-slate-100">
            {profile.classes.map((c) => <li key={c._id} className="py-2 text-sm">{c.name} {c.code && <span className="text-slate-500">· {c.code}</span>} {c.course?.name && <span className="text-slate-500">· {c.course.name}</span>}</li>)}
          </ul>
        ) : <p className="mt-2 text-sm text-slate-500">No classes assigned.</p>}
      </section>
    </div>
  )
}

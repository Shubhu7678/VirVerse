import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../../api/client'
import { useOrg } from '../../context/OrgContext'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { EmptyState, ErrorBlock, LoadingBlock } from '../../components/States'
import Icon, { icons } from '../../components/Icon'

const selectClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100'

function FormSection({ title, description, icon, tone, children }) {
  return (
    <section className="profile-enter rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
          <Icon d={icon} />
        </span>
        <div>
          <h2 className="font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function OverviewStat({ label, value, icon, tone }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
      <span className={`flex size-10 items-center justify-center rounded-xl ${tone}`}><Icon d={icon} /></span>
      <div>
        <p className="text-xl font-bold leading-tight text-slate-900">{value}</p>
        <p className="mt-0.5 text-xs text-slate-500">{label}</p>
      </div>
    </div>
  )
}

export default function OrganizationStructure() {
  const { activeOrganization } = useOrg()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [department, setDepartment] = useState({ name: '', code: '' })
  const [course, setCourse] = useState({ name: '', code: '', departmentId: '' })
  const [section, setSection] = useState({ name: '', code: '', courseId: '', academicYear: '' })
  const [teacherEmail, setTeacherEmail] = useState({})
  const [studentEmail, setStudentEmail] = useState({})
  const isAdmin = activeOrganization?.role === 'org_admin'

  const refresh = () => api.get('/orgs/structure').then((r) => { setData(r.data); setError('') }).catch((e) => setError(getErrorMessage(e)))
  useEffect(() => { if (activeOrganization) refresh() }, [activeOrganization])

  const submit = async (fn) => {
    setLoading(true)
    setError('')
    setNotice('')
    try { await fn(); setNotice('Saved successfully'); await refresh() }
    catch (err) { setError(getErrorMessage(err)) }
    finally { setLoading(false) }
  }
  if (error && !data) return <ErrorBlock message={error} />
  if (!activeOrganization || !data) return <LoadingBlock />

  const totalStudents = data.classes.reduce((sum, classItem) => sum + (classItem.studentCount ?? 0), 0)

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <section className="profile-enter relative isolate overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="pointer-events-none absolute -top-28 -right-10 -z-10 size-80 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-8 bottom-0 -z-10 size-56 rounded-full bg-violet-100/60 blur-3xl" />
        <div className="p-5 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-brand-600 uppercase">
            {activeOrganization.organization.name}
          </p>
          <div className="mt-1 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {isAdmin ? 'Departments & classes' : 'My classes'}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
                {isAdmin
                  ? 'Build your academic structure, organize courses, and connect learners with their teachers.'
                  : 'Explore your assigned classes, meet your students, and follow their learning progress.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              {isAdmin && (
                <>
                  <OverviewStat label="Departments" value={data.departments.length} icon={icons.dashboard} tone="bg-indigo-50 text-indigo-600" />
                  <OverviewStat label="Courses" value={data.courses.length} icon={icons.list} tone="bg-violet-50 text-violet-600" />
                </>
              )}
              <OverviewStat label="Classes" value={data.classes.length} icon={icons.tasks} tone="bg-brand-50 text-brand-700" />
              <OverviewStat label={isAdmin ? 'Enrolled students' : 'My students'} value={totalStudents} icon={icons.profile} tone="bg-emerald-50 text-emerald-600" />
            </div>
          </div>
        </div>
      </section>

      {error && <ErrorBlock message={error} />}
      {notice && <p role="status" className="animate-pop rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{notice}</p>}

      {isAdmin && (
        <section>
          <div className="mb-4">
            <p className="text-xs font-semibold tracking-[0.16em] text-brand-600 uppercase">Academic setup</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Build your organization</h2>
            <p className="mt-1 text-sm text-slate-500">Start with a department, add its courses, then create classes.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <FormSection title="Add a department" description="Create a top-level academic department." icon={icons.dashboard} tone="bg-indigo-50 text-indigo-600">
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); submit(() => api.post('/orgs/departments', department)).then(() => setDepartment({ name: '', code: '' })) }}>
                <Input id="department-name" label="Department name" placeholder="e.g. Computer Science" value={department.name} onChange={(e) => setDepartment({ ...department, name: e.target.value })} required />
                <Input id="department-code" label="Department code" placeholder="e.g. CS" value={department.code} onChange={(e) => setDepartment({ ...department, code: e.target.value })} required />
                <Button className="mt-1 rounded-xl">Add department <Icon d={icons.arrow} className="size-4" /></Button>
              </form>
            </FormSection>
            <FormSection title="Add a course" description="Place a course inside one of your departments." icon={icons.list} tone="bg-violet-50 text-violet-600">
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); submit(() => api.post('/orgs/courses', course)).then(() => setCourse({ name: '', code: '', departmentId: '' })) }}>
                <Input id="course-name" label="Course name" placeholder="e.g. BCA" value={course.name} onChange={(e) => setCourse({ ...course, name: e.target.value })} required />
                <Input id="course-code" label="Course code" placeholder="e.g. BCA-01" value={course.code} onChange={(e) => setCourse({ ...course, code: e.target.value })} required />
                <div>
                  <label htmlFor="course-department" className="mb-1.5 block text-sm font-medium text-slate-700">Department</label>
                  <select id="course-department" className={selectClass} value={course.departmentId} onChange={(e) => setCourse({ ...course, departmentId: e.target.value })} required>
                    <option value="">Select department</option>
                    {data.departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <Button className="mt-1 rounded-xl" loading={loading} disabled={!data.departments.length}>Add course <Icon d={icons.arrow} className="size-4" /></Button>
              </form>
            </FormSection>
            <FormSection title="Create a class" description="Set up a class for a course and academic year." icon={icons.tasks} tone="bg-emerald-50 text-emerald-600">
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); submit(() => api.post('/orgs/classes', section)).then(() => setSection({ name: '', code: '', courseId: '', academicYear: '' })) }}>
                <Input id="class-name" label="Class name" placeholder="e.g. Section A" value={section.name} onChange={(e) => setSection({ ...section, name: e.target.value })} required />
                <div className="grid grid-cols-2 gap-3">
                  <Input id="class-code" label="Class code" placeholder="e.g. A" value={section.code} onChange={(e) => setSection({ ...section, code: e.target.value })} required />
                  <Input id="class-year" label="Academic year" placeholder="e.g. 2026-27" value={section.academicYear} onChange={(e) => setSection({ ...section, academicYear: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="class-course" className="mb-1.5 block text-sm font-medium text-slate-700">Course</label>
                  <select id="class-course" className={selectClass} value={section.courseId} onChange={(e) => setSection({ ...section, courseId: e.target.value })} required>
                    <option value="">Select course</option>
                    {data.courses.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
                  </select>
                </div>
                <Button className="mt-1 rounded-xl" loading={loading} disabled={!data.courses.length}>Create class <Icon d={icons.arrow} className="size-4" /></Button>
              </form>
            </FormSection>
          </div>
        </section>
      )}

      <section className="profile-enter" style={{ animationDelay: '120ms' }}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-brand-600 uppercase">Learning groups</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">{isAdmin ? 'Your classes' : 'Classes assigned to you'}</h2>
            <p className="mt-1 text-sm text-slate-500">{isAdmin ? 'Assign teachers and enroll students to get each class started.' : 'Class details and student access are all in one place.'}</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
            {data.classes.length} {data.classes.length === 1 ? 'class' : 'classes'}
          </span>
        </div>
        {!isAdmin && data.classes.length === 0 ? (
          <EmptyState title="No classes assigned yet" text="Once your organization admin assigns you to a class, it will appear here." />
        ) : data.classes.length === 0 ? (
          <EmptyState title="Your organization is ready to grow" text="Create a department, add a course, and create your first class to get started." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {data.classes.map((classItem, index) => (
              <section
                key={classItem._id}
                className="profile-enter group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
                style={{ animationDelay: `${160 + index * 50}ms` }}
              >
                <div className="border-b border-slate-100 bg-linear-to-r from-brand-50/80 to-violet-50/70 p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm ring-1 ring-slate-200/70">
                      <Icon d={icons.tasks} className="size-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold tracking-tight text-slate-900">{classItem.name}</h3>
                        <span className="rounded-full border border-white bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-600">{classItem.code}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {classItem.course?.name ?? 'Course'}
                        {classItem.academicYear && <span className="text-slate-400"> · {classItem.academicYear}</span>}
                      </p>
                    </div>
                    <span className="hidden shrink-0 rounded-xl bg-white/80 px-3 py-2 text-center sm:block">
                      <span className="block text-lg font-bold leading-none text-slate-900">{classItem.studentCount}</span>
                      <span className="mt-1 block text-[10px] font-medium text-slate-500">students</span>
                    </span>
                  </div>
                </div>
                <div className="space-y-4 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Icon d={icons.profile} className="size-4" /></span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Assigned teachers</p>
                      <p className="mt-1 break-words text-sm font-medium text-slate-800">{classItem.teachers.map((t) => t.name).join(', ') || 'No teachers assigned yet'}</p>
                    </div>
                    <Link to="/organization/people?role=student" className="ml-auto shrink-0 text-xs font-semibold text-brand-600 transition hover:text-brand-700">
                      Student progress <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                  {isAdmin && (
                    <div className="grid gap-3 border-t border-slate-100 pt-4 md:grid-cols-2">
                      <form className="min-w-0 space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4" onSubmit={(e) => { e.preventDefault(); submit(() => api.post(`/orgs/classes/${classItem._id}/teachers`, { email: teacherEmail[classItem._id] })).then(() => setTeacherEmail({ ...teacherEmail, [classItem._id]: '' })) }}>
                        <Input id={`teacher-${classItem._id}`} label="Assign teacher" type="email" placeholder="teacher@example.com" value={teacherEmail[classItem._id] ?? ''} onChange={(e) => setTeacherEmail({ ...teacherEmail, [classItem._id]: e.target.value })} required />
                        <Button className="rounded-xl">Assign teacher</Button>
                      </form>
                      <form className="min-w-0 space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4" onSubmit={(e) => { e.preventDefault(); submit(() => api.post(`/orgs/classes/${classItem._id}/students`, { email: studentEmail[classItem._id] })).then(() => setStudentEmail({ ...studentEmail, [classItem._id]: '' })) }}>
                        <Input id={`student-${classItem._id}`} label="Enroll student" type="email" placeholder="student@example.com" value={studentEmail[classItem._id] ?? ''} onChange={(e) => setStudentEmail({ ...studentEmail, [classItem._id]: e.target.value })} required />
                        <Button className="rounded-xl">Enroll student</Button>
                      </form>
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Copy } from 'lucide-react'
import { deleteStudent, resetStudentPassword, setStudentDisabled, updateStudent } from '../../api/admin'
import { getErrorMessage } from '../../api/client'
import Modal from '../../components/Modal'
import { useToast } from '../../components/ui/Toast'

const btn = 'inline-flex h-9 items-center justify-center rounded-full border border-line-strong px-4 text-sm font-medium text-fg transition-colors hover:bg-surface-2 disabled:opacity-50'
const field = 'h-10 w-full rounded-control border border-line-strong bg-surface px-3 text-sm text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/30'

function Row({ title, text, children }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-fg">{title}</p>
        <p className="text-sm text-fg-muted">{text}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export default function AccountCard({ student, onChange }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ name: student.name, email: student.email })
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState('')
  const [reset, setReset] = useState(null)
  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [typedEmail, setTypedEmail] = useState('')

  const run = async (key, task, success) => {
    setBusy(key)
    setMessage(null)
    try {
      const result = await task()
      if (success) toast.success(success)
      return result
    } catch (err) {
      setMessage({ ok: false, text: getErrorMessage(err, 'That did not work') })
      return null
    } finally {
      setBusy('')
    }
  }

  const dirty = form.name.trim() !== student.name || form.email.trim() !== student.email
  const save = async (e) => {
    e.preventDefault()
    const res = await run('save', () => updateStudent(student.id, { name: form.name.trim(), email: form.email.trim() }), 'Details saved')
    if (res) onChange({ name: res.student.name, email: res.student.email })
  }

  const sendReset = async () => {
    const res = await run('reset', () => resetStudentPassword(student.id))
    if (res) {
      setReset(res)
      if (res.emailed) toast.success('Reset email sent to the student')
      else toast.show('Email is not set up. Copy the link and share it', { tone: 'info' })
    }
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reset.link)
      toast.success('Link copied')
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked: the link is still visible to copy by hand */
    }
  }

  const toggleDisabled = async () => {
    const next = !student.disabled
    const res = await run('disable', () => setStudentDisabled(student.id, next), next ? 'Account disabled. They can no longer sign in.' : 'Account enabled.')
    if (res) onChange({ disabled: res.disabled })
  }

  const remove = async () => {
    const res = await run('delete', () => deleteStudent(student.id, typedEmail))
    if (res?.deleted) {
      toast.success('Student deleted')
      navigate('/admin', { replace: true })
    }
  }

  return (
    <section aria-labelledby="account-heading" data-tour="admin-account" className="rounded-card border border-line bg-surface">
      <div className="border-b border-line p-5">
        <h3 id="account-heading" className="font-semibold text-fg">Account</h3>
        <p className="mt-1 text-sm text-fg-muted">Fix details, help with a forgotten password, or stop an account from signing in.</p>
      </div>

      <form onSubmit={save} className="grid gap-3 border-b border-line p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="text-sm text-fg-muted">Name
          <input className={`${field} mt-1`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={80} required />
        </label>
        <label className="text-sm text-fg-muted">Email
          <input type="email" className={`${field} mt-1`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <button type="submit" className={btn} disabled={!dirty || busy === 'save'}>{busy === 'save' ? 'Saving…' : 'Save'}</button>
      </form>

      <div className="divide-y divide-line">
        <Row title="Password reset" text="Emails the student a link to choose a new password. It works once and lasts 1 hour.">
          <button type="button" className={btn} onClick={sendReset} disabled={busy === 'reset'}>{busy === 'reset' ? 'Sending…' : 'Send reset link'}</button>
        </Row>
        {reset && (
          <div className="bg-surface-2 px-5 py-4 text-sm" role="status">
            <p className="font-medium text-fg">{reset.emailed ? 'Email sent to the student.' : 'Email is not set up, so nothing was sent. Share this link with the student:'}</p>
            <div className="mt-2 flex items-center gap-2">
              <input readOnly value={reset.link} onFocus={(e) => e.target.select()} className={`${field} font-mono text-xs`} aria-label="Reset link" />
              <button type="button" onClick={copy} className={btn}>
                {copied ? <Check className="mr-1.5 size-4 text-success" aria-hidden="true" /> : <Copy className="mr-1.5 size-4" aria-hidden="true" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="mt-2 text-xs text-fg-subtle">Valid until {new Date(reset.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Only one link is active at a time.</p>
          </div>
        )}
        <Row title={student.disabled ? 'Account is disabled' : 'Disable account'} text={student.disabled ? 'They cannot sign in. Their progress is kept.' : 'Blocks sign-in and signs them out. Progress is kept, and you can enable it again.'}>
          <button type="button" className={btn} onClick={toggleDisabled} disabled={busy === 'disable'}>{student.disabled ? 'Enable account' : 'Disable account'}</button>
        </Row>
        <Row title="Delete student" text="Permanently removes the account, submissions and progress. This cannot be undone.">
          <button type="button" className={`${btn} border-danger text-danger hover:bg-danger-soft`} onClick={() => { setTypedEmail(''); setConfirmDelete(true) }}>Delete…</button>
        </Row>
      </div>

      {message && <p role="alert" className="border-t border-line px-5 py-3 text-sm text-danger">{message.text}</p>}

      {confirmDelete && (
        <Modal title={`Delete ${student.name}?`} onClose={() => setConfirmDelete(false)}>
          <p className="text-sm text-fg-muted">This permanently deletes the account and everything they solved. To confirm, type their email: <strong className="text-fg">{student.email}</strong></p>
          <input className={`${field} mt-3`} value={typedEmail} onChange={(e) => setTypedEmail(e.target.value)} aria-label="Type the student's email to confirm" autoComplete="off" />
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className={btn} onClick={() => setConfirmDelete(false)}>Cancel</button>
            <button type="button" className={`${btn} border-danger bg-danger text-white hover:bg-danger`} disabled={typedEmail.trim().toLowerCase() !== student.email || busy === 'delete'} onClick={remove}>{busy === 'delete' ? 'Deleting…' : 'Delete forever'}</button>
          </div>
        </Modal>
      )}
    </section>
  )
}

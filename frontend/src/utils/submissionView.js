import { HTML_TASKS } from '../data/htmlBasics'
import { taskPath } from './languageRoutes'

const HTML_BY_ID = new Map(HTML_TASKS.map((task) => [task.id, task]))

// One shape for both kinds of entry: a coding submission, or a finished HTML lesson or project.
export function submissionView(entry) {
  if (entry.kind === 'html') {
    const task = HTML_BY_ID.get(entry.taskId)
    return {
      html: true,
      title: task?.title ?? 'HTML task',
      to: `/web-development/html-basics/${entry.taskId}`,
      label: task?.category === 'project' ? 'HTML project' : 'HTML lesson',
    }
  }
  return {
    html: false,
    title: entry.task.title,
    to: taskPath(entry.task.language || 'c', entry.task.slug),
    difficulty: entry.task.difficulty,
  }
}

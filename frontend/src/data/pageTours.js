import { STUDENT_TOUR, ADMIN_TOUR } from './tourSteps'

// "What does everything on this page do?" Opened by the ? button in the top bar.
// A step whose target is not on screen is shown as a centred card, so a missing
// element never breaks the tour.
const intro = (title, body) => ({ title, body })
const close = { title: 'That is this page', body: 'Open the ? button on any page to see what its features do.' }

const PAGES = [
  {
    match: /^\/admin\/students\/[^/]+$/,
    steps: [
      intro('Student details', 'Everything about one student: their access, their progress and what they submitted recently.'),
      { target: 'section[aria-labelledby="languages-heading"]', title: 'Access and progress', body: 'One card per language. The switch unlocks every topic of that language for this student, and turns it back off. It saves immediately. Without it they only see the first 10 questions.' },
      { target: '[data-tour="admin-account"]', title: 'Account tools', body: 'Fix a name or email, send a password reset link, disable the account (reversible), or delete it for good after typing their email to confirm.' },
      { target: 'section[aria-labelledby="recent-heading"]', title: 'Recent submissions', body: 'Their latest attempts and whether each one passed.' },
      close,
    ],
  },
  {
    match: /^\/admin\/emails$/,
    steps: [
      intro('Emails', 'Every email VirVerse sends: sign-up codes, forgot-password links and admin resets.'),
      { target: '[data-tour="email-today"]', title: 'Sent today', body: 'How many emails went out since midnight, split by type, with failures and how close you are to the daily limit.' },
      { target: '[aria-label="Filter emails"]', title: 'Filter', body: 'Show everything, only emails that were sent, or only the ones that failed.' },
      { target: 'main ol', title: 'Latest 10', body: 'Who each email went to, what it was for, and when. Use Newer and Older for the rest.' },
      close,
    ],
  },
  {
    match: /^\/admin\/logs$/,
    steps: [
      intro('Activity log', 'A running record of what is happening: new sign-ups, questions solved for the first time, and access changes.'),
      { target: '[aria-label="Filter log type"]', title: 'Filter the log', body: 'Show everything, or only sign-ups, completed questions or access changes.' },
      { target: 'main ol', title: 'Latest 10 entries', body: 'The newest entries come first. Click an entry to open that student.' },
      { target: 'main nav, main > div > div:last-child', title: 'Older entries', body: 'Use Newer and Older to page through the history, 10 at a time.' },
      close,
    ],
  },
  {
    match: /^\/admin$/,
    steps: [
      intro('Students', 'Everyone who signed up. Open a student to unlock languages and read their progress.'),
      { target: '#student-search', title: 'Search', body: 'Type a name or email and press Enter.' },
      { target: '[aria-label="Filter by access"]', title: 'Filter by access', body: 'Show everyone, only students on the free 10 questions, or only those you unlocked.' },
      { target: 'main ul', title: 'Student list', body: 'Each row shows unlocked languages, questions solved and when the student was last online. Green means active in the last 5 minutes.' },
      close,
    ],
  },
  {
    match: /^\/dashboard$/,
    steps: [
      intro('Your dashboard', 'A quick view of where you are and what to do next.'),
      { target: 'section[aria-label="Continue learning"]', title: 'Next question and progress', body: 'The left card takes you straight to your next question. The right card shows how many questions you have solved.' },
      { target: '[data-tour="dash-paths"]', title: 'Learning paths', body: 'Pick a language. Each path opens its topics, practice problems and playground.' },
      { target: '[data-tour="dash-recent"]', title: 'Recent submissions', body: 'Your last few attempts and their results. Click one to reopen the question.' },
      close,
    ],
  },
  {
    match: /^\/leaderboard$/,
    steps: [
      intro('Leaderboard', 'See how you compare with other students.'),
      { target: '[data-tour="lb-me"]', title: 'Your position', body: 'Your rank and points. You earn points the first time you solve a question: 10 for Easy, 20 for Medium, 30 for Hard.' },
      { target: 'main ol', title: 'The ranking', body: 'Names, levels and points, 10 per page. Other students\' question counts are private.' },
      close,
    ],
  },
  {
    match: /^\/profile$/,
    steps: [
      intro('Your profile', 'Your account, activity and access in one place.'),
      { target: 'main section:first-of-type', title: 'About you', body: 'Your name, level and points. Points come from solving questions.' },
      { target: '[data-tour="profile-access"]', title: 'Your access', body: 'Which languages are fully unlocked. Everything else is limited to the 10 free questions. Ask your admin to unlock more.' },
      close,
    ],
  },
  {
    match: /^\/submissions$/,
    steps: [
      intro('Submissions', 'Every time you press Submit, the result is saved here.'),
      { target: 'main ul', title: 'Your attempts', body: 'Each row shows the question, the verdict (Accepted, Wrong Answer, errors) and the time. Click one to go back and fix it.' },
      close,
    ],
  },
  {
    match: /^\/python\/guide\/[^/]+$/,
    steps: [
      intro('A guide lesson', 'A short lesson for beginners. Read it, then solve the question that goes with it.'),
      { target: 'nav[aria-label="Lessons"]', title: 'All lessons', body: 'Jump to any lesson. Sections open and close, a check mark means you solved its question, and a lock means it is not unlocked yet.' },
      { target: 'article ol', title: 'Step by step', body: 'Each step explains one idea, shows the code (use Copy to try it yourself), what you type, and what you will see when it runs.' },
      { target: '[aria-labelledby="check-heading"]', title: 'Quick check', body: 'One question to test that the idea stuck. Pick an answer and you get an explanation straight away.' },
      { target: '[data-tour="guide-practice"]', title: 'Your turn', body: 'Opens the question for this lesson so you can try it yourself.' },
      close,
    ],
  },
  {
    match: /^\/python\/guide$/,
    steps: [
      intro('Python beginner guide', 'Short lessons for people who have never written code.'),
      { target: '[role="progressbar"][aria-label="Guide progress"]', title: 'Progress and Continue', body: 'Shows how many lessons you have practised. The button takes you to the next one.' },
      { target: 'input[type="search"]', title: 'Search lessons', body: 'Find a lesson by name or topic.' },
      { target: 'section[aria-label]', title: 'Lessons by section', body: 'Lessons are grouped into sections that open and close, each with its own progress. Open a lesson to read it, then solve its question. Locked lessons open when your admin unlocks Python.' },
      close,
    ],
  },
  {
    match: /^\/(javascript\/|python\/)?playground$/,
    steps: [
      intro('Playground', 'A free editor. Try code any time, with no question attached.'),
      { target: '.playground-tools', title: 'Toolbar', body: 'Switch language, copy or download your code, reset it, and change the theme.' },
      { target: '.playground-editor-host', title: 'Editor', body: 'Write your code here. Press Ctrl or Cmd + Enter to run it.' },
      { target: '.playground-console', title: 'Console', body: 'Your program\'s output appears here. Use the input tab to type values your program reads.' },
      close,
    ],
  },
  {
    match: /^\/(javascript\/|python\/)?tasks\/[^/]+$/,
    steps: [
      intro('A question', 'Read the problem on the left, write your answer on the right.'),
      { target: '[data-tour="ide-progress"]', title: 'Where you are', body: 'The question number and whether you have solved it. The arrow on the left goes back to the topic.' },
      { target: '[data-tour="ide-problem"]', title: 'The problem', body: 'What to do, the input and the output, and an example. Open Docs for help, Hint if you are stuck, and the worked solution once you have tried.' },
      { target: '[data-tour="ide-editor"]', title: 'Editor', body: 'Write your code. Reset brings back the starter code, and the font buttons change the text size.' },
      { target: '[data-tour="ide-actions"]', title: 'Run and Submit', body: 'Run tries your code on the sample input so you can check it. Submit tests it against every case and saves the result.' },
      { target: '[data-tour="ide-console"]', title: 'Results', body: 'Output, errors and test results appear here after you run or submit.' },
      close,
    ],
  },
  {
    match: /^\/(javascript\/|python\/)?topics\/[^/]+$/,
    steps: [
      intro('A topic', 'All the questions for one topic.'),
      { target: '[role="tablist"]', title: 'Tabs', body: 'Questions lists what to solve. Learn & docs has short lessons. Details shows an overview.' },
      { target: 'main section[aria-label="Topic questions"]', title: 'Questions', body: 'Search, filter and open a question. The highlighted one is your next.' },
      close,
    ],
  },
  {
    match: /^\/(javascript\/|python\/)?(practice|completed)$|^\/completed$/,
    steps: [
      intro('Question list', 'Every question you can open, in one place.'),
      { target: '[aria-label="Search questions"]', title: 'Search and filters', body: 'Search by name, then narrow by topic, difficulty or status, and sort the list.' },
      { target: 'main ul', title: 'Questions', body: 'Click a question to open it. The tag on each row shows its difficulty and whether you solved it.' },
      close,
    ],
  },
  {
    match: /^\/(tasks|javascript|python)$/,
    steps: [
      intro('Topics', 'The learning path for this language.'),
      { target: 'main header', title: 'Continue', body: 'The big button takes you to the next question to solve.' },
      { target: 'section[aria-label="Progress and shortcuts"]', title: 'Progress and shortcuts', body: 'How much you have solved, plus links to practice problems, the playground and (for Python) the beginner guide.' },
      { target: 'section[aria-labelledby="open-heading"]', title: 'Topics you can open', body: 'Click a topic to see its questions. "Up next" marks where you left off.' },
      { target: 'section[aria-labelledby="locked-heading"]', title: 'Locked topics', body: 'These open when your admin unlocks the language. The number tells you how many questions are inside.' },
      close,
    ],
  },
]

export function getPageTour(pathname, isAdmin) {
  const page = PAGES.find((p) => p.match.test(pathname))
  if (page) return page.steps
  return isAdmin ? ADMIN_TOUR : STUDENT_TOUR
}

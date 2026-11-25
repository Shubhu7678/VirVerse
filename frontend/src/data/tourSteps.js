// Targets are [data-tour="..."] attributes set in DashboardLayout. A step whose target
// is not visible (for example the sidebar on a phone) is shown as a centred card.
const finish = {
  title: 'You are all set',
  body: 'Open the ? button at the top right on any page to see what that page\'s features do.',
}

export const STUDENT_TOUR = [
  {
    title: 'Welcome to VirVerse',
    body: 'Learn C, JavaScript and Python by solving real questions in your browser. You start with 10 free questions in every language.',
  },
  {
    target: '[data-tour="dashboard"]',
    title: 'Your dashboard',
    body: 'See your next question and overall progress here. Use "Start question" to jump straight back in.',
  },
  {
    target: '[data-tour="python"]',
    title: 'Learning tracks',
    body: 'Every language has Topics, Practice problems and a Playground to experiment in. Python also has a beginner Guide: read a short lesson, then solve the question that goes with it.',
  },
  {
    target: '[data-tour="submissions"]',
    title: 'Your submissions',
    body: 'Every answer you submit is saved here with its result, so you can see what passed and what to fix.',
  },
  {
    target: '[data-tour="leaderboard"]',
    title: 'Leaderboard',
    body: 'Earn points the first time you solve a question: 10 for Easy, 20 for Medium and 30 for Hard. See how you rank against other students.',
  },
  {
    target: '[data-tour="profile"]',
    title: 'Profile and access',
    body: 'Your activity and the languages you have unlocked are here. Need more than the 10 free questions? Ask your admin to unlock a language for you.',
  },
  {
    target: '[data-tour="theme"]',
    title: 'Light or dark',
    body: 'Switch the theme whenever your eyes need a change.',
  },
  finish,
]

export const ADMIN_TOUR = [
  {
    title: 'Welcome, admin',
    body: 'From here you manage students, unlock languages and follow how everyone is doing.',
  },
  {
    target: '[data-tour="admin-students"]',
    title: 'Students',
    body: 'Search students, see who is online, and open a student to switch languages on or off and read their progress.',
  },
  {
    target: '[data-tour="admin-logs"]',
    title: 'Activity log',
    body: 'The latest sign-ups, solved questions and access changes, 10 at a time with paging for older ones.',
  },
  {
    target: '[data-tour="leaderboard"]',
    title: 'Leaderboard',
    body: 'Points and solved questions for every student. Students only see points, never other people\'s question counts.',
  },
  {
    target: '[data-tour="theme"]',
    title: 'Light or dark',
    body: 'Switch the theme whenever your eyes need a change.',
  },
  finish,
]

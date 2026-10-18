// Stack copy. `headline` is the one-line stance for the layer, `summary` explains it, and `proof` points to
// where it was used in real work (taken from the résumé and the project data).
export const layers = [
  {
    id: 'design',
    name: 'Design',
    headline: 'Draw it before it exists.',
    summary: 'Every screen starts as a Figma frame. I map the flow in wireframes, turn it into a prototype you can click through, and hand developers something they can build without guessing.',
    items: ['Figma', 'Canva', 'Wireframes and prototypes'],
    proof: 'C-DAC, Chennai: interfaces for government web applications, built responsively with the development team.',
  },
  {
    id: 'interface',
    name: 'Interface',
    headline: 'Components that get reused.',
    summary: 'React.js with Tailwind CSS. I build small pieces, settle them into a shared library, and let the next screen cost less than the last one.',
    items: ['React.js', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Responsive design', 'Component-based architecture'],
    proof: 'YounderBots: 15+ reusable components and one shared library across 3 product modules.',
  },
  {
    id: 'logic',
    name: 'Logic',
    headline: 'The rules behind every button.',
    summary: 'FastAPI in Python. Endpoints that create, read, update and delete, with sign-in handled by JWT and permissions handled by role.',
    items: ['FastAPI', 'Python', 'REST API development', 'SQLAlchemy', 'JWT authentication'],
    proof: 'Kaara Saaram: CRUD APIs with SQLAlchemy and Pydantic, replacing localStorage data with a live, tested backend.',
  },
  {
    id: 'data',
    name: 'Data',
    headline: 'Where everything lands.',
    summary: 'MySQL holds the restaurant platform’s data, and SQLite is in the toolbox for smaller jobs. When a page feels slow, the query is the first place I look.',
    items: ['MySQL', 'SQLite'],
    proof: 'YounderBots: database operations and query-efficiency work behind FastAPI endpoints.',
  },
]

export const alsoUse = {
  'Languages I write': ['Python', 'Java', 'C', 'JavaScript'],
  'Tools I work with': ['Git', 'GitHub', 'Figma', 'Canva', 'Jira'],
  'Habits I keep': ['REST API integration', 'Debugging', 'Performance optimization', 'Clean code practices'],
}

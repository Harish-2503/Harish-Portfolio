// Project data. Everything the Projects section shows comes from here.
//
// To add links: paste real URLs into githubUrl / liveUrl / caseStudy and save. A button appears only for a
// field that holds a valid http(s) URL, so an empty string never produces a dead link. Put screenshots in
// public/projects/ and set `image` to e.g. 'projects/name.png'. Then run `npm run check:links`
// (add `-- --online` to also confirm each URL responds).
//
// Field names: `stack` is the technology list and `summary` the description.
export const projects = [
  {
    id: 'kaara-saaram',
    title: 'Kaara Saaram',
    subtitle: 'Restaurant web application',
    stack: ['React', 'FastAPI', 'MySQL'],
    layers: ['interface', 'logic', 'data'],
    summary: 'A full-stack South Indian/Chettinad restaurant platform with menu, reservations, gallery, offers, and admin management modules.',
    bullets: [
      'Developed a full-stack South Indian/Chettinad restaurant platform with a React frontend and FastAPI + MySQL backend, covering menu, reservations, gallery, offers, and admin management modules.',
      'Built JWT-based authentication with role-based access control and RESTful CRUD APIs using SQLAlchemy and Pydantic, replacing localStorage-based data with live, tested backend integration.',
    ],
    githubUrl: '', // repository URL, e.g. 'https://github.com/Harish-2503/<repo>'. Empty = GitHub button hidden.
    liveUrl: '', // deployed demo URL. Empty = Live demo button hidden.
    image: '', // screenshot in public/projects/, e.g. 'projects/kaara-saaram.png'. Empty = placeholder shown.
    caseStudy: '', // optional write-up URL. Empty = button hidden.
    featured: true,
  },
  {
    id: 'virtual-trial-room',
    title: 'Virtual Trial Room',
    subtitle: 'WebAR e-commerce solution',
    stack: ['React.js', 'WebAR'],
    layers: ['interface'],
    badge: 'Best Project 2024',
    summary: 'A WebAR-powered virtual clothing try-on platform with real-time visualization.',
    bullets: [
      'Built a WebAR-powered virtual clothing try-on platform with real-time visualization, recognized as Best Project for improving user engagement and purchase confidence.',
    ],
    githubUrl: '', // repository URL, e.g. 'https://github.com/Harish-2503/<repo>'. Empty = GitHub button hidden.
    liveUrl: '', // deployed demo URL. Empty = Live demo button hidden.
    image: '', // screenshot in public/projects/, e.g. 'projects/kaara-saaram.png'. Empty = placeholder shown.
    caseStudy: '', // optional write-up URL. Empty = button hidden.
    featured: true,
  },
  {
    id: 'aakam-shine',
    title: 'Aakam Shine',
    subtitle: 'Startup ecosystem platform',
    stack: ['React.js'],
    layers: ['interface'],
    summary: 'A startup incubation platform for mentors, investors, events, and founders.',
    bullets: [
      'Engineered a scalable startup incubation platform integrating mentor networks, investor portals, event showcases, and founder dashboards into a unified digital experience with modular, reusable UI components.',
    ],
    githubUrl: '', // repository URL, e.g. 'https://github.com/Harish-2503/<repo>'. Empty = GitHub button hidden.
    liveUrl: '', // deployed demo URL. Empty = Live demo button hidden.
    image: '', // screenshot in public/projects/, e.g. 'projects/kaara-saaram.png'. Empty = placeholder shown.
    caseStudy: '', // optional write-up URL. Empty = button hidden.
    featured: true,
  },
  {
    id: 'kicks',
    title: 'Kicks',
    subtitle: 'Modern e-commerce platform',
    stack: ['React.js'],
    layers: ['interface'],
    summary: 'A sneaker e-commerce platform with product discovery, curated collections, and authentication workflows.',
    bullets: [
      'Designed and developed a sneaker e-commerce platform with product discovery, curated collections, authentication workflows, and a smooth, responsive end-to-end shopping experience.',
    ],
    githubUrl: '', // repository URL, e.g. 'https://github.com/Harish-2503/<repo>'. Empty = GitHub button hidden.
    liveUrl: '', // deployed demo URL. Empty = Live demo button hidden.
    image: '', // screenshot in public/projects/, e.g. 'projects/kaara-saaram.png'. Empty = placeholder shown.
    caseStudy: '', // optional write-up URL. Empty = button hidden.
    featured: true,
  },
]

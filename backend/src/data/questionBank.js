/**
 * questionBank.js
 * ────────────────
 * Static question pools for each interview type.
 * Each call to getQuestions() shuffles and returns a subset so every
 * session feels fresh without needing AI generation for the question phase.
 *
 * Extend later: pull from the user's resume skills to generate tailored questions.
 */

const QUESTIONS = {
  // ── Technical / General ──────────────────────────────────────────────────
  technical: [
    "Explain the difference between SQL and NoSQL databases. When would you choose one over the other?",
    "What is REST? Describe the key constraints of a RESTful API.",
    "Explain the concept of time complexity. What is Big-O notation?",
    "What is the difference between a stack and a queue? Give a real-world use case for each.",
    "What is caching? Describe two caching strategies.",
    "Explain the differences between authentication and authorisation.",
    "What is a race condition? How would you prevent one?",
    "Describe the SOLID principles in software design.",
    "What is the difference between monolithic and microservices architecture?",
    "How does HTTPS work? Explain the TLS handshake at a high level.",
    "What is a design pattern? Name three you have used and explain when.",
    "What is Docker and what problem does it solve?",
  ],

  // ── HR / Soft skills ─────────────────────────────────────────────────────
  hr: [
    "Tell me about yourself and your career journey so far.",
    "Why are you interested in this role and our company?",
    "Describe a situation where you had to meet a tight deadline. How did you manage it?",
    "Tell me about a time you disagreed with a teammate. How did you resolve it?",
    "What is your greatest professional strength? Give an example.",
    "What is an area you are actively working to improve? How?",
    "Where do you see yourself in 3–5 years?",
    "Describe a project you are proud of. What was your specific contribution?",
    "How do you prioritise tasks when everything feels urgent?",
    "Tell me about a time you received critical feedback. How did you react?",
    "What motivates you in your work day-to-day?",
    "How do you keep up with new technologies and industry trends?",
  ],

  // ── Behavioral (STAR-based) ───────────────────────────────────────────────
  behavioral: [
    "Describe a situation where you had to learn a new technology quickly. What was the outcome?",
    "Tell me about a time you failed at something. What did you learn from it?",
    "Describe a time when you had to lead a team without formal authority.",
    "Tell me about a situation where you identified a problem before it became critical.",
    "Describe a time you had to deliver bad news to a stakeholder. How did you handle it?",
    "Tell me about a project that required collaboration across different teams.",
    "Describe a time you had to push back on an unreasonable request.",
    "Tell me about a time you improved a process or workflow.",
    "Describe a situation where you had to make a decision with incomplete information.",
    "Tell me about a time you mentored or helped a junior colleague.",
  ],

  // ── React.js ─────────────────────────────────────────────────────────────
  react: [
    "Explain the Virtual DOM. How does React use it to improve performance?",
    "What is the difference between a controlled and an uncontrolled component?",
    "Explain the purpose and usage of useEffect. What is the dependency array?",
    "What is the Context API? When would you use it instead of props?",
    "Explain React.memo and useMemo. When should you use each?",
    "What is the difference between useCallback and useMemo?",
    "How does React reconciliation work?",
    "What are React Hooks? Name five built-in hooks and explain their use cases.",
    "Explain the concept of lifting state up with an example.",
    "What is prop drilling and how do you avoid it?",
    "What is the useReducer hook? When is it preferable to useState?",
    "How would you optimise a React app that is re-rendering too frequently?",
  ],

  // ── Node.js ───────────────────────────────────────────────────────────────
  node: [
    "Explain the Node.js event loop. What makes it non-blocking?",
    "What is the difference between require() and ES module import?",
    "How does Node.js handle concurrency if it is single-threaded?",
    "Explain streams in Node.js. What are the four types?",
    "What is the purpose of the cluster module?",
    "How do you handle uncaught exceptions and unhandled rejections in Node.js?",
    "Explain middleware in Express.js with an example.",
    "What is the difference between process.nextTick() and setImmediate()?",
    "How would you implement rate limiting on an API?",
    "Explain the difference between JWT and session-based authentication.",
    "What is CORS and how do you configure it in Express?",
    "How would you structure a large Node.js + Express application?",
  ],

  // ── Python ────────────────────────────────────────────────────────────────
  python: [
    "Explain the difference between a list, a tuple, and a set in Python.",
    "What are Python decorators and how do they work?",
    "Explain the GIL (Global Interpreter Lock) and its implications.",
    "What is the difference between deep copy and shallow copy?",
    "Explain list comprehensions and generator expressions.",
    "What are context managers? How do you create a custom one?",
    "Explain the difference between *args and **kwargs.",
    "What is duck typing in Python?",
    "How does Python manage memory? Explain garbage collection.",
    "What is the difference between @staticmethod, @classmethod, and instance methods?",
    "Explain Python's MRO (Method Resolution Order).",
    "How do you handle exceptions properly in Python?",
  ],

  // ── Data Structures & Algorithms ─────────────────────────────────────────
  dsa: [
    "Explain the difference between an array and a linked list. When is each preferred?",
    "What is a hash table? Explain collision resolution strategies.",
    "Explain binary search. What is its time complexity and what precondition is required?",
    "Describe the difference between BFS and DFS. Give a use case for each.",
    "What is dynamic programming? Explain with a simple example.",
    "Explain merge sort. What is its time and space complexity?",
    "What is a heap data structure? Where is it used?",
    "Explain the two-pointer technique. Give an example problem it solves.",
    "What is a trie? When would you use one?",
    "Explain Dijkstra's algorithm and its time complexity.",
    "What is the sliding window technique? Give an example.",
    "Describe the trade-offs between time and space complexity.",
  ],

  // ── Mixed (random selection across categories) ───────────────────────────
  mixed: [], // Populated dynamically in getQuestions()
};

/**
 * getQuestions
 * ─────────────
 * Returns a shuffled subset of questions for the given interview type.
 *
 * @param {string} type     - Interview type key
 * @param {number} count    - How many questions to return (default 7)
 * @returns {string[]}      - Array of question strings
 */
const getQuestions = (type, count = 7) => {
  let pool;

  if (type === "mixed") {
    // For mixed: draw from technical, hr, and behavioral equally
    const tech = shuffle([...QUESTIONS.technical]).slice(0, 3);
    const hr = shuffle([...QUESTIONS.hr]).slice(0, 2);
    const behavior = shuffle([...QUESTIONS.behavioral]).slice(0, 2);
    pool = shuffle([...tech, ...hr, ...behavior]);
  } else {
    pool = QUESTIONS[type] || QUESTIONS.technical;
  }

  return shuffle([...pool]).slice(0, count);
};

/** Fisher-Yates shuffle — returns a new shuffled array */
const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * INTERVIEW_TYPES
 * ────────────────
 * Metadata for each type — used by the frontend selection screen.
 */
const INTERVIEW_TYPES = [
  {
    id: "react",
    title: "React.js",
    description: "Hooks, state management, performance, and component design",
    icon: "⚛️",
    color: "brand",
    difficulty: "Intermediate",
    questionCount: 7,
  },
  {
    id: "node",
    title: "Node.js",
    description: "Event loop, Express, async patterns, and API design",
    icon: "🟢",
    color: "emerald",
    difficulty: "Intermediate",
    questionCount: 7,
  },
  {
    id: "technical",
    title: "Technical General",
    description: "Databases, system design, REST APIs, and architecture",
    icon: "⚙️",
    color: "violet",
    difficulty: "Intermediate",
    questionCount: 7,
  },
  {
    id: "dsa",
    title: "Data Structures & Algo",
    description: "Arrays, trees, graphs, sorting, and problem solving",
    icon: "📊",
    color: "amber",
    difficulty: "Hard",
    questionCount: 7,
  },
  {
    id: "hr",
    title: "HR Round",
    description: "Motivation, career goals, culture fit, and soft skills",
    icon: "🤝",
    color: "rose",
    difficulty: "Easy",
    questionCount: 7,
  },
  {
    id: "behavioral",
    title: "Behavioral",
    description: "STAR-based situational questions for past experiences",
    icon: "🧠",
    color: "orange",
    difficulty: "Medium",
    questionCount: 7,
  },
  {
    id: "python",
    title: "Python",
    description: "Core Python, OOP, decorators, async, and best practices",
    icon: "🐍",
    color: "teal",
    difficulty: "Intermediate",
    questionCount: 7,
  },
  {
    id: "mixed",
    title: "Mixed Interview",
    description: "Combination of technical, HR, and behavioral questions",
    icon: "🎯",
    color: "slate",
    difficulty: "Medium",
    questionCount: 7,
  },
];

module.exports = { getQuestions, INTERVIEW_TYPES };

/**
 * Skill dictionary used by every tool.
 * aliases: words that count as a mention in text
 * lang:    GitHub "primary language" name that proves the skill
 * deps:    package.json dependency names that prove the skill
 */
const SKILLS = {
  JavaScript: { aliases: ['javascript'], lang: 'JavaScript' },
  TypeScript: { aliases: ['typescript'], lang: 'TypeScript', deps: ['typescript'] },
  Python: { aliases: ['python'], lang: 'Python' },
  Java: { aliases: ['java'], lang: 'Java' },
  'C++': { aliases: ['c++'], lang: 'C++' },
  'C#': { aliases: ['c#'], lang: 'C#' },
  PHP: { aliases: ['php'], lang: 'PHP' },
  Go: { aliases: ['golang'], lang: 'Go' },
  Rust: { aliases: ['rust'], lang: 'Rust' },
  HTML: { aliases: ['html', 'html5'], lang: 'HTML' },
  CSS: { aliases: ['css', 'css3'], lang: 'CSS' },
  React: { aliases: ['react', 'react.js', 'reactjs'], deps: ['react'] },
  'Next.js': { aliases: ['next.js', 'nextjs'], deps: ['next'] },
  Vue: { aliases: ['vue', 'vue.js'], lang: 'Vue', deps: ['vue'] },
  Angular: { aliases: ['angular'], deps: ['@angular/core'] },
  Redux: { aliases: ['redux'], deps: ['redux', '@reduxjs/toolkit'] },
  'Tailwind CSS': { aliases: ['tailwind', 'tailwind css', 'tailwindcss'], deps: ['tailwindcss'] },
  'Framer Motion': { aliases: ['framer motion', 'framer-motion'], deps: ['framer-motion'] },
  'Node.js': { aliases: ['node.js', 'nodejs', 'node js'] },
  'Express.js': { aliases: ['express.js', 'expressjs', 'express js'], deps: ['express'] },
  'REST APIs': { aliases: ['rest api', 'rest apis', 'restful'] },
  GraphQL: { aliases: ['graphql'], deps: ['graphql'] },
  'JWT Authentication': { aliases: ['jwt', 'json web token'], deps: ['jsonwebtoken', 'jose'] },
  'Socket.io': { aliases: ['socket.io', 'socketio'], deps: ['socket.io', 'socket.io-client'] },
  Django: { aliases: ['django'] },
  Flask: { aliases: ['flask'] },
  'Spring Boot': { aliases: ['spring boot'] },
  MongoDB: { aliases: ['mongodb', 'mongo'], deps: ['mongodb', 'mongoose'] },
  Mongoose: { aliases: ['mongoose'], deps: ['mongoose'] },
  PostgreSQL: { aliases: ['postgresql', 'postgres'], deps: ['pg'] },
  MySQL: { aliases: ['mysql'], deps: ['mysql', 'mysql2'] },
  SQL: { aliases: ['sql'] },
  Redis: { aliases: ['redis'], deps: ['redis', 'ioredis'] },
  Firebase: { aliases: ['firebase'], deps: ['firebase'] },
  Prisma: { aliases: ['prisma'], deps: ['prisma', '@prisma/client'] },
  Git: { aliases: ['git'] },
  GitHub: { aliases: ['github'] },
  Docker: { aliases: ['docker'] },
  Vercel: { aliases: ['vercel'] },
  Netlify: { aliases: ['netlify'] },
  AWS: { aliases: ['aws', 'amazon web services'] },
  Postman: { aliases: ['postman'] },
  'CI/CD': { aliases: ['ci/cd', 'github actions'] },
  Jest: { aliases: ['jest'], deps: ['jest'] },
  OpenAI: { aliases: ['openai'], deps: ['openai'] },
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

// One compiled regex per skill. No "g" flag, so .test() has no hidden state.
for (const def of Object.values(SKILLS)) {
  const body = def.aliases.map(escapeRegex).join('|');
  def.regex = new RegExp(`(?<![a-z0-9+#])(?:${body})(?![a-z0-9+#])`, 'i');
}

const mentions = (name, text) => SKILLS[name].regex.test(text || '');

// Links such as github.com/you or you.netlify.app are contact details, not skill claims.
const stripLinks = (text) => (text || '').replace(/https?:\/\/\S+|\b[\w.-]+\.(?:com|app|dev)\b\S*/gi, ' ');

/** Returns the canonical names of every known skill mentioned in `text`. */
function extractSkills(text) {
  const body = stripLinks(text);
  return Object.keys(SKILLS).filter((name) => mentions(name, body));
}

module.exports = { SKILLS, mentions, extractSkills };

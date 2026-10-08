const HttpError = require('../utils/HttpError');
const { SKILLS, mentions, extractSkills } = require('./skills.service');
const { isValidUsername, getUser, getUserRepos, getReadme, getPackageDeps } = require('./github.service');

const REPO_LIMIT = 8;
const LEVELS = ['Strong', 'Moderate', 'Weak', 'No Evidence'];
const LEVEL_VALUE = { Strong: 100, Moderate: 65, Weak: 30, 'No Evidence': 0 };

const levelFor = (points) => (points >= 6 ? 'Strong' : points >= 3 ? 'Moderate' : points >= 1 ? 'Weak' : 'No Evidence');

/** Scores one skill against repo profiles. Pure function, easy to test. */
function scoreSkill(name, profiles) {
  const def = SKILLS[name];
  let points = 0;
  const evidence = [];
  for (const p of profiles) {
    let repoPoints = 0;
    const via = [];
    if (def.lang && p.language === def.lang) { repoPoints += 3; via.push('main language'); }
    if (def.deps?.some((d) => p.deps.includes(d))) { repoPoints += 3; via.push('dependency'); }
    if (p.topics.some((t) => mentions(name, t.replace(/-/g, ' ')))) { repoPoints += 3; via.push('topic'); }
    if (mentions(name, p.text)) { repoPoints += 2; via.push('description'); }
    if (mentions(name, p.readme)) { repoPoints += 2; via.push('README'); }
    if (repoPoints) {
      points += Math.min(repoPoints, 5);
      evidence.push({ repo: p.name, via });
    }
  }
  return { skill: name, points, level: levelFor(points), evidence: evidence.slice(0, 4) };
}

function summarize(rows) {
  const counts = Object.fromEntries(LEVELS.map((l) => [l, rows.filter((r) => r.level === l).length]));
  const trustScore = rows.length ? Math.round(rows.reduce((sum, r) => sum + LEVEL_VALUE[r.level], 0) / rows.length) : 0;
  const verdict =
    trustScore >= 75 ? 'Your claims are well backed by public work'
    : trustScore >= 50 ? 'Most of your claims have public proof'
    : trustScore >= 25 ? 'Some claims have proof, many do not'
    : 'There is little public proof for these claims yet';
  return { counts, trustScore, verdict };
}

async function verifyClaims({ username, resumeText }) {
  if (!isValidUsername(username)) throw new HttpError(400, 'Enter a valid GitHub username.');
  if (!resumeText || resumeText.length < 40) throw new HttpError(400, 'Upload your resume as a PDF or paste its text.');

  const claimed = extractSkills(resumeText);
  if (!claimed.length) throw new HttpError(422, 'No known technical skills were found in that resume.');

  const [user, allRepos] = await Promise.all([getUser(username), getUserRepos(username)]);
  const repos = allRepos.filter((r) => !r.fork).slice(0, REPO_LIMIT);

  const profiles = await Promise.all(
    repos.map(async (r) => {
      const isJs = ['JavaScript', 'TypeScript'].includes(r.language);
      const [readme, deps] = await Promise.all([
        getReadme(r.owner.login, r.name),
        isJs ? getPackageDeps(r.owner.login, r.name) : [],
      ]);
      return {
        name: r.name,
        language: r.language,
        topics: r.topics || [],
        text: `${r.name.replace(/[-_]/g, ' ')} ${r.description || ''}`,
        readme,
        deps,
      };
    })
  );

  const rows = claimed
    .map((name) => scoreSkill(name, profiles))
    .sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || b.points - a.points);

  return {
    username,
    avatar: user.avatar_url,
    publicRepos: user.public_repos,
    reposAnalyzed: profiles.length,
    skills: rows,
    gaps: rows.filter((r) => r.level === 'No Evidence').map((r) => r.skill),
    ...summarize(rows),
  };
}

module.exports = { verifyClaims, scoreSkill, summarize };

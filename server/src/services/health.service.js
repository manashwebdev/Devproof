const { parseRepo, getRepo, getReadme, getTreePaths } = require('./github.service');

const DAY = 24 * 60 * 60 * 1000;

/** Builds the checklist from repo data. Pure function, easy to test. */
function scoreRepo({ info, readme, paths }) {
  const has = (re) => paths.some((p) => re.test(p));
  const demoLink = /https?:\/\/\S*(vercel\.app|netlify\.app|onrender\.com|herokuapp\.com|github\.io|railway\.app|pages\.dev)/i;
  const recent = Date.now() - new Date(info.pushed_at).getTime() < 90 * DAY;

  const groups = [
    {
      name: 'Documentation',
      checks: [
        ['Has a README', 10, readme.length > 0, 'Add a README.md that explains what the project does.'],
        ['README is detailed', 6, readme.length >= 800, 'Expand the README beyond a few lines: purpose, features and decisions.'],
        ['Install steps', 6, /^#{1,6}.*(install|getting started|setup|set up)/im.test(readme), 'Add an "Installation" section with copy-paste commands.'],
        ['Usage instructions', 6, /(usage|how to use|running)/i.test(readme), 'Explain how to run and use the project.'],
        ['Screenshots', 6, /!\[[^\]]*\]\([^)]+\)|<img /i.test(readme), 'Add a screenshot or GIF so visitors see it in seconds.'],
        ['Features or tech stack', 6, /(features|tech stack|built with|technologies)/i.test(readme), 'List the features and the technologies used.'],
      ],
    },
    {
      name: 'Presentation',
      checks: [
        ['Repository description', 5, Boolean(info.description), 'Write a one-line description in the repo settings.'],
        ['Three or more topics', 5, (info.topics || []).length >= 3, 'Add topics such as react, nodejs and mongodb so people can find it.'],
        ['Live demo link', 10, Boolean(info.homepage) || demoLink.test(readme), 'Deploy it and add the live link to the repo website field and README.'],
        ['License', 5, Boolean(info.license), 'Add a LICENSE file (MIT is a common choice).'],
      ],
    },
    {
      name: 'Structure',
      checks: [
        ['Automated tests', 8, has(/(^|\/)(__tests__|tests?|spec)\/|\.(test|spec)\.[jt]sx?$/i), 'Add a few tests for the core logic. Recruiters look for them.'],
        ['CI workflow', 6, has(/^\.github\/workflows\//), 'Add a GitHub Actions workflow that runs your tests on every push.'],
        ['.gitignore', 3, has(/^\.gitignore$/), 'Add a .gitignore so build and dependency folders stay out of Git.'],
        ['.env.example', 3, has(/^(.*\/)?\.env\.example$/), 'Add a .env.example so others know which variables to set.'],
        ['No committed secrets or dependencies', 5, !has(/(^|\/)node_modules\//) && !has(/(^|\/)\.env$/), 'Remove node_modules or .env from Git and rotate any exposed keys.'],
      ],
    },
    {
      name: 'Activity',
      checks: [
        ['Updated in the last 90 days', 6, recent, 'Push a small improvement. Fresh activity shows the project is alive.'],
        ['Organized source folders', 4, has(/^(src|app|server|client|lib)\//), 'Group code into folders like src/, server/ and client/.'],
      ],
    },
  ].map((group) => {
    const checks = group.checks.map(([label, weight, passed, tip]) => ({ label, weight, passed, tip }));
    return {
      name: group.name,
      max: checks.reduce((s, c) => s + c.weight, 0),
      score: checks.filter((c) => c.passed).reduce((s, c) => s + c.weight, 0),
      checks,
    };
  });

  const score = groups.reduce((s, g) => s + g.score, 0);
  const recommendations = groups
    .flatMap((g) => g.checks.filter((c) => !c.passed).map((c) => ({ area: g.name, tip: c.tip, weight: c.weight })))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  return {
    score,
    grade: score >= 85 ? 'Portfolio ready' : score >= 65 ? 'Nearly there' : score >= 40 ? 'Needs work' : 'Early stage',
    categories: groups,
    recommendations,
  };
}

async function analyzeRepo(input) {
  const { owner, repo } = parseRepo(input);
  const info = await getRepo(owner, repo);
  const [readme, paths] = await Promise.all([getReadme(owner, repo), getTreePaths(owner, repo, info.default_branch)]);
  return {
    repo: info.full_name,
    url: info.html_url,
    stars: info.stargazers_count,
    language: info.language,
    ...scoreRepo({ info, readme, paths }),
  };
}

module.exports = { analyzeRepo, scoreRepo };

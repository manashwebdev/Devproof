const { remember } = require('../utils/cache');
const HttpError = require('../utils/HttpError');

const API = 'https://api.github.com';
const TEN_MINUTES = 10 * 60 * 1000;

const USERNAME_RE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
const isValidUsername = (name) => USERNAME_RE.test(name || '');

function parseRepo(input) {
  const value = String(input || '').trim().replace(/\.git$/, '');
  const match = value.match(/^(?:https?:\/\/github\.com\/)?([\w.-]+)\/([\w.-]+?)(?:\/.*)?$/i);
  if (!match) throw new HttpError(400, 'Enter a repository as owner/name or paste its GitHub link.');
  return { owner: match[1], repo: match[2] };
}

function headers(accept = 'application/vnd.github+json') {
  const h = { Accept: accept, 'User-Agent': 'devproof', 'X-GitHub-Api-Version': '2022-11-28' };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function gh(path, { raw = false, optional = false } = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: headers(raw ? 'application/vnd.github.raw+json' : undefined),
  });
  if (res.status === 404 || res.status === 409) {
    if (optional) return null;
    throw new HttpError(404, 'GitHub could not find that user or repository.');
  }
  if (res.status === 403 || res.status === 429) {
    throw new HttpError(429, 'GitHub rate limit reached. Add a GITHUB_TOKEN to server/.env or try again later.');
  }
  if (!res.ok) throw new HttpError(502, `GitHub returned an unexpected error (${res.status}).`);
  return raw ? res.text() : res.json();
}

const getUser = (name) => remember(`user:${name}`, TEN_MINUTES, () => gh(`/users/${name}`));

const getUserRepos = (name) =>
  remember(`repos:${name}`, TEN_MINUTES, () => gh(`/users/${name}/repos?per_page=100&sort=pushed`));

const getRepo = (owner, repo) => remember(`repo:${owner}/${repo}`, TEN_MINUTES, () => gh(`/repos/${owner}/${repo}`));

const getReadme = (owner, repo) =>
  remember(`readme:${owner}/${repo}`, TEN_MINUTES, async () => {
    const text = await gh(`/repos/${owner}/${repo}/readme`, { raw: true, optional: true });
    return text ? text.slice(0, 20000) : '';
  });

const getPackageDeps = (owner, repo) =>
  remember(`deps:${owner}/${repo}`, TEN_MINUTES, async () => {
    const text = await gh(`/repos/${owner}/${repo}/contents/package.json`, { raw: true, optional: true });
    try {
      const pkg = JSON.parse(text || '{}');
      return Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    } catch {
      return [];
    }
  });

const getTreePaths = (owner, repo, branch) =>
  remember(`tree:${owner}/${repo}`, TEN_MINUTES, async () => {
    const data = await gh(`/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`, { optional: true });
    return (data?.tree || []).map((node) => node.path);
  });

module.exports = {
  isValidUsername,
  parseRepo,
  getUser,
  getUserRepos,
  getRepo,
  getReadme,
  getPackageDeps,
  getTreePaths,
};

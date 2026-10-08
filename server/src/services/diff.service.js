const { extractSkills } = require('./skills.service');

const clean = (line) => line.replace(/\s+/g, ' ').trim();
const toLines = (text) => text.split('\n').map(clean).filter((l) => l.length > 2);
const words = (text) => new Set(text.toLowerCase().match(/[a-z0-9+#.]{3,}/g) || []);

function measure(text) {
  const lines = toLines(text);
  return {
    skills: extractSkills(text).length,
    words: (text.match(/\S+/g) || []).length,
    numbers: (text.match(/\b\d+(?:\.\d+)?%?/g) || []).length,
    bullets: lines.filter((l) => /^[•\-*▪●]/.test(l)).length,
    links: (text.match(/https?:\/\/\S+|github\.com\S*|linkedin\.com\S*/gi) || []).length,
  };
}

// A rough, explainable score: more skills, proof numbers, bullets and links read as stronger.
const strength = (m) => Math.min(100, Math.round(m.skills * 3 + Math.min(m.numbers, 15) * 2.5 + Math.min(m.bullets, 20) * 1.5 + Math.min(m.links, 4) * 5));

function compareResumes(beforeText, afterText) {
  const beforeSkills = extractSkills(beforeText);
  const afterSkills = extractSkills(afterText);

  const beforeLines = toLines(beforeText);
  const afterLines = toLines(afterText);
  const beforeSet = new Set(beforeLines.map((l) => l.toLowerCase()));
  const afterSet = new Set(afterLines.map((l) => l.toLowerCase()));

  const a = words(beforeText);
  const b = words(afterText);
  const shared = [...a].filter((w) => b.has(w)).length;
  const similarity = Math.round((shared / (new Set([...a, ...b]).size || 1)) * 100);

  const before = measure(beforeText);
  const after = measure(afterText);
  const beforeStrength = strength(before);
  const afterStrength = strength(after);
  const delta = afterStrength - beforeStrength;

  const signals = [
    ['Skills listed', 'skills'],
    ['Words', 'words'],
    ['Numbers and metrics', 'numbers'],
    ['Bullet points', 'bullets'],
    ['Links', 'links'],
  ].map(([label, key]) => ({ label, before: before[key], after: after[key], change: after[key] - before[key] }));

  return {
    similarity,
    beforeStrength,
    afterStrength,
    delta,
    verdict:
      delta > 5 ? 'The new version reads stronger'
      : delta < -5 ? 'The new version reads weaker'
      : 'The two versions are about equally strong',
    skills: {
      added: afterSkills.filter((s) => !beforeSkills.includes(s)),
      removed: beforeSkills.filter((s) => !afterSkills.includes(s)),
      kept: afterSkills.filter((s) => beforeSkills.includes(s)),
    },
    lines: {
      added: afterLines.filter((l) => !beforeSet.has(l.toLowerCase())).slice(0, 40),
      removed: beforeLines.filter((l) => !afterSet.has(l.toLowerCase())).slice(0, 40),
    },
    signals,
  };
}

module.exports = { compareResumes };

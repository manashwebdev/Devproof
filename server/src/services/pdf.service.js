const pdfParse = require('pdf-parse/lib/pdf-parse.js');
const HttpError = require('../utils/HttpError');

async function extractText(buffer) {
  let data;
  try {
    data = await pdfParse(buffer);
  } catch {
    throw new HttpError(422, 'That PDF could not be read. Try exporting it again.');
  }
  const text = (data.text || '').replace(/\r/g, '').trim();
  if (text.length < 40) {
    throw new HttpError(422, 'No text found in that PDF. Scanned images are not supported, so paste the text instead.');
  }
  return text;
}

module.exports = { extractText };

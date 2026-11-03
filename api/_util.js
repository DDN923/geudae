// 공통 유틸 — 《사랑하는 그대에게》 SVG
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clean = s => String(s == null ? '' : s).replace(/\+/g, ' ').replace(/\s+/g, ' ').trim();

// 글자 폭 추정: 한글·한자·이모지 = 1em, 공백 0.3em, 나머지 0.55em
const textWidth = (s, size = 15, bold = false) => {
  let w = 0;
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if ((c >= 0xac00 && c <= 0xd7a3) || (c >= 0x3130 && c <= 0x318f) || (c >= 0x4e00 && c <= 0x9fff) || c > 0xffff) w += 0.94;
    else if (ch === ' ') w += 0.3;
    else w += 0.56;
  }
  return w * size * (bold ? 1.05 : 1);
};

// 줄바꿈: 어절 단위(keep-all), 한 어절이 넘치면 글자 단위. maxLines 넘으면 말줄임
const wrap = (text, maxW, size, maxLines = 2, bold = false) => {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  const push = () => { lines.push(cur); cur = ''; };
  for (const word of words) {
    const tryLine = cur ? cur + ' ' + word : word;
    if (textWidth(tryLine, size, bold) <= maxW) { cur = tryLine; continue; }
    if (cur) push();
    if (textWidth(word, size, bold) <= maxW) { cur = word; continue; }
    for (const ch of word) {
      if (textWidth(cur + ch, size, bold) > maxW) push();
      cur += ch;
    }
  }
  if (cur) push();
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last && textWidth(last + '…', size, bold) > maxW) last = [...last].slice(0, -1).join('');
    kept[maxLines - 1] = last + '…';
    return kept;
  }
  return lines;
};

const FONT = "'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif";

const send = (res, svg) => {
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(svg);
};

module.exports = { esc, clean, textWidth, wrap, FONT, send };

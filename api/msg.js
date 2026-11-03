// 《사랑하는 그대에게》 문자 화면 (405×720)
// GET /api/msg?t=HH:MM&m=L.이환+메시지~R.라영+메시지
//   t: 시간 / m: 말풍선(~로 구분, L.=이환 왼쪽, R.=라영 오른쪽, 띄어쓰기는 +)
const { esc, clean, textWidth, wrap, FONT, send } = require('./_util');

const W = 405, H = 720;
const BLUE = '#0A6CE0';
const SIZE = 15, LH = 21, MAXW = 240;

const timeLabel = t => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (!m) return '오늘';
  let h = +m[1];
  const ap = h < 12 ? '오전' : '오후';
  h = h % 12 || 12;
  return `오늘 ${ap} ${h}:${m[2]}`;
};

module.exports = (req, res) => {
  const q = req.query || {};
  const t = clean(q.t).slice(0, 5);
  const raw = String(q.m == null ? '' : q.m);
  let msgs = raw.split(/[~|]/).map(x => clean(x)).filter(Boolean).map(x => {
    const mm = /^([LlRr])[.:]?\s*/.exec(x);
    const who = mm && mm[1].toUpperCase() === 'R' ? 'R' : 'L';
    const text = (mm ? x.slice(mm[0].length) : x).slice(0, 40);
    return { who, lines: wrap(text || '…', MAXW, SIZE, 3) };
  }).slice(-8);

  // 아래(입력창 위)에서 넘치면 위쪽 말풍선부터 버림
  const TOP = 150, BOTTOM = 636;
  const heightOf = (list) => {
    const lastR = list.map(m => m.who).lastIndexOf('R');
    return list.reduce((s, m, i) => s + m.lines.length * LH + 16 + 4 + (i === lastR ? 18 : 0), 0);
  };
  while (msgs.length > 1 && TOP + heightOf(msgs) > BOTTOM) msgs = msgs.slice(1);
  const lastR = msgs.map(m => m.who).lastIndexOf('R');

  let y = TOP, body = '';
  msgs.forEach((m, i) => {
    const tw = Math.ceil(Math.max(...m.lines.map(l => textWidth(l, SIZE))));
    const bw = Math.min(tw, MAXW) + 28;
    const bh = m.lines.length * LH + 16;
    const x = m.who === 'L' ? 14 : W - 14 - bw;
    const fill = m.who === 'L' ? '#E9E9EB' : BLUE;
    const color = m.who === 'L' ? '#111114' : '#FFFFFF';
    body += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="18" fill="${fill}"/>`;
    m.lines.forEach((l, k) => {
      body += `<text x="${x + 14}" y="${y + 8 + 15 + k * LH}" fill="${color}">${esc(l)}</text>`;
    });
    y += bh + 4;
    if (i === lastR) {
      body += `<text x="${W - 18}" y="${y + 10}" font-size="11" fill="#6E6E73" text-anchor="end">읽음</text>`;
      y += 18;
    }
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="${FONT}" font-size="${SIZE}">`
    + `<rect width="${W}" height="${H}" rx="22" fill="#FFFFFF"/>`
    // 헤더
    + `<path d="M0 22a22 22 0 0 1 22-22h${W - 44}a22 22 0 0 1 22 22v84H0z" fill="#F7F7F9"/><path d="M0 106h${W}" stroke="#E3E3E8"/>`
    + `<path d="M31 37l-9 9 9 9" fill="none" stroke="${BLUE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<circle cx="${W / 2}" cy="44" r="24" fill="#8E939C"/><text x="${W / 2}" y="51" font-size="20" font-weight="500" fill="#FFFFFF" text-anchor="middle">이</text>`
    + `<text x="${W / 2 - 4}" y="90" font-size="12" fill="#111114" text-anchor="middle">이환</text>`
    + `<path d="M${W / 2 + 12} 82l4 4-4 4" fill="none" stroke="#8E939C" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`
    // 시간
    + `<text x="${W / 2}" y="132" font-size="11" fill="#6E6E73" text-anchor="middle">${esc(timeLabel(t))}</text>`
    + body
    // 입력창
    + `<circle cx="32" cy="672" r="18" fill="#E9E9EB"/><path d="M32 664v16M24 672h16" stroke="#6E6E73" stroke-width="2" stroke-linecap="round"/>`
    + `<rect x="58.5" y="654.5" width="333" height="35" rx="17.5" fill="#FFFFFF" stroke="#C9C9CF"/>`
    + `<text x="74" y="677" fill="#8E8E93">메시지</text>`
    + `<circle cx="373" cy="672" r="14" fill="${BLUE}"/><path d="M373 679v-13M368 671l5-5 5 5" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`
    + `</svg>`;
  send(res, svg);
};

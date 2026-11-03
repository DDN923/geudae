// 《사랑하는 그대에게》 서진 라운지 HOT게시판 (405×720)
// GET /api/comm?p=제목|미리보기|공감|댓글수~제목|미리보기|공감|댓글수~...&c=댓글~댓글~댓글
//   p: 글(~로 구분, 필드는 |) / c: 첫 글 댓글(~로 구분) / 띄어쓰기는 +
const { esc, clean, textWidth, wrap, FONT, send } = require('./_util');

const W = 405, H = 720;
const GREEN = '#1E6B52';
const AGO = ['방금', '4분 전', '9분 전', '15분 전'];
const num = s => { const n = parseInt(String(s).replace(/[^0-9]/g, ''), 10); return isNaN(n) ? 0 : Math.min(n, 9999); };

module.exports = (req, res) => {
  const q = req.query || {};
  const posts = String(q.p == null ? '' : q.p).split('~').map(x => x.split('|').map(clean)).filter(f => f[0]).slice(0, 4)
    .map((f, i) => ({ title: f[0].slice(0, 40), preview: (f[1] || '').slice(0, 60), likes: num(f[2]), comments: num(f[3]), ago: AGO[i] }));
  const comments = String(q.c == null ? '' : q.c).split('~').map(clean).filter(Boolean).slice(0, 3).map(s => s.slice(0, 40));

  let body = '';
  let y = 112;
  const CW = W - 32;
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    const tl = wrap(p.title, CW, 15, 2, true);
    const pl = p.preview ? wrap(p.preview, CW, 13, 2) : [];
    const cl = i === 0 ? comments.map(c => wrap(c, CW - 24, 13, 2)) : [];
    let h = 14 + tl.length * 21 + (pl.length ? 4 + pl.length * 19 : 0) + 8 + 18 + 14;
    if (cl.length) h += 8 + 8 + cl.reduce((s, l) => s + 8 + 17 + l.length * 19 + 8, 0);
    if (y + h > H - 6) break;

    let g = `<rect x="0" y="${y}" width="${W}" height="${h}" fill="#FFFFFF"/>`;
    let cy = y + 14;
    tl.forEach(l => { g += `<text x="16" y="${cy + 16}" font-size="15" font-weight="700" fill="#17191C">${esc(l)}</text>`; cy += 21; });
    if (pl.length) { cy += 4; pl.forEach(l => { g += `<text x="16" y="${cy + 14}" font-size="13" fill="#5B6068">${esc(l)}</text>`; cy += 19; }); }
    cy += 8;
    const my = cy + 13;
    g += `<text x="16" y="${my}" font-size="12" fill="#6B7079">익명 · ${p.ago}</text>`;
    const cStr = String(p.comments), lStr = String(p.likes);
    const cX = W - 16 - textWidth(cStr, 12);
    const lX = cX - 18 - 10 - textWidth(lStr, 12);
    g += `<g transform="translate(${lX - 16},${my - 11})" fill="none" stroke="#B4441A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6.5V12H2V6.5zM4 6.5 6.5 2c1 0 1.6.7 1.4 1.7L7.5 5.5H11c.8 0 1.3.7 1.1 1.4l-1 4c-.2.7-.7 1.1-1.4 1.1H4"/></g>`;
    g += `<text x="${lX}" y="${my}" font-size="12" fill="#B4441A">${lStr}</text>`;
    g += `<g transform="translate(${cX - 16},${my - 11})" fill="none" stroke="${GREEN}" stroke-width="1.5" stroke-linejoin="round"><path d="M2 3h10v6.5H6L3 12V9.5H2z"/></g>`;
    g += `<text x="${cX}" y="${my}" font-size="12" fill="${GREEN}">${cStr}</text>`;
    cy += 18;
    if (cl.length) {
      cy += 8;
      const boxTop = cy;
      const boxH = 8 + cl.reduce((s, l) => s + 8 + 17 + l.length * 19 + 8, 0);
      g += `<rect x="16" y="${boxTop}" width="${CW}" height="${boxH}" rx="10" fill="#F2F3EF"/>`;
      cy += 4;
      cl.forEach((l, k) => {
        cy += 8;
        g += `<text x="28" y="${cy + 12}" font-size="12" font-weight="700" fill="#4A4F57">익명${k + 1}</text>`;
        cy += 17;
        l.forEach(line => { g += `<text x="28" y="${cy + 14}" font-size="13" fill="#17191C">${esc(line)}</text>`; cy += 19; });
        cy += 8;
        if (k < cl.length - 1) g += `<path d="M28 ${cy}h${CW - 24}" stroke="#E2E4DE"/>`;
      });
    }
    body += g;
    y += h + 8;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="${FONT}">`
    + `<defs><clipPath id="r"><rect width="${W}" height="${H}" rx="22"/></clipPath></defs>`
    + `<g clip-path="url(#r)"><rect width="${W}" height="${H}" fill="#F2F3EF"/>`
    // 헤더
    + `<rect width="${W}" height="104" fill="#FFFFFF"/><path d="M0 104.5h${W}" stroke="#E2E4DE"/>`
    + `<rect x="16" y="18" width="30" height="30" rx="8" fill="${GREEN}"/>`
    + `<g transform="translate(23,25)" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13V6l5-3 5 3v7"/><path d="M6.5 13V9.5h3V13"/></g>`
    + `<text x="54" y="33" font-size="18" font-weight="700" fill="#17191C" letter-spacing="-0.3">서진 라운지</text>`
    + `<text x="54" y="49" font-size="11" fill="#6B7079">서진대학교 익명 커뮤니티</text>`
    + `<g transform="translate(368,23)" fill="none" stroke="#4A4F57" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 4 4"/></g>`
    + `<text x="16" y="88" font-size="14" font-weight="700" fill="${GREEN}">HOT게시판</text><rect x="16" y="100" width="${Math.ceil(textWidth('HOT게시판', 14, true))}" height="2.5" fill="${GREEN}"/>`
    + `<text x="${16 + Math.ceil(textWidth('HOT게시판', 14, true)) + 18}" y="88" font-size="14" fill="#6B7079">자유게시판</text>`
    + `<text x="${16 + Math.ceil(textWidth('HOT게시판', 14, true)) + 18 + Math.ceil(textWidth('자유게시판', 14)) + 18}" y="88" font-size="14" fill="#6B7079">비밀게시판</text>`
    + body
    + `</g></svg>`;
  send(res, svg);
};

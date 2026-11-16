// parse.js — a hand-written, dependency-free drop-in replacement for
// marked 18.1.3 (GFM on, breaks off, pedantic off, async off).
// Written from the CommonMark 0.31.2 + GFM spec rules and the observed
// behaviour of the reference on the practice set. No code is copied
// from marked or from any other parser; every line below is original.
//
// Layout: entity table, small helpers, the inline parser, then the
// block parser. parse(markdown) returns exactly the HTML string.

// parse(markdown) is defined below (the incremental block parser).

// ---------------------------------------------------------------- entities
// Named character references (a broad subset of the HTML5 list: the ones
// the practice set and the generated documents use, plus the common
// Latin, Greek, punctuation, math and symbol names). Case sensitive.
const ENT = {
  quot: '"', amp: '&', apos: "'", lt: '<', gt: '>', nbsp: '\u00a0',
  iexcl: '\u00a1', cent: '\u00a2', pound: '\u00a3', curren: '\u00a4',
  yen: '\u00a5', brvbar: '\u00a6', sect: '\u00a7', uml: '\u00a8',
  copy: '\u00a9', ordf: '\u00aa', laquo: '\u00ab', not: '\u00ac',
  shy: '\u00ad', reg: '\u00ae', macr: '\u00af', deg: '\u00b0',
  plusmn: '\u00b1', sup2: '\u00b2', sup3: '\u00b3', acute: '\u00b4',
  micro: '\u00b5', para: '\u00b6', middot: '\u00b7', cedil: '\u00b8',
  sup1: '\u00b9', ordm: '\u00ba', raquo: '\u00bb', frac14: '\u00bc',
  frac12: '\u00bd', frac34: '\u00be', iquest: '\u00bf',
  Agrave: '\u00c0', Aacute: '\u00c1', Acirc: '\u00c2', Atilde: '\u00c3',
  Auml: '\u00c4', Aring: '\u00c5', AElig: '\u00c6', Ccedil: '\u00c7',
  Egrave: '\u00c8', Eacute: '\u00c9', Ecirc: '\u00ca', Euml: '\u00cb',
  Igrave: '\u00cc', Iacute: '\u00cd', Icirc: '\u00ce', Iuml: '\u00cf',
  ETH: '\u00d0', Ntilde: '\u00d1', Ograve: '\u00d2', Oacute: '\u00d3',
  Ocirc: '\u00d4', Otilde: '\u00d5', Ouml: '\u00d6', times: '\u00d7',
  Oslash: '\u00d8', Ugrave: '\u00d9', Uacute: '\u00da', Ucirc: '\u00db',
  Uuml: '\u00dc', Yacute: '\u00dd', THORN: '\u00de', szlig: '\u00df',
  agrave: '\u00e0', aacute: '\u00e1', acirc: '\u00e2', atilde: '\u00e3',
  auml: '\u00e4', aring: '\u00e5', aelig: '\u00e6', ccedil: '\u00e7',
  egrave: '\u00e8', eacute: '\u00e9', ecirc: '\u00ea', euml: '\u00eb',
  igrave: '\u00ec', iacute: '\u00ed', icirc: '\u00ee', iuml: '\u00ef',
  eth: '\u00f0', ntilde: '\u00f1', ograve: '\u00f2', oacute: '\u00f3',
  ocirc: '\u00f4', otilde: '\u00f5', ouml: '\u00f6', divide: '\u00f7',
  oslash: '\u00f8', ugrave: '\u00f9', uacute: '\u00fa', ucirc: '\u00fb',
  uuml: '\u00fc', yacute: '\u00fd', thorn: '\u00fe', yuml: '\u00ff',
  OElig: '\u0152', oelig: '\u0153', Scaron: '\u0160', scaron: '\u0161',
  Yuml: '\u0178', fnof: '\u0192', circ: '\u02c6', tilde: '\u02dc',
  Dcaron: '\u010e', dcaron: '\u010f', Zcaron: '\u017d', zcaron: '\u017e',
  Alpha: '\u0391', Beta: '\u0392', Gamma: '\u0393', Delta: '\u0394',
  Epsilon: '\u0395', Zeta: '\u0396', Eta: '\u0397', Theta: '\u0398',
  Iota: '\u0399', Kappa: '\u039a', Lambda: '\u039b', Mu: '\u039c',
  Nu: '\u039d', Xi: '\u039e', Omicron: '\u039f', Pi: '\u03a0',
  Rho: '\u03a1', Sigma: '\u03a3', Tau: '\u03a4', Upsilon: '\u03a5',
  Phi: '\u03a6', Chi: '\u03a7', Psi: '\u03a8', Omega: '\u03a9',
  alpha: '\u03b1', beta: '\u03b2', gamma: '\u03b3', delta: '\u03b4',
  epsilon: '\u03b5', zeta: '\u03b6', eta: '\u03b7', theta: '\u03b8',
  iota: '\u03b9', kappa: '\u03ba', lambda: '\u03bb', mu: '\u03bc',
  nu: '\u03bd', xi: '\u03be', omicron: '\u03bf', pi: '\u03c0',
  rho: '\u03c1', sigmaf: '\u03c2', sigma: '\u03c3', tau: '\u03c4',
  upsilon: '\u03c5', phi: '\u03c6', chi: '\u03c7', psi: '\u03c8',
  omega: '\u03c9', thetasym: '\u03d1', upsih: '\u03d2', piv: '\u03d6',
  ensp: '\u2002', emsp: '\u2003', thinsp: '\u2009', zwnj: '\u200c',
  zwj: '\u200d', lrm: '\u200e', rlm: '\u200f', ndash: '\u2013',
  mdash: '\u2014', lsquo: '\u2018', rsquo: '\u2019', sbquo: '\u201a',
  ldquo: '\u201c', rdquo: '\u201d', bdquo: '\u201e', dagger: '\u2020',
  Dagger: '\u2021', bull: '\u2022', hellip: '\u2026', permil: '\u2030',
  prime: '\u2032', Prime: '\u2033', lsaquo: '\u2039', rsaquo: '\u203a',
  oline: '\u203e', frasl: '\u2044', euro: '\u20ac',
  image: '\u2111', weierp: '\u2118', real: '\u211c', trade: '\u2122',
  TRADE: '\u2122', alefsym: '\u2135', larr: '\u2190', uarr: '\u2191',
  rarr: '\u2192', darr: '\u2193', harr: '\u2194', crarr: '\u21b5',
  lArr: '\u21d0', uArr: '\u21d1', rArr: '\u21d2', dArr: '\u21d3',
  hArr: '\u21d4', forall: '\u2200', part: '\u2202', exist: '\u2203',
  empty: '\u2205', nabla: '\u2207', isin: '\u2208', notin: '\u2209',
  ni: '\u220b', prod: '\u220f', sum: '\u2211', minus: '\u2212',
  lowast: '\u2217', radic: '\u221a', prop: '\u221d', infin: '\u221e',
  ang: '\u2220', and: '\u2227', or: '\u2228', cap: '\u2229',
  cup: '\u222a', int: '\u222b', there4: '\u2234', sim: '\u223c',
  cong: '\u2245', asymp: '\u2248', ne: '\u2260', equiv: '\u2261',
  le: '\u2264', ge: '\u2265', sub: '\u2282', sup: '\u2283',
  nsub: '\u2284', sube: '\u2286', supe: '\u2287', oplus: '\u2295',
  otimes: '\u2297', perp: '\u22a5', sdot: '\u22c5',
  lceil: '\u2308', rceil: '\u2309', lfloor: '\u230a', rfloor: '\u230b',
  lang: '\u2329', rang: '\u232a', loz: '\u25ca', spades: '\u2660',
  clubs: '\u2663', hearts: '\u2665', diams: '\u2666',
  Tab: '\t', NewLine: '\n', colon: ':', sol: '/', bsol: '\\',
  comma: ',', period: '.', semi: ';', equals: '=', quest: '?',
 lpar: '(', rpar: ')', lbrack: '[', rbrack: ']', lcub: '{', rcub: '}',
  excl: '!', num: '#', dollar: '$', percnt: '%', ast: '*', plus: '+',
  commat: '@', Hat: '^', lowbar: '_', grave: '`', vert: '|',
  check: '\u2713', cross: '\u2717', star: '\u2605', phone: '\u260e',
  female: '\u2640', male: '\u2642', awconint: '\u2233',
  ClockwiseContourIntegral: '\u2232', DifferentialD: '\u2146',
  HilbertSpace: '\u210b', ngE: '\u2267',
};

// ---------------------------------------------------------------- helpers
const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const ESC_RE = /[&<>"']/g;
function esc(s) {
  return s.replace(ESC_RE, (c) => ESC_MAP[c]);
}

// Decode one character reference starting at s[i] === '&'.
// Returns { ch, next } or null when it is not a valid reference.
function decodeRef(s, i) {
  const n = s.length;
  let j = i + 1;
  if (j >= n) return null;
  if (s[j] === '#') {
    j++;
    let hex = false;
    if (j < n && (s[j] === 'x' || s[j] === 'X')) { hex = true; j++; }
    const start = j;
    while (j < n) {
      const c = s.charCodeAt(j);
      if (hex ? (c >= 48 && c <= 57) || (c >= 65 && c <= 70) || (c >= 97 && c <= 102)
              : (c >= 48 && c <= 57)) j++;
      else break;
    }
    if (j === start || j >= n || s[j] !== ';') return null;
    const cp = parseInt(s.slice(start, j), hex ? 16 : 10);
    const ch = (!cp || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff))
      ? '\ufffd' : String.fromCodePoint(cp);
    return { ch, next: j + 1 };
  }
  // named: letters/digits, must end with ';'
  const start = j;
  while (j < n) {
    const c = s.charCodeAt(j);
    if ((c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122)) j++;
    else break;
  }
  if (j === start || j >= n || s[j] !== ';') return null;
  const name = s.slice(start, j);
  const ch = ENT[name];
  if (ch === undefined) return null;
  return { ch, next: j + 1 };
}

// Decode a numeric character reference starting at s[i] === '&'.
// Returns { ch, next } or null (not a valid numeric reference: malformed,
// out of range, or a surrogate).
function decodeNumericRef(s, i) {
  const n = s.length;
  let j = i + 1;
  if (j >= n || s[j] !== '#') return null;
  j++;
  let hex = false;
  if (j < n && (s[j] === 'x' || s[j] === 'X')) { hex = true; j++; }
  const start = j;
  while (j < n) {
    const c = s.charCodeAt(j);
    if (hex ? (c >= 48 && c <= 57) || (c >= 65 && c <= 70) || (c >= 97 && c <= 102)
            : (c >= 48 && c <= 57)) j++;
    else break;
  }
  if (j === start || j >= n || s[j] !== ';') return null;
  const cp = parseInt(s.slice(start, j), hex ? 16 : 10);
  if (cp > 0x10ffff) return null;
  const ch = (!cp || (cp >= 0xd800 && cp <= 0xdfff))
    ? '\ufffd' : String.fromCodePoint(cp);
  return { ch, next: j + 1 };
}

// Escape a whole string, but leave anything that looks like a character
// reference (&name; &#123; &#xAB;) untouched, as marked does.
const ESC_NO_ENCODE_RE = /[<>"']|&(?!(#\d+|#x[0-9a-fA-F]+|\w+);)/g;
function escText(s) {
  if (s.indexOf('&') < 0 && s.indexOf('<') < 0 && s.indexOf('>') < 0 &&
      s.indexOf('"') < 0 && s.indexOf("'") < 0) return s;
  return s.replace(ESC_NO_ENCODE_RE, (c) => ESC_MAP[c]);
}
// Strict escape: every & < > " ' is encoded (code spans / code blocks).
function escStrict(s) {
  if (s.indexOf('&') < 0 && s.indexOf('<') < 0 && s.indexOf('>') < 0 &&
      s.indexOf('"') < 0 && s.indexOf("'") < 0) return s;
  return esc(s);
}
// Length of the entity-like pattern starting at s[i] === '&' (0 if none).
// Mirrors marked's escape lookahead: &#123; &#xAB; &word;
function entityLen(s, i) {
  const n = s.length;
  let j = i + 1;
  if (j < n && s[j] === '#') {
    j++;
    if (j < n && (s[j] === 'x' || s[j] === 'X')) {
      j++;
      const start = j;
      while (j < n) {
        const c = s.charCodeAt(j);
        if ((c >= 48 && c <= 57) || (c >= 65 && c <= 70) || (c >= 97 && c <= 102)) j++;
        else break;
      }
      if (j > start && j < n && s[j] === ';') return j - i + 1;
      return 0;
    }
    const start = j;
    while (j < n && s[j] >= '0' && s[j] <= '9') j++;
    if (j > start && j < n && s[j] === ';') return j - i + 1;
    return 0;
  }
  const start = j;
  while (j < n) {
    const c = s.charCodeAt(j);
    if ((c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 95) j++;
    else break;
  }
  if (j > start && j < n && s[j] === ';') return j - i + 1;
  return 0;
}

function cleanUrl(href) {
  try {
    return encodeURI(href).replace(/%25/g, '%');
  } catch (e) {
    return null;
  }
}

// A link label: collapse internal whitespace to single spaces, trim,
// compare case-insensitively.
function normLabel(s) {
  // Unicode case folding: ß and ẞ both fold to ss
  return s.replace(/\s+/g, ' ').trim().toLowerCase().replace(/ß/g, 'ss').replace(/ẞ/g, 'ss');
}

function isSpace(c) {
  return c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f' || c === '\v';
}
function isAsciiPunct(c) {
  return (c >= '!' && c <= '/') || (c >= ':' && c <= '@') ||
         (c >= '[' && c <= '`') || (c >= '{' && c <= '~');
}
// Unicode punctuation: ASCII punct, or Unicode P / S categories.
const PUNCT_RE = /[\p{P}\p{S}]/u;
function isPunct(ch) {
  const code = ch.charCodeAt(0);
  if (code < 128) return isAsciiPunct(ch);
  return PUNCT_RE.test(ch);
}
const WS_RE = /\s/;
function isWS(ch) {
  const code = ch.charCodeAt(0);
  if (code < 128) return code === 32 || (code >= 9 && code <= 13);
  return WS_RE.test(ch);
}

// ---------------------------------------------------------------- inline
// Parts of an inline parse. A part is either a string (already-escaped
// HTML text) or an object:
//   {k:'d', ch, n, open, close, opens:[], closes:[]}  delimiter run
//   {k:'a', href, title}    link opener   {k:'/a'}    link closer
//   {k:'img', src, alt, title}                          image
//   {k:'c', s}              code span (s is the escaped content)
//   {k:'h', s}              raw HTML tag (s is the verbatim tag)
// Delimiter records are also kept in `delims` (same objects) so the
// emphasis pass can find them.

function renderParts(parts) {
  let out = '';
  for (const p of parts) {
    if (typeof p === 'string') { out += p; continue; }
    switch (p.k) {
      case 'd': {
        let n = p.n;
        for (const t of p.closes) out += t;
        if (n > 0) out += p.ch.repeat(n);
        for (let i = p.opens.length - 1; i >= 0; i--) out += p.opens[i];
        break;
      }
      case 'a':
        out += '<a href="' + p.href + '"' + (p.title !== null ? ' title="' + p.title + '"' : '') + '>';
        break;
      case '/a': out += '</a>'; break;
      case 'img':
        out += '<img src="' + p.src + '" alt="' + p.alt + '"' +
          (p.title !== null ? ' title="' + p.title + '"' : '') + '>';
        break;
      case 'c': out += '<code>' + p.s + '</code>'; break;
      case 'h': out += p.s; break;
      case 'br': out += '<br>'; break;
    }
  }
  return out;
}

// Plain text of a parts list, for image alt attributes: emphasis and
// code tags are dropped, raw HTML tags are escaped, nested images give
// their alt text.
function altFromParts(parts) {
  let out = '';
  for (const p of parts) {
    if (typeof p === 'string') { out += p; continue; }
    switch (p.k) {
      case 'd': if (p.n > 0) out += p.ch.repeat(p.n); break;
      case 'c': out += p.s; break;
      case 'h': out += esc(p.s); break;
      case 'img': out += p.alt; break;
      default: break; // link open/close contribute nothing
    }
  }
  return out;
}

// Flanking of a delimiter run at position i with run length n in s.
function flanking(s, i, n) {
  const prev = i > 0 ? s[i - 1] : '';
  const next = i + n < s.length ? s[i + n] : '';
  const prevWS = prev === '' || isWS(prev);
  const nextWS = next === '' || isWS(next);
  const prevP = prev !== '' && isPunct(prev);
  const nextP = next !== '' && isPunct(next);
  const left = !nextWS && (!nextP || prevWS || prevP);
  const right = !prevWS && (!prevP || nextWS || nextP);
  return { left, right };
}

// --- link destination / title parsing (shared by inline links and defs)
// s: source, i: index just after '(' (or after ':' for a def). Returns
// {dest, next} or null. A bare destination may contain balanced parens.
function parseDest(s, i) {
  const n = s.length;
  if (i < n && s[i] === '<') {
    let j = i + 1, out = '';
    while (j < n) {
      const c = s[j];
      if (c === '\n' || c === '<') return null;
      if (c === '>') return { dest: out, next: j + 1 };
      if (c === '\\' && j + 1 < n && isAsciiPunct(s[j + 1])) { out += s[j + 1]; j += 2; continue; }
      out += c; j++;
    }
    return null;
  }
  let j = i, out = '', depth = 0;
  while (j < n) {
    const c = s[j];
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f' || c === '\v') break;
    if (c === '\\' && j + 1 < n && isAsciiPunct(s[j + 1])) { out += s[j + 1]; j += 2; continue; }
    if (c === '(') { depth++; out += c; j++; continue; }
    if (c === ')') {
      if (depth === 0) break;
      depth--; out += c; j++; continue;
    }
    if (c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127) return null;
    out += c; j++;
  }
  return { dest: out, next: j };
}

// Parse a link title at s[i] (after skipping whitespace). Returns
// {title, next} or null. Titles may span lines but not blank lines.
function parseTitle(s, i) {
  const n = s.length;
  if (i >= n) return null;
  const q = s[i];
  if (q === '"' || q === "'") {
    let j = i + 1, out = '';
    while (j < n) {
      const c = s[j];
      if (c === q) return { title: out, next: j + 1 };
      if (c === '\n') {
        if (j + 1 < n && s[j + 1] === '\n') return null;
        out += c; j++; continue;
      }
      if (c === '\\' && j + 1 < n && isAsciiPunct(s[j + 1])) { out += s[j + 1]; j += 2; continue; }
      out += c; j++;
    }
    return null;
  }
  if (q === '(') {
    let j = i + 1, out = '';
    while (j < n) {
      const c = s[j];
      if (c === ')') return { title: out, next: j + 1 };
      if (c === '(') return null;
      if (c === '\n') {
        if (j + 1 < n && s[j + 1] === '\n') return null;
        out += c; j++; continue;
      }
      if (c === '\\' && j + 1 < n && isAsciiPunct(s[j + 1])) { out += s[j + 1]; j += 2; continue; }
      out += c; j++;
    }
    return null;
  }
  return null;
}

function skipWSNL(s, i) {
  while (i < s.length && isSpace(s[i])) i++;
  return i;
}

// Try to parse an inline link's "(dest title)" starting at s[i] === '('.
// Returns {href, title, next} or null.
function parseInlineLink(s, i) {
  const n = s.length;
  let j = skipWSNL(s, i + 1);
  const d = parseDest(s, j);
  if (!d) return null;
  j = skipWSNL(s, d.next);
  let title = null;
  if (j < n && (s[j] === '"' || s[j] === "'" || s[j] === '(')) {
    const t = parseTitle(s, j);
    if (!t) return null;
    title = t.title;
    j = skipWSNL(s, t.next);
  }
  if (j >= n || s[j] !== ')') return null;
  return { dest: d.dest, title, next: j + 1 };
}

// Scan a link label starting at s[i] === '['. Returns {label, next} or null.
function parseLabel(s, i) {
  const n = s.length;
  let j = i + 1;
  while (j < n) {
    const c = s[j];
    if (c === '\\' && j + 1 < n && isAsciiPunct(s[j + 1])) { j += 2; continue; }
    // an unescaped [ inside a label makes it invalid
    if (c === '[') return null;
    if (c === ']') return { label: s.slice(i + 1, j), next: j + 1 };
    j++;
  }
  return null;
}

// Process emphasis / strikethrough over the parts list. delims holds
// the delimiter records (same objects as in parts), in order.
function processEmphasis(parts, delims) {
  for (let ci = 0; ci < delims.length; ci++) {
    const closer = delims[ci];
    if (closer.dead || !closer.close || closer.n === 0) continue;
    let oi = ci - 1;
    while (oi >= 0) {
      const opener = delims[oi];
      if (!opener.dead && opener.ch === closer.ch && opener.open && opener.n > 0) {
        // rule 3: if the closer is followed by a non-whitespace,
        // non-punctuation character and the sum of the run lengths is a
        // multiple of 3, they do not pair -- unless both runs are
        // themselves multiples of 3
        if (closer.nextNonWSPunct && (opener.n + closer.n) % 3 === 0 &&
            !(opener.n % 3 === 0 && closer.n % 3 === 0)) {
          if (closer.n >= 2) closer.skippedAsCloser = true;
          oi--;
          continue;
        }
        // a delimiter that was skipped as a closer by rule 3 can only
        // pair as an opener for a strong (2-char) match, not an em
        if (opener.skippedAsCloser && !(opener.n >= 2 && closer.n >= 2)) {
          oi--;
          continue;
        }
        const use = (opener.n >= 2 && closer.n >= 2) ? 2 : 1;
        const tag = closer.ch === '~' ? 'del' : (use === 2 ? 'strong' : 'em');
        opener.n -= use;
        closer.n -= use;
        opener.opens.push(tag === 'del' ? '<del>' : tag === 'strong' ? '<strong>' : '<em>');
        closer.closes.push(tag === 'del' ? '</del>' : tag === 'strong' ? '</strong>' : '</em>');
        // once an emphasis span closes, any still-unpaired delimiter
        // inside it can no longer pair with one outside the span (it
        // still renders literally)
        if (opener.n === 0 && closer.n === 0) {
          for (let mi = oi + 1; mi < ci; mi++) delims[mi].dead = true;
        }
        if (closer.n === 0) break; // closer exhausted: stop looking for openers
        continue; // same opener may still have delimiters left
      }
      oi--;
    }
  }
}

// --- GFM autolinks ------------------------------------------------------
function validDomainLabels(dom) {
  // dom: labels separated by '.', each 1-63 chars, alnum ends, alnum/-/_
  // ('_' occurs in email domains such as a@b.com_x)
  if (!dom || dom.indexOf('.') < 0) return false;
  const labels = dom.split('.');
  for (const lab of labels) {
    if (!lab || lab.length > 63) return false;
    const a = lab.charCodeAt(0), b = lab.charCodeAt(lab.length - 1);
    const alnum = (c) => (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
    if (!alnum(a) || !alnum(b)) return false;
    for (let k = 0; k < lab.length; k++) {
      const c = lab.charCodeAt(k);
      if (!alnum(c) && c !== 45 && c !== 95) return false;
    }
  }
  return true;
}

// Trim trailing punctuation / unbalanced ')' / trailing entity from a URL.
function trimAutolink(u) {
  const PUNCT = '? ! . , : * _ ~';
  while (u.length > 0) {
    const last = u[u.length - 1];
    if (last === ';') {
      // a trailing &...; entity is trimmed whole, not just the ';'
      const amp = u.lastIndexOf('&');
      if (amp >= 0) {
        const ent = u.slice(amp + 1, -1);
        if (/^#[0-9]+$/.test(ent) || /^#[xX][0-9a-fA-F]+$/.test(ent) || /^[A-Za-z][A-Za-z0-9]*$/.test(ent)) {
          u = u.slice(0, amp); continue;
        }
      }
      u = u.slice(0, -1); continue;
    }
    if (PUNCT.indexOf(last) >= 0) { u = u.slice(0, -1); continue; }
    if (last === ')') {
      let open = 0, close = 0;
      for (let k = 0; k < u.length; k++) {
        if (u[k] === '(') open++;
        else if (u[k] === ')') close++;
      }
      if (close > open) { u = u.slice(0, -1); continue; }
    }
    break;
  }
  return u;
}

// Scan a www. / http(s):// autolink starting at s[i]. Returns
// {href, text, next} or null.
function parseWwwHttp(s, i) {
  let isWww = false, start = i;
  if (s.startsWith('www.', i)) { isWww = true; }
  else if (/^https?:\/\//i.test(s.slice(i, i + 8))) { isWww = false; }
  else return null;
  let j = i;
  while (j < s.length && !isWS(s[j]) && s[j] !== '<') {
    // a ']' followed by '(' or '[' closes link text: the autolink must not
    // swallow the link delimiter (e.g. [www.x.com](url))
    if (s[j] === ']' && (s[j + 1] === '(' || s[j + 1] === '[')) break;
    j++;
  }
  let u = trimAutolink(s.slice(i, j));
  if (u.length === 0) return null;
  // domain part: after 'www.' or after '://', up to / ? # (of the trimmed url);
  // the domain itself is only alnum, '-' and '.'
  const domStart = isWww ? 4 : (u.indexOf('://') + 3);
  let domEnd = domStart;
  while (domEnd < u.length) {
    const cc = u.charCodeAt(domEnd);
    const ok = (cc >= 48 && cc <= 57) || (cc >= 65 && cc <= 90) || (cc >= 97 && cc <= 122) || cc === 45 || cc === 46;
    if (!ok) break;
    domEnd++;
  }
  // a trailing '.' is part of the URL text, not of the domain labels
  let dom = u.slice(domStart, domEnd);
  while (dom.endsWith('.')) dom = dom.slice(0, -1);
  if (!validDomainLabels(dom)) return null;
  const href = isWww ? 'http://' + u : u;
  return { href, text: u, next: i + u.length };
}

// Validate an email starting at the '@' in s at position at.
// Returns {local, domain, end} or null.
function parseEmailAt(s, at, openUnderscore) {
  // local part: scan back over safe chars, but stop before a '__'
  // (an emphasis delimiter, not part of the address)
  const SAFE = /[A-Za-z0-9.!#$%+\/=?^_{|}~-]/;
  let start = at;
  while (start > 0 && SAFE.test(s[start - 1])) {
    if (s[start - 1] === '_' && start - 2 >= 0 && s[start - 2] === '_') break;
    start--;
  }
  if (start === at) return null;
  const local = s.slice(start, at);
  // the first character of the local part must not be backslash-escaped
  if (start > 0 && s[start - 1] === '\\') return null;
  // domain: scan forward over alnum, '-', '.'; a '_' or '-' followed by
  // an alnum continues the domain (e.g. a@b.com_x), but a trailing '_'
  // or '-' (or '__' emphasis) ends it and invalidates the address
  let j = at + 1;
  while (j < s.length) {
    const c = s.charCodeAt(j);
    if ((c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 45 || c === 46) j++;
    else if ((c === 95 || c === 45) && j + 1 < s.length) {
      const nc = s.charCodeAt(j + 1);
      if ((nc >= 48 && nc <= 57) || (nc >= 65 && nc <= 90) || (nc >= 97 && nc <= 122)) j++;
      else break;
    } else break;
  }
  let dom = s.slice(at + 1, j);
  // domain must end with an alnum label; trim trailing '.' / '-' / '_'
  // that are not part of it
  while (dom.length > 0) {
    const last = dom[dom.length - 1];
    if (last === '.' || last === '-' || last === '_') { dom = dom.slice(0, -1); j--; continue; }
    break;
  }
  if (!validDomainLabels(dom)) return null;
  // a trailing '_' or '-' immediately after the domain means the
  // address is malformed, so it is not an autolink at all -- except
  // when it is a '_'/'__' emphasis closer (there is an open '_' before it)
  if (j < s.length && (s[j] === '-' || s[j] === '_')) {
    if (openUnderscore && s[j] === '_') {
      // '_'/'__' emphasis closer: the email ends before it
    } else {
      return null;
    }
  }
  return { local, domain: dom, start, end: at + 1 + dom.length };
}

// Scan an HTML tag starting at s[i] === '<'. Returns {tag, next} or null.
// If allowIncomplete is true, a tag whose attributes are well-formed so
// far but which has no closing '>' yet on this line is still accepted
// (its tag is the rest of the line); used for block HTML type 6, where a
// tag may span lines.
function parseHtmlTag(s, i, allowIncomplete) {
  const n = s.length;
  if (i + 1 >= n) return null;
  // comment: <!--> and <!---> are abrupt empty comments (the tag is
  // just those characters); any other <!-- runs to the next -->, and the
  // content may contain -- or end in -
  if (s.startsWith('<!--', i)) {
    if (s[i + 4] === '>') return { tag: '<!-->', next: i + 5 };
    if (s[i + 4] === '-' && s[i + 5] === '>') return { tag: '<!--->', next: i + 6 };
    const end = s.indexOf('-->', i + 4);
    if (end < 0) return null;
    return { tag: s.slice(i, end + 3), next: end + 3 };
  }
  // processing instruction
  if (s.startsWith('<?', i)) {
    const end = s.indexOf('?>', i + 2);
    if (end < 0) return null;
    return { tag: s.slice(i, end + 2), next: end + 2 };
  }
  // declaration <!A ...>
  if (s[i + 1] === '!' && i + 2 < n && /[A-Za-z]/.test(s[i + 2])) {
    const end = s.indexOf('>', i + 2);
    if (end < 0) return null;
    return { tag: s.slice(i, end + 1), next: end + 1 };
  }
  // CDATA
  if (s.startsWith('<![CDATA[', i)) {
    const end = s.indexOf(']]>', i + 9);
    if (end < 0) return null;
    return { tag: s.slice(i, end + 3), next: end + 3 };
  }
  // closing tag
  if (s[i + 1] === '/') {
    let j = i + 2;
    if (j >= n || !/[A-Za-z]/.test(s[j])) return null;
    while (j < n && /[A-Za-z0-9-]/.test(s[j])) j++;
    while (j < n && (s[j] === ' ' || s[j] === '\t')) j++;
    if (j >= n || s[j] !== '>') return null;
    return { tag: s.slice(i, j + 1), next: j + 1 };
  }
  // open tag
  if (!/[A-Za-z]/.test(s[i + 1])) return null;
  let j = i + 1;
  while (j < n && /[A-Za-z0-9-]/.test(s[j])) j++;
  while (true) {
    const beforeWS = j;
    while (j < n && (s[j] === ' ' || s[j] === '\t' || s[j] === '\n')) j++;
    if (j >= n) return allowIncomplete ? { tag: s.slice(i, j), next: j } : null;
    if (s[j] === '>') return { tag: s.slice(i, j + 1), next: j + 1 };
    if (s[j] === '/' && j + 1 < n && s[j + 1] === '>') return { tag: s.slice(i, j + 2), next: j + 2 };
    // an attribute name must be preceded by whitespace
    if (j === beforeWS) return null;
    // attribute name
    if (!/[A-Za-z_:]/.test(s[j])) return null;
    while (j < n && /[A-Za-z0-9_.:-]/.test(s[j])) j++;
    // peek past whitespace: if an '=' follows, this attribute has a value
    // (consume the whitespace and parse it); otherwise it is a bare
    // attribute and the whitespace belongs to the next attribute
    let k = j;
    while (k < n && (s[k] === ' ' || s[k] === '\t' || s[k] === '\n')) k++;
    if (k >= n) return allowIncomplete ? { tag: s.slice(i, k), next: k } : null;
    if (s[k] === '=') {
      j = k + 1;
      while (j < n && (s[j] === ' ' || s[j] === '\t' || s[j] === '\n')) j++;
      if (j >= n) return allowIncomplete ? { tag: s.slice(i, j), next: j } : null;
      const q = s[j];
      if (q === '"' || q === "'") {
        j++;
        while (j < n && s[j] !== q) j++;
        if (j >= n) return allowIncomplete ? { tag: s.slice(i, j), next: j } : null;
        j++;
      } else {
        while (j < n) {
          const c = s[j];
          if (c === ' ' || c === '\t' || c === '\n' || c === '"' || c === "'" ||
              c === '=' || c === '<' || c === '>' || c === '`') break;
          j++;
        }
        if (j >= n) return allowIncomplete ? { tag: s.slice(i, j), next: j } : null;
      }
    }
  }
}

// Try an autolink <scheme:...> or <email> starting at s[i] === '<'.
// Returns {href, text, next} or null.
function parseAngleAutolink(s, i) {
  const n = s.length;
  let j = i + 1;
  if (j >= n) return null;
  // scheme: 2-32 chars, letter first, then alnum/+/-/., then ':'
  if (/[A-Za-z]/.test(s[j])) {
    let k = j + 1;
    while (k < n && /[A-Za-z0-9+.-]/.test(s[k])) k++;
    if (k < n && s[k] === ':' && k - j >= 2 && k - j <= 32) {
      let e = k + 1;
      while (e < n && s[e] !== ' ' && s[e] !== '\t' && s[e] !== '\n' && s[e] !== '<' && s[e] !== '>') e++;
      if (e < n && s[e] === '>' && e > k + 1) {
        const text = s.slice(i + 1, e);
        return { href: text, text, next: e + 1 };
      }
    }
  }
  // email
  const atPos = s.indexOf('@', j);
  const em = atPos < 0 ? null : parseEmailAt(s, atPos);
  if (em && em.start === j) {
    const end = em.end;
    if (end < n && s[end] === '>') {
      const text = s.slice(j, end);
      return { href: 'mailto:' + text, text, next: end + 1 };
    }
  }
  return null;
}

// ---------------------------------------------------------------- scanner
function inlineParse(text, refs) {
  const parts = [];
  const delims = [];
  const brackets = [];
  let buf = '';
  const n = text.length;
  let i = 0;
  const flush = () => { if (buf) { parts.push(buf); buf = ''; } };

  // Remove the output for raw text [start, end) from parts/buf (used
  // when an email/scheme autolink reaches back over delimiters).
  function rewindRaw(start, end) {
    let need = end - start;
    if (buf.length >= need) { buf = buf.slice(0, buf.length - need); return true; }
    need -= buf.length; buf = '';
    while (need > 0 && parts.length > 0) {
      const p = parts[parts.length - 1];
      if (typeof p === 'string') {
        if (p.length <= need) { need -= p.length; parts.pop(); }
        else { parts[parts.length - 1] = p.slice(0, p.length - need); need = 0; }
      } else if (p.k === 'd') {
        if (p.n <= need) {
          need -= p.n;
          const di = delims.indexOf(p);
          if (di >= 0) delims.splice(di, 1);
          parts.pop();
        } else return false;
      } else return false;
    }
    return need === 0;
  }

  while (i < n) {
    const c = text[i];

    // GFM www. / http(s):// autolinks (scheme may be capitalised)
    if (c === 'w' || c === 'W' || c === 'h' || c === 'H') {
      const r = parseWwwHttp(text, i);
      if (r) {
        let ok = true;
        if (c === 'w' || c === 'W') {
          const prev = i > 0 ? text[i - 1] : '';
          ok = prev === '' || isWS(prev) || prev === '*' || prev === '_' || prev === '~' || prev === '(';
        }
        if (ok) {
          const href = cleanUrl(r.href);
          if (href !== null) {
            flush();
            parts.push({ k: 'a', href: escText(href), title: null, auto: 'gfm' });
            parts.push(escText(r.text));
            parts.push({ k: '/a' });
            i = r.next;
            continue;
          }
        }
      }
    }

    if (c === '\\') {
      if (i + 1 < n && text[i + 1] === '\n') {
        flush(); parts.push({ k: 'br' }); i += 2;
        while (i < n && (text[i] === ' ' || text[i] === '\t')) i++;
        continue;
      }
      if (i + 1 < n && isAsciiPunct(text[i + 1])) { buf += ESC_MAP[text[i + 1]] || text[i + 1]; i += 2; continue; }
      buf += '\\'; i++; continue;
    }

    if (c === '`') {
      let j = i;
      while (j < n && text[j] === '`') j++;
      const m = j - i;
      let k = j, found = -1;
      while (k < n) {
        if (text[k] === '`') {
          let e = k;
          while (e < n && text[e] === '`') e++;
          if (e - k === m) { found = k; break; }
          k = e;
        } else k++;
      }
      if (found < 0) { buf += '`'.repeat(m); i = j; continue; }
      let content = text.slice(j, found).replace(/\n/g, ' ');
      if (content.length >= 2 && content[0] === ' ' && content[content.length - 1] === ' ' &&
          content.trim() !== '') content = content.slice(1, -1);
      flush();
      parts.push({ k: 'c', s: escStrict(content) });
      i = found + m;
      continue;
    }

    if (c === '*' || c === '_' || c === '~') {
      let j = i;
      while (j < n && text[j] === c) j++;
      const m = j - i;
      if (c === '~' && m >= 3) { buf += '~'.repeat(m); i = j; continue; }
      const fl = flanking(text, i, m);
      const prev = i > 0 ? text[i - 1] : '';
      const next = j < n ? text[j] : '';
      const prevP = prev !== '' && isPunct(prev);
      const nextP = next !== '' && isPunct(next);
      let open, close;
      if (c === '*') { open = fl.left; close = fl.right; }
      else if (c === '_') { open = fl.left && (!fl.right || prevP); close = fl.right && (!fl.left || nextP); }
      else { open = fl.left; close = fl.right; }
      // rule 3 looks at the characters around the run: the start of the
      // text counts as a non-whitespace, non-punctuation character
      // before an opener, while the end counts as whitespace after a
      // closer
      const prevNonWSPunct = prev === '' ? true : (!isWS(prev) && !isPunct(prev));
      const nextNonWSPunct = next === '' ? false : (!isWS(next) && !isPunct(next));
      flush();
      const rec = { k: 'd', ch: c, n: m, open, close, opens: [], closes: [], prevNonWSPunct, nextNonWSPunct };
      parts.push(rec);
      delims.push(rec);
      i = j;
      continue;
    }

    if (c === '[') {
      flush();
      brackets.push({ idx: parts.length, img: false, rawStart: i + 1 });
      parts.push('[');
      i++;
      continue;
    }
    if (c === '!' && i + 1 < n && text[i + 1] === '[') {
      flush();
      brackets.push({ idx: parts.length, img: true, rawStart: i + 2 });
      parts.push('![');
      i += 2;
      continue;
    }

    if (c === ']') {
      if (brackets.length === 0) { buf += ']'; i++; continue; }
      flush();
      const open = brackets[brackets.length - 1];
      let dest = null, title = null, next = i + 1, isLink = false;
      if (i + 1 < n && text[i + 1] === '(') {
        const r = parseInlineLink(text, i + 1);
        if (r) { dest = r.dest; title = r.title; next = r.next; isLink = true; }
      }
      if (!isLink && i + 1 < n && text[i + 1] === '[') {
        const lab = parseLabel(text, i + 1);
        if (lab) {
          const key = lab.label === '' ? normLabel(text.slice(open.rawStart, i)) : normLabel(lab.label);
          const ref = refs.get(key);
          if (ref) { dest = ref.dest; title = ref.title; next = lab.next; isLink = true; }
        }
        // a [text][label] that fails to resolve is not retried as a
        // shortcut link: the [text] stays literal
        if (!isLink) { brackets.pop(); buf += ']'; i++; continue; }
      }
      if (!isLink) {
        const key = normLabel(text.slice(open.rawStart, i));
        const ref = key === '' ? undefined : refs.get(key);
        if (ref) { dest = ref.dest; title = ref.title; next = i + 1; isLink = true; }
      }
      if (!isLink) { brackets.pop(); buf += ']'; i++; continue; }
      // a link's text cannot contain another explicit link: if the text
      // between the '[' and this ']' already holds an explicit link
      // opener, no link is formed (images may contain links in their alt
      // text, so this is links only). An autolink inside the text does
      // not block the link; it is flattened to plain text below.
      let nestedLink = false;
      if (!open.img) {
        for (let pi = open.idx + 1; pi < parts.length; pi++) {
          const p = parts[pi];
          if (typeof p === 'object' && p.k === 'a' && !p.auto) { nestedLink = true; break; }
        }
      }
      if (nestedLink) { brackets.pop(); buf += ']'; i++; continue; }
      // flatten any GFM autolinks inside the link text to plain text
      // (angle-bracket autolinks stay nested)
      if (!open.img) {
        for (let pi = open.idx + 1; pi < parts.length; pi++) {
          const p = parts[pi];
          if (typeof p === 'object' && p.k === 'a' && p.auto === 'gfm') {
            parts[pi] = '';
            // remove its matching closer
            for (let pj = pi + 1; pj < parts.length; pj++) {
              if (typeof parts[pj] === 'object' && parts[pj].k === '/a') { parts[pj] = ''; break; }
            }
          }
        }
      }
      const href = cleanUrl(dest);
      if (href === null) { brackets.pop(); buf += ']'; i++; continue; }
      const escHref = escText(href);
      const escTitle = title !== null ? escText(title) : null;
      if (open.img) {
        const textParts = parts.slice(open.idx + 1);
        const sliceDelims = textParts.filter((p) => typeof p === 'object' && p.k === 'd');
        processEmphasis(textParts, sliceDelims);
        const alt = altFromParts(textParts);
        parts[open.idx] = { k: 'img', src: escHref, alt, title: escTitle };
        parts.length = open.idx + 1;
        for (const d of sliceDelims) {
          const di = delims.indexOf(d);
          if (di >= 0) delims.splice(di, 1);
        }
        brackets.pop();
        i = next;
        continue;
      }
      parts[open.idx] = { k: 'a', href: escHref, title: escTitle };
      parts.push({ k: '/a' });
      // emphasis inside the link text is resolved within the link only:
      // process it now and drop those delimiters from the outer pass, so
      // a '*' inside the text cannot pair with one outside the link
      {
        const textParts = parts.slice(open.idx + 1, parts.length - 1);
        const sliceDelims = textParts.filter((p) => typeof p === 'object' && p.k === 'd');
        if (sliceDelims.length > 0) {
          processEmphasis(textParts, sliceDelims);
          for (const d of sliceDelims) {
            const di = delims.indexOf(d);
            if (di >= 0) delims.splice(di, 1);
          }
        }
      }
      brackets.pop();
      i = next;
      continue;
    }

    if (c === '<') {
      const auto = parseAngleAutolink(text, i);
      if (auto) {
        const href = cleanUrl(auto.href);
        if (href !== null) {
          flush();
          parts.push({ k: 'a', href: escText(href), title: null, auto: 'angle' });
          parts.push(escText(auto.text));
          parts.push({ k: '/a' });
          i = auto.next;
          continue;
        }
      }
      const tag = parseHtmlTag(text, i);
      if (tag) {
        flush();
        parts.push({ k: 'h', s: tag.tag });
        i = tag.next;
        continue;
      }
      buf += '&lt;';
      i++;
      continue;
    }

    if (c === '&') {
      if (i + 1 < n && text[i + 1] === '#') {
        const r = decodeNumericRef(text, i);
        if (r) { buf += ESC_MAP[r.ch] || r.ch; i = r.next; continue; }
        buf += '&amp;';
        i++;
        continue;
      }
      const len = entityLen(text, i);
      if (len > 0) { buf += text.slice(i, i + len); i += len; continue; }
      buf += '&amp;';
      i++;
      continue;
    }

    if (c === '@') {
      const openUnderscore = delims.some((d) => d.ch === '_' && d.n >= 1 && d.open && !d.dead);
      let em = parseEmailAt(text, i, openUnderscore);
      // a leading '_' of the local part is an emphasis opener, not part
      // of the address, when a closing '_' follows the domain
      if (em && em.local[0] === '_' && em.end < n && text[em.end] === '_' &&
          (em.start === 0 || isWS(text[em.start - 1]))) {
        em = { local: em.local.slice(1), domain: em.domain, start: em.start + 1, end: em.end };
      }
      if (em && rewindRaw(em.start, i)) {
        flush();
        const email = em.local + '@' + em.domain;
        parts.push({ k: 'a', href: escText('mailto:' + email), title: null, auto: 'gfm' });
        parts.push(escText(email));
        parts.push({ k: '/a' });
        i = em.end;
        continue;
      }
      buf += '@'; i++; continue;
    }

    if (c === ':') {
      // scheme autolink: scheme ':' email [/segment]
      let s0 = i;
      while (s0 > 0 && /[A-Za-z0-9+.-]/.test(text[s0 - 1])) s0--;
      const scheme = text.slice(s0, i);
      if (scheme.length >= 2 && scheme.length <= 32 && /[A-Za-z]/.test(scheme[0]) &&
          buf.endsWith(scheme)) {
        const atPos = text.indexOf('@', i + 1);
        const em = atPos < 0 ? null : parseEmailAt(text, atPos);
        if (em && em.start === i + 1) {
          let end = em.end, seg = '';
          if (end < n && text[end] === '/') {
            let e2 = end + 1;
            while (e2 < n && !isWS(text[e2]) && text[e2] !== '<' && text[e2] !== '/') e2++;
            if (e2 > end + 1) {
              seg = text.slice(end, e2);
              end = e2;
            }
          }
          buf = buf.slice(0, buf.length - scheme.length);
          flush();
          const full = scheme + ':' + em.local + '@' + em.domain + seg;
          parts.push({ k: 'a', href: escText(full), title: null, auto: 'gfm' });
          parts.push(escText(full));
          parts.push({ k: '/a' });
          i = end;
          continue;
        }
      }
      buf += ':'; i++; continue;
    }

    if (c === '\n') {
      let k = buf.length;
      while (k > 0 && buf[k - 1] === ' ') k--;
      if (buf.length - k >= 2) {
        buf = buf.slice(0, k);
        flush();
        parts.push({ k: 'br' });
        i++;
        // leading whitespace of the line after a hard break is stripped
        while (i < n && (text[i] === ' ' || text[i] === '\t')) i++;
        continue;
      }
      buf += '\n';
      i++;
      continue;
    }

    if (c === '>') { buf += '&gt;'; i++; continue; }
    if (c === '"') { buf += '&quot;'; i++; continue; }
    if (c === "'") { buf += '&#39;'; i++; continue; }
    buf += c;
    i++;
  }

  flush();
  processEmphasis(parts, delims);
  return renderParts(parts);
}

// ---------------------------------------------------------------- block parser
// Incremental block parser in the style of cmark: an open-block stack is
// maintained while lines are incorporated one at a time, which is what makes
// lazy continuation lines, setext headings inside list items and the
// tight/loose list rules come out right without special cases.

// ---- line state helpers (P holds the current line + parser state) ----
function curContent(P) { return ' '.repeat(P.pad) + P.S.slice(P.off); }
function curIsBlank(P) {
  for (let i = P.off; i < P.S.length; i++) {
    const ch = P.S[i];
    if (ch !== ' ' && ch !== '\t') return false;
  }
  return true;
}
// columns of leading whitespace at the current position; idx = first non-ws char
function curIndent(P) {
  let c = P.pad, i = P.off, cc = P.col + P.pad;
  while (i < P.S.length) {
    const ch = P.S[i];
    if (ch === ' ') { c++; cc++; i++; }
    else if (ch === '\t') { const w = 4 - (cc % 4); c += w; cc += w; i++; }
    else break;
  }
  return { cols: c, idx: i, colEnd: cc };
}
// advance the current position by n whitespace columns (splitting a tab if needed)
function advanceCols(P, n) {
  let rem = n;
  if (P.pad > 0) {
    const take = Math.min(P.pad, rem);
    P.pad -= take; rem -= take; P.col += take;
    if (rem === 0) return;
  }
  while (rem > 0 && P.off < P.S.length) {
    const ch = P.S[P.off];
    if (ch === ' ') { P.off++; P.col++; rem--; }
    else if (ch === '\t') {
      const w = 4 - (P.col % 4);
      if (w > rem) { P.pad = w - rem; P.col += rem; P.off++; rem = 0; }
      else { P.off++; P.col += w; rem -= w; }
    } else break;
  }
}
// advance the current position by n columns, moving through any characters
// (a tab advances to the next multiple of 4; any other char advances by 1)
function advanceColumns(P, n) {
  let rem = n;
  if (P.pad > 0) {
    const take = Math.min(P.pad, rem);
    P.pad -= take; rem -= take; P.col += take;
    if (rem === 0) return;
  }
  while (rem > 0 && P.off < P.S.length) {
    const ch = P.S[P.off];
    if (ch === '\t') {
      const w = 4 - (P.col % 4);
      if (w > rem) { P.pad = w - rem; P.col += rem; P.off++; rem = 0; }
      else { P.off++; P.col += w; rem -= w; }
    } else {
      P.off++; P.col++; rem--;
    }
  }
}
function skipWS(P) { advanceCols(P, curIndent(P).cols); }

// ---- node operations ----
function addChild(P, node) {
  node.parent = P.tip;
  P.tip.children.push(node);
  P.tip = node;
}
function closeTo(P, node) {
  while (P.tip !== node) {
    const t = P.tip;
    P.tip = t.parent;
    finalizeNode(P, t);
  }
}
// open path from the document root down to the tip
function openPath(P) {
  const path = [];
  let n = P.tip;
  while (n !== P.root) { path.push(n); n = n.parent; }
  path.reverse();
  return path;
}

// ---- entry point ----
export function parse(src) {
  const refs = new Map();
  let lines = src.replace(/\r\n?/g, '\n').split('\n');
  if (src.length > 0 && src[src.length - 1] === '\n') lines.pop();
  if (src.length === 0) lines = [];
  const P = {
    S: '', off: 0, col: 0, pad: 0,
    refs, root: { t: 'doc', children: [], parent: null },
    tip: null, lastLineBlank: false, lastLineBlankInItem: false,
  };
  P.tip = P.root;
  P.atEnd = false;
  P.lineCount = lines.length;
  P.lines = lines;
  P.endsWithNewline = src.length > 0 && src[src.length - 1] === '\n';
  for (let ln = 0; ln < lines.length; ln++) {
    P.S = lines[ln]; P.off = 0; P.col = 0; P.pad = 0;
    P.lineIdx = ln;
    incorporateLine(P);
  }
  P.atEnd = true;
  closeTo(P, P.root);
  return renderNode(P.root, P.refs, false);
}

// Expand tabs in s to spaces, starting at column startCol.
function expandTabs(s, startCol) {
  let out = '', col = startCol;
  for (let k = 0; k < s.length; k++) {
    const ch = s[k];
    if (ch === '\t') {
      const w = 4 - (col % 4);
      out += ' '.repeat(w);
      col += w;
    } else {
      out += ch;
      col++;
    }
  }
  return out;
}

function addLineToTip(P, blank) {
  if (P.tip.t === 'para') {
    const content = curContent(P);
    if (P.tip.text) P.tip.text += '\n' + content;
    else P.tip.text = content;
  } else if (P.tip.t === 'code') {
    if (P.tip.fenced) {
      // content lines lose up to the fence's indentation; when the fence
      // itself is indented, tabs in the remaining content expand to spaces
      // from the content's column (a top-level fence keeps tabs verbatim)
      const ind = curIndent(P);
      const strip = Math.min(P.tip.fenceIndent || 0, ind.cols);
      if (strip > 0) advanceCols(P, strip);
      const content = curContent(P);
      // only leading (indentation) tabs expand, and only when the fence
      // sits inside a container (list item / blockquote); a top-level
      // fence keeps tabs verbatim even when it is indented. A mid-line
      // tab is always kept verbatim. Inside nested blockquotes the tab
      // expands as if only the innermost quote marker counted (marked's
      // column for a tab in a quote is the document column minus 2 per
      // extra quote level)
      const col = P.col + P.pad;
      let inContainer = false, qd = 0;
      for (let anc = P.tip.parent; anc; anc = anc.parent) {
        if (anc.t === 'quote') { qd++; inContainer = true; }
        else if (anc.t === 'item') inContainer = true;
      }
      if (inContainer && col > 0) {
        const effCol = col - 2 * Math.max(0, qd - 1);
        let k = 0;
        while (k < content.length && (content[k] === ' ' || content[k] === '\t')) k++;
        const lead = expandTabs(content.slice(0, k), effCol);
        P.tip.text += lead + content.slice(k) + '\n';
      } else {
        P.tip.text += content + '\n';
      }
    } else {
      const ind = curIndent(P);
      if (ind.cols > 0) advanceCols(P, Math.min(4, ind.cols));
      P.tip.text += curContent(P) + '\n';
    }
  } else if (P.tip.t === 'html') {
    // the last line has no trailing newline in the source unless the input
    // ends with one
    const isLast = P.lineIdx === P.lineCount - 1;
    P.tip.text += curContent(P) + (isLast && !P.endsWithNewline ? '' : '\n');
  }
}

// Strip the indentation a lazy continuation line sheds: each unmatched
// list item's contentIndent (outermost first, only if the remaining indent
// reaches it), then one 4-column indented-code level if still >= 4.
// The matched containers were already consumed by checkOpenBlocks, so only
// the unmatched items count.
function applyLazyStrip(P) {
  const path = openPath(P);
  const lmIdx = path.indexOf(P.lastMatched);
  let remaining = curIndent(P).cols;
  if (lmIdx >= 0) {
    for (let i = lmIdx + 1; i < path.length; i++) {
      const b = path[i];
      if (b.t === 'item' && remaining >= b.contentIndent) remaining -= b.contentIndent;
    }
  }
  if (remaining >= 4) remaining -= 4;
  const strip = curIndent(P).cols - remaining;
  if (strip > 0) advanceCols(P, strip);
}

function incorporateLine(P) {
  const rawBlank = curIsBlank(P);
  const lazy = checkOpenBlocks(P, rawBlank);
  // a line that is blank once its container prefixes are gone (e.g. a lone
  // '>' inside a quote) is a blank line for paragraph purposes
  const blank = curIsBlank(P);
  // an HTML block (types 1-5) that has ended is finalized when the next line
  // arrives; a following blank line eats its trailing newline
  if (P.tip.t === 'html' && P.tip.ended) {
    if (blank && P.tip.text.endsWith('\n')) P.tip.text = P.tip.text.slice(0, -1);
    finalizeNode(P, P.tip);
    P.tip = P.tip.parent;
  }
  if (blank) {
    // a '>'-only line that ends a blockquote contributes the whitespace
    // after the '>' (minus its separator space) to the paragraph it
    // closes, instead of ending it -- but only when no later line
    // continues the quote
    if (P.tip.t === 'para') {
      let inQuote = false;
      for (let anc = P.tip.parent; anc; anc = anc.parent) {
        if (anc.t === 'quote') { inQuote = true; break; }
      }
      if (inQuote) {
        const nextLine = P.lineIdx + 1 < P.lineCount ? P.lines[P.lineIdx + 1] : null;
        let nextContinues = false;
        if (nextLine !== null) {
          let ni = 0;
          while (ni < nextLine.length && nextLine[ni] === ' ' && ni < 3) ni++;
          if (ni < nextLine.length && nextLine[ni] === '>') nextContinues = true;
        }
        if (!nextContinues) {
          const ws = expandTabs(curContent(P), P.col + P.pad);
          if (ws.length > 0) {
            P.tip.text += '\n' + ws;
            // the quote ends here: close the paragraph and the quote so
            // the next line lands outside it
            finalizeNode(P, P.tip);
            P.tip = P.tip.parent;
            while (P.tip && P.tip.t === 'quote') {
              finalizeNode(P, P.tip);
              P.tip = P.tip.parent;
            }
            P.lastLineBlank = false;
            return;
          }
        }
      }
    }
    // a blank line closes a paragraph and an HTML block of types 6-7;
    // inside a code block it is just an empty line
    if (P.tip.t === 'para') {
      // a blank line that contains a tab does not end a table: it is a
      // body row of empty cells, and the lines after it stay table rows
      // (a truly empty or spaces-only line does end the table)
      const content = curContent(P);
      if (content.includes('\t')) {
        const lines = P.tip.text.split('\n');
        if (lines.length >= 2 && parseTable(lines.slice(0, 2).concat([''])) !== null) {
          P.tip.text += '\n' + content;
          P.lastLineBlank = false;
          return;
        }
      }
      finalizeNode(P, P.tip);
      P.tip = P.tip.parent;
    } else if (P.tip.t === 'html' && P.tip.htmlType >= 6) {
      finalizeNode(P, P.tip);
      P.tip = P.tip.parent;
    }
    // an empty list item followed by a blank line stays empty: it takes no
    // content from later lines
    if (P.tip.t === 'item' && P.tip.children.length === 0) {
      finalizeNode(P, P.tip);
      P.tip = P.tip.parent;
    }
    if (P.tip.t === 'code') addLineToTip(P, blank);
    else if (P.tip.t === 'html' && P.tip.htmlType <= 5) {
      const isLast = P.lineIdx === P.lineCount - 1;
      P.tip.text += curContent(P) + (isLast && !P.endsWithNewline ? '' : '\n');
    }
    P.lastLineBlank = true;
    return;
  }
  // leaf-block continuation / end conditions (non-blank lines only)
  if (P.tip.t === 'code' && !P.tip.fenced) {
    const ind = curIndent(P);
    if (ind.cols < 4) {
      finalizeNode(P, P.tip);
      P.tip = P.tip.parent;
      openNewBlocks(P, false);
      if (!P.skipLine) addLineToTip(P, blank);
      P.skipLine = false;
      P.lastLineBlank = blank;
      return;
    }
    addLineToTip(P, blank);
    P.lastLineBlank = blank;
    return;
  }
  if (P.tip.t === 'code' && P.tip.fenced) {
    const ind = curIndent(P);
    if (ind.cols < 4) {
      const content = P.S.slice(ind.idx);
      let i = 0;
      while (i < content.length && content[i] === P.tip.fenceCh) i++;
      if (i >= P.tip.fenceLen) {
        let j = i;
        while (j < content.length && (content[j] === ' ' || content[j] === '\t')) j++;
        if (j === content.length) {
          finalizeNode(P, P.tip);
          P.tip = P.tip.parent;
          P.lastLineBlank = false;
          return;
        }
      }
    }
    addLineToTip(P, blank);
    P.lastLineBlank = blank;
    return;
  }
  if (P.tip.t === 'html') {
    const ht = P.tip.htmlType;
    if (ht >= 1 && ht <= 5) {
      const content = curContent(P);
      let ends = false;
      if (ht === 1) ends = /<\/(script|pre|style|textarea)/i.test(content);
      else if (ht === 2) ends = content.includes('-->');
      else if (ht === 3) ends = content.includes('?>');
      else if (ht === 4) ends = content.includes('>');
      else if (ht === 5) ends = content.includes(']]>');
      if (ends) {
        const isLast = P.lineIdx === P.lineCount - 1;
        P.tip.text += content + (isLast && !P.endsWithNewline ? '' : '\n');
        P.tip.ended = true;
        P.lastLineBlank = false;
        return;
      }
      addLineToTip(P, blank);
      P.lastLineBlank = blank;
      return;
    }
    addLineToTip(P, blank);
    P.lastLineBlank = blank;
    return;
  }
  const tipBeforeOpen = P.tip;
  openNewBlocks(P, lazy);
  if (!P.skipLine) {
    if (lazy && P.tip.t === 'para') {
      // a lazy continuation line that looks like a setext underline is kept
      // as paragraph text by indenting it 4 spaces (a leading tab is kept)
      const content = curContent(P);
      const ind = indentOfStr(content, P.col);
      if (ind.cols < 4 && matchSetext(content.slice(ind.idx))) {
        const stripped = content.slice(ind.idx);
        const fixed = content[0] === '\t' ? content : '    ' + stripped;
        if (P.tip.text) P.tip.text += '\n' + fixed;
        else P.tip.text = fixed;
        P.lastLineBlank = blank;
        return;
      }
      applyLazyStrip(P);
    } else if (!lazy && P.tip === tipBeforeOpen && P.tip.t === 'para' && P.tip.parent && P.tip.parent.t === 'item') {
      // a continuation line directly inside a list item sheds one
      // indented-code level (4 columns) if its remaining indent reaches 4
      const ind = curIndent(P);
      if (ind.cols >= 4) advanceCols(P, 4);
    }
    addLineToTip(P, blank);
  }
  P.skipLine = false;
  P.lastLineBlank = blank;
}

// ---- check open containers; returns true if the line is lazy ----
function checkOpenBlocks(P, blank) {
  const path = openPath(P);
  let lastMatched = P.root;
  for (let idx = 0; idx < path.length; idx++) {
    const node = path[idx];
    if (node.t === 'quote') {
      const saveOff = P.off, saveCol = P.col, savePad = P.pad;
      const ind = curIndent(P);
      if (ind.cols > 3) break;
      advanceCols(P, ind.cols);
      if (P.off < P.S.length && P.S[P.off] === '>') {
        P.off++; P.col++;
        if (P.off < P.S.length && (P.S[P.off] === ' ' || P.S[P.off] === '\t')) advanceCols(P, 1);
        lastMatched = node;
        continue;
      }
      P.off = saveOff; P.col = saveCol; P.pad = savePad;
      break;
    }
    if (node.t === 'item') {
      if (blank) { lastMatched = node; continue; }
      const ind = curIndent(P);
      if (ind.cols >= node.contentIndent) {
        advanceCols(P, node.contentIndent);
        lastMatched = node;
        continue;
      }
      // a fenced code block that already has content keeps consuming
      // lines even when they are not indented to the item's content
      // indent; the item stays open. But if the fence has no content
      // yet, an unindented line ends the item (and leaves the fence empty)
      if (P.tip.t === 'code' && P.tip.fenced && P.tip.text) {
        lastMatched = node;
        continue;
      }
      break;
    }
    lastMatched = node;
  }
  // decide: lazy or close
  P.lastMatched = lastMatched;
  const tipIsPara = P.tip.t === 'para';
  // A list marker that continues the parent list of the container that just
  // failed to match is a new item, not a lazy continuation line (this is
  // what lets an ordered list continue with 2., 3., ... even though such a
  // marker cannot interrupt a paragraph on its own).
  let continuesList = false;
  if (!blank && tipIsPara && lastMatched !== P.tip) {
    const pathIdx = path.indexOf(lastMatched);
    const failedNode = pathIdx >= 0 && pathIdx + 1 < path.length ? path[pathIdx + 1] : null;
    if (failedNode && failedNode.t === 'item') {
      const list = failedNode.parent;
      if (list && list.t === 'list') {
        const s = curContent(P);
        const ind = indentOfStr(s, P.col);
        const lm = matchList(s.slice(ind.idx), P.col + ind.cols);
        // the marker must sit at the same column as the failed item's
        // marker, else this is a lazy continuation, not a new item
        if (lm && listMatches(list, lm) && P.col + ind.cols === failedNode.markerCol) continuesList = true;
      }
    }
  }
  if (!blank && tipIsPara && lastMatched !== P.tip && !continuesList && !isInterruptingStart(P)) {
    return true; // lazy continuation: keep the containers open
  }
  if (lastMatched !== P.tip) closeTo(P, lastMatched);
  return false;
}

// columns of leading whitespace of string s, starting at column startCol
function indentOfStr(s, startCol) {
  let c = 0, i = 0, cc = startCol;
  while (i < s.length) {
    const ch = s[i];
    if (ch === ' ') { c++; cc++; i++; }
    else if (ch === '\t') { const w = 4 - (cc % 4); c += w; cc += w; i++; }
    else break;
  }
  return { cols: c, idx: i };
}
function isBlankStr(s) {
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch !== ' ' && ch !== '\t') return false;
  }
  return true;
}

// does the content at the current position start a block that can interrupt
// a paragraph? (ATX, fenced code, HTML block 1-6, thematic break, quote, list)
function isInterruptingStart(P) {
  const s = curContent(P);
  const ind = indentOfStr(s, P.col);
  if (ind.cols >= 4) return false;
  const c = s.slice(ind.idx);
  if (c === '') return false;
  if (matchATX(c)) return true;
  if (matchFence(c)) return true;
  const ht = matchHTMLType(c);
  if (ht > 0 && ht < 7) return true;
  if (matchThematicBreak(c)) return true;
  if (c[0] === '>') return true;
  const lm = matchList(c, P.col + ind.cols);
  if (lm && (lm.bullet || lm.start === 1) && !lm.empty) return true;
  // a list marker inside a list item starts a nested list, so it can
  // interrupt the item's paragraph even when its start is not 1
  if (lm && !lm.empty && P.lastMatched && P.lastMatched.t === 'item') return true;
  // an ordered marker whose delimiter differs from the enclosing list's
  // starts a new list, so it can interrupt a paragraph too
  if (lm && lm.ordered && !lm.empty) {
    let node = P.tip;
    while (node) {
      if (node.t === 'list') {
        if (!node.ordered || node.delim !== lm.delim) return true;
        break;
      }
      node = node.parent;
    }
  }
  return false;
}

// ---- block-start matchers (operate on the content string) ----
function matchATX(s) {
  // 1-6 '#' then space/tab/EOL
  let i = 0;
  while (i < s.length && s[i] === '#') i++;
  if (i === 0 || i > 6) return null;
  if (i < s.length && s[i] !== ' ' && s[i] !== '\t') return null;
  return { level: i, rest: s.slice(i) };
}
function matchFence(s) {
  const ch = s[0];
  if (ch !== '`' && ch !== '~') return null;
  let i = 0;
  while (i < s.length && s[i] === ch) i++;
  if (i < 3) return null;
  return { ch, len: i, info: s.slice(i) };
}
// HTML block type (1-7) or 0; s is the content (indent already stripped)
function matchHTMLType(s) {
  if (s[0] !== '<') return 0;
  // type 1: <script, <pre, <style, <textarea (case-insensitive, word boundary)
  let m = s.match(/^<(script|pre|style|textarea)([\s>]|$)/i);
  if (m) return 1;
  // type 2: <!--
  if (s.startsWith('<!--')) return 2;
  // type 3: <?
  if (s.startsWith('<?')) return 3;
  // type 4: <! followed by a letter
  if (s.startsWith('<!') && s.length > 2 && /[A-Za-z]/.test(s[2])) return 4;
  // type 5: <![CDATA[
  if (s.startsWith('<![CDATA[')) return 5;
  // type 6: block-level tag (open or close), followed by space/tab/>/EOL.
  // Only the tag name is checked here; attributes are not validated for
  // block starts (a <div> with odd-looking attributes still opens a block).
  m = s.match(/^<\/?(address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)([\s/>]|$)/i);
  if (m) return 6;
  // type 7: a complete open/close tag and nothing else on the line
  const tag7 = parseHtmlTag(s, 0);
  if (tag7 && /^[ \t]*$/.test(s.slice(tag7.next))) return 7;
  return 0;
}
function matchThematicBreak(s) {
  // 3+ of the same char (*, -, _) with only spaces/tabs between
  let i = 0, ch = '';
  while (i < s.length && (s[i] === ' ' || s[i] === '\t')) i++;
  if (i >= s.length) return false;
  ch = s[i];
  if (ch !== '*' && ch !== '-' && ch !== '_') return false;
  let count = 0;
  while (i < s.length) {
    if (s[i] === ch) { count++; i++; }
    else if (s[i] === ' ' || s[i] === '\t') i++;
    else return false;
  }
  return count >= 3;
}
function matchSetext(s) {
  // === (h1) or --- (h2), only spaces/tabs after
  let i = 0;
  while (i < s.length && (s[i] === ' ' || s[i] === '\t')) i++;
  if (i >= s.length) return 0;
  const ch = s[i];
  if (ch !== '=' && ch !== '-') return 0;
  while (i < s.length && s[i] === ch) i++;
  while (i < s.length && (s[i] === ' ' || s[i] === '\t')) i++;
  if (i !== s.length) return 0;
  return ch === '=' ? 1 : 2;
}
function matchList(s, startCol) {
  // bullet: -, +, * followed by space/tab/EOL ; ordered: 1-9 digits + . or )
  let i = 0;
  const ch = s[0];
  let ordered = false, start = 0, bullet = false, markerLen = 0;
  if (ch === '-' || ch === '+' || ch === '*') {
    bullet = true; markerLen = 1; i = 1;
  } else if (ch >= '0' && ch <= '9') {
    while (i < s.length && s[i] >= '0' && s[i] <= '9') i++;
    if (i > 9) return null;
    if (i < s.length && (s[i] === '.' || s[i] === ')')) {
      ordered = true;
      start = parseInt(s.slice(0, i), 10);
      markerLen = i + 1;
      i = markerLen;
    } else return null;
  } else return null;
  // the marker must be followed by a space, a tab, or EOL
  if (i < s.length && s[i] !== ' ' && s[i] !== '\t') return null;
  // count the whitespace after the marker (in columns, starting at the
  // marker's end column)
  let spaces = 0, j = i, cc = startCol + markerLen;
  while (j < s.length && (s[j] === ' ' || s[j] === '\t')) {
    if (s[j] === ' ') { spaces++; cc++; j++; }
    else { const w = 4 - (cc % 4); spaces += w; cc += w; j++; }
  }
  const empty = j >= s.length;
  let contentIndent;
  if (empty) contentIndent = markerLen + 1;
  else if (spaces >= 1 && spaces <= 4) contentIndent = markerLen + spaces;
  else contentIndent = markerLen + 1;
  return {
    ordered, bullet, start, markerLen, contentIndent, empty, contentStart: j,
    bulletChar: bullet ? ch : '', delim: ordered ? s[markerLen - 1] : '',
  };
}

// ---- open new blocks at the current position ----
function finalizeParaTip(P) {
  if (P.tip.t === 'para') {
    finalizeNode(P, P.tip);
    P.tip = P.tip.parent;
  }
}
// a non-list block cannot be a child of a list, so a list tip is closed
// as well as a paragraph tip when such a block interrupts
function finalizeInterruptTip(P) {
  if (P.tip.t === 'para' || P.tip.t === 'list') {
    finalizeNode(P, P.tip);
    P.tip = P.tip.parent;
  }
}
// add a block as a child of the tip; a blank line before it inside a list
// item makes the list loose
function addBlockChild(P, node) {
  if (P.lastLineBlank) {
    const parent = P.tip;
    if (parent.t === 'item' && parent.children.length > 0) {
      const list = parent.parent;
      if (list && list.t === 'list') list.tight = false;
    }
  }
  addChild(P, node);
}

function openNewBlocks(P, lazy) {
  if (lazy) return;
  // a leaf tip (code / html) consumes lines; no new blocks open inside it
  if (P.tip.t === 'code' || P.tip.t === 'html') return;
  for (;;) {
    const s = curContent(P);
    const ind = indentOfStr(s, P.col);
    const content = s.slice(ind.idx);
    if (content === '') return;
    const tipIsPara = P.tip.t === 'para';
    // 4+ columns of indent: indented code (unless the tip is a paragraph)
    if (ind.cols >= 4) {
      if (!tipIsPara) {
        finalizeInterruptTip(P);
        addBlockChild(P, { t: 'code', fenced: false, info: '', text: '' });
      }
      return;
    }
    // setext underline turns a paragraph into a heading
    if (tipIsPara) {
      const st = matchSetext(content);
      if (st) {
        // a table swallows a setext-looking line as a body row instead of
        // becoming a heading
        const plines = (P.tip.text || '').split('\n');
        if (!(plines.length >= 2 && parseTable(plines.slice(0, 2).concat([''])) !== null)) {
          // a leading link definition belongs to the paragraph, not the heading;
          // if nothing is left, the underline is paragraph text, not a heading
          const rest = extractLinkDefs(P, P.tip.text || '');
          if (rest.replace(/^[ \t\n]+/, '').replace(/[ \t\n]+$/, '') !== '') {
            P.tip.text = rest;
            P.tip.t = 'heading';
            P.tip.level = st;
            P.tip.text = (P.tip.text || '').replace(/^[ \t\n]+/, '').replace(/[ \t\n]+$/, '');
            finalizeNode(P, P.tip);
            P.tip = P.tip.parent;
            return;
          }
          P.tip.text = rest;
        }
      }
    }
    // ATX heading
    const atx = matchATX(content);
    if (atx) {
      finalizeInterruptTip(P);
      addBlockChild(P, { t: 'heading', level: atx.level, text: atxText(atx.rest) });
      finalizeNode(P, P.tip);
      P.tip = P.tip.parent;
      return;
    }
    // fenced code
    const fence = matchFence(content);
    if (fence) {
      const info = fenceInfo(fence.info, fence.ch);
      if (info !== null) {
        finalizeInterruptTip(P);
        addBlockChild(P, { t: 'code', fenced: true, fenceCh: fence.ch, fenceLen: fence.len, info, text: '', fenceIndent: ind.cols });
        P.skipLine = true;
        return;
      }
    }
    // HTML block (types 1-6 can interrupt a paragraph; type 7 cannot)
    const ht = matchHTMLType(content);
    if (ht > 0 && (ht < 7 || !tipIsPara)) {
      finalizeInterruptTip(P);
      addBlockChild(P, { t: 'html', htmlType: ht, text: '', ended: ht <= 5 && htmlEndsOnLine(ht, content) });
      return;
    }
    // thematic break
    if (matchThematicBreak(content)) {
      finalizeInterruptTip(P);
      addBlockChild(P, { t: 'hr' });
      finalizeNode(P, P.tip);
      P.tip = P.tip.parent;
      return;
    }
    // block quote
    if (content[0] === '>') {
      finalizeInterruptTip(P);
      addBlockChild(P, { t: 'quote', children: [], parent: null });
      advanceCols(P, ind.cols);
      P.off++; P.col++;
      if (P.off < P.S.length && (P.S[P.off] === ' ' || P.S[P.off] === '\t')) advanceCols(P, 1);
      continue;
    }
    // list
    const lm = matchList(content, P.col + ind.cols);
    // a list marker opens a list unless it is a non-1 ordered marker
    // interrupting a top-level paragraph; inside a list item it always
    // starts a nested list
    let paraInItem = false;
    if (tipIsPara) {
      let node = P.tip.parent;
      while (node) {
        if (node.t === 'item') { paraInItem = true; break; }
        if (node.t === 'list') break;
        node = node.parent;
      }
    }
    if (lm && (!tipIsPara || paraInItem || ((lm.bullet || lm.start === 1) && !lm.empty))) {
      finalizeParaTip(P);
      if (P.tip.t === 'list' && !listMatches(P.tip, lm)) {
        finalizeNode(P, P.tip);
        P.tip = P.tip.parent;
      }
      let listNode;
      if (P.tip.t === 'list' && listMatches(P.tip, lm)) {
        listNode = P.tip;
      } else {
        listNode = {
          t: 'list', ordered: lm.ordered, start: lm.ordered ? lm.start : 0,
          bulletChar: lm.bulletChar, delim: lm.delim,
          tight: true, children: [], parent: null,
        };
        addBlockChild(P, listNode);
      }
      const item = {
        t: 'item', contentIndent: ind.cols + lm.contentIndent,
        markerCol: P.col + ind.cols, children: [], parent: null,
      };
      addChild(P, item);
      advanceColumns(P, ind.cols + lm.contentIndent);
      // a blank line before this item makes the list loose
      if (P.lastLineBlank && listNode.children.length > 1) listNode.tight = false;
      continue;
    }
    // paragraph
    if (!tipIsPara) {
      if (P.tip.t === 'list') {
        finalizeNode(P, P.tip);
        P.tip = P.tip.parent;
      }
      addBlockChild(P, { t: 'para', text: '' });
    }
    return;
  }
}

function atxText(rest) {
  const s = rest.replace(/[ \t]+$/, '');
  const m = s.match(/^(.*?)[ \t]+#+$/);
  if (m) return m[1].replace(/^[ \t]+/, '').replace(/[ \t]+$/, '');
  return s.replace(/^[ \t]+/, '');
}
function fenceInfo(info, ch) {
  let s = info.replace(/^[ \t]+/, '').replace(/[ \t]+$/, '');
  if (ch === '`' && s.includes('`')) return null;
  // backslash escapes in the info string are resolved (\+ -> +)
  if (s.indexOf('\\') >= 0) {
    s = s.replace(/\\([!-/:-@\[-`{-~])/g, '$1');
  }
  return s;
}
function listMatches(list, lm) {
  if (list.ordered !== lm.ordered) return false;
  if (lm.ordered) return list.delim === lm.delim;
  return list.bulletChar === lm.bulletChar;
}

// ---- link reference definitions ----
function parseDefFromLines(lines, i, end) {
  // A definition may span several lines (a multi-line title); build the text
  // from all remaining lines of the paragraph.
  if (end - i < 1) return null;
  let text = '';
  const lineStart = [];
  for (let k = i; k < end; k++) {
    if (k > i) text += '\n';
    lineStart.push(text.length);
    text += lines[k];
  }
  const maxLines = end - i;
  let p = 0;
  let spaces = 0;
  while (p < text.length && text[p] === ' ' && spaces < 4) { p++; spaces++; }
  if (spaces >= 4 || p >= text.length || text[p] !== '[') return null;
  const lab = parseLabel(text, p);
  if (!lab) return null;
  if (lab.label.length > 999) return null;
  if (normLabel(lab.label) === '') return null;
  let q = lab.next;
  if (q >= text.length || text[q] !== ':') return null;
  q++;
  q = skipWSNL(text, q);
  const dest = parseDest(text, q);
  // an empty destination is only valid as <> (angle brackets were consumed)
  if (!dest || (dest.dest === '' && dest.next === q)) return null;
  // optional title: it must be separated from the destination by whitespace,
  // and it may sit on a following line
  let title = null;
  let endPos = dest.next;
  const q2 = skipWSNL(text, dest.next);
  if (q2 < text.length && (text[q2] === '"' || text[q2] === "'" || text[q2] === '(')) {
    if (q2 === dest.next) return null; // no whitespace before the title
    const t = parseTitle(text, q2);
    if (t) {
      // the rest of the title's line must be blank
      let r2 = t.next;
      while (r2 < text.length && (text[r2] === ' ' || text[r2] === '\t')) r2++;
      if (r2 >= text.length || text[r2] === '\n') {
        title = t.title;
        endPos = t.next;
      } else if (lineStartFor(text, lineStart, q2) > lineStartFor(text, lineStart, dest.next)) {
        // title on a later line and unusable: keep the destination only
        endPos = dest.next;
      } else {
        return null; // title on the destination's own line and unusable
      }
    } else if (lineStartFor(text, lineStart, q2) > lineStartFor(text, lineStart, dest.next)) {
      endPos = dest.next; // title on a later line and unparseable: destination only
    } else {
      return null;
    }
  }
  // the rest of the line where the definition ends must be blank
  let r = endPos;
  while (r < text.length && (text[r] === ' ' || text[r] === '\t')) r++;
  if (r < text.length && text[r] !== '\n') return null;
  let linesUsed = 0;
  for (let k = 0; k < maxLines; k++) if (lineStart[k] <= r) linesUsed = k + 1;
  if (linesUsed === 0) linesUsed = 1;
  return { dest: dest.dest, title, key: normLabel(lab.label), linesUsed };
}

// line index (0-based) of a position inside the definition text
function lineStartFor(text, lineStart, pos) {
  let line = 0;
  for (let k = 0; k < lineStart.length; k++) if (lineStart[k] <= pos) line = k;
  return line;
}

// extract leading link definitions from a paragraph's text; returns the rest
function extractLinkDefs(P, text) {
  const lines = text.split('\n');
  let i = 0;
  while (i < lines.length) {
    const d = parseDefFromLines(lines, i, lines.length);
    if (!d) break;
    if (!P.refs.has(d.key)) P.refs.set(d.key, { dest: d.dest, title: d.title });
    i += d.linesUsed;
  }
  return lines.slice(i).join('\n');
}

// ---- GFM tables ----
function splitTableRow(line) {
  // split on unescaped '|'; a leading/trailing pipe is dropped
  const cells = [];
  let cur = '', j = 0;
  // leading pipe (after optional leading whitespace)
  while (j < line.length && (line[j] === ' ' || line[j] === '\t')) j++;
  if (line[j] === '|') j++;
  // trailing pipe (unescaped)
  let end = line.length;
  if (end > j && line[end - 1] === '|' && (end < 2 || line[end - 2] !== '\\')) end--;
  for (; j < end; j++) {
    const ch = line[j];
    if (ch === '\\' && j + 1 < end && (line[j + 1] === '|' || line[j + 1] === '\\')) {
      cur += line[j + 1];
      j++;
    } else if (ch === '|') {
      cells.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}
function parseTable(lines) {
  if (lines.length < 2) return null;
  // a delimiter row indented 4+ columns is not a table row
  if (indentOfStr(lines[1], 0).cols >= 4) return null;
  const header = splitTableRow(lines[0]);
  const delim = splitTableRow(lines[1]);
  if (header.length !== delim.length) return null;
  const aligns = [];
  for (const cell of delim) {
    if (!/^:?-+:?$/.test(cell)) return null;
    const left = cell[0] === ':';
    const right = cell[cell.length - 1] === ':';
    aligns.push(left && right ? 'center' : left ? 'left' : right ? 'right' : '');
  }
  const rows = [];
  for (let i = 2; i < lines.length; i++) {
    const cells = splitTableRow(lines[i]);
    while (cells.length < header.length) cells.push('');
    rows.push(cells.slice(0, header.length));
  }
  return { header, aligns, rows };
}

// does this line contain the end marker for an HTML block of the given type?
function htmlEndsOnLine(ht, content) {
  if (ht === 1) return /<\/(script|pre|style|textarea)/i.test(content);
  if (ht === 2) return content.includes('-->');
  if (ht === 3) return content.includes('?>');
  if (ht === 4) return content.includes('>');
  if (ht === 5) return content.includes(']]>');
  return false;
}

// ---- finalization (data extraction; HTML is rendered in a later pass) ----
function finalizeNode(P, node) {
  if (node.t === 'para') {
    const rest = extractLinkDefs(P, node.text || '');
    if (rest === '') { node.t = 'empty'; node.text = ''; return; }
    const lines = rest.split('\n');
    const table = parseTable(lines);
    if (table) { node.t = 'table'; node.table = table; node.text = ''; }
    else node.text = rest;
    return;
  }
  if (node.t === 'code') {
    let text = node.text || '';
    if (!node.fenced) {
      // an indented code block drops its trailing blank lines
      text = text.replace(/\n+$/, '');
      if (text) text += '\n';
    } else if (text.endsWith('\n\n') || text === '\n') {
      // a fenced block drops one trailing newline when its last
      // content line was blank
      text = text.slice(0, -1);
    }
    node.html = '<pre><code' + codeClass(node.info) + '>' + escStrict(text) + '</code></pre>\n';
    return;
  }
  if (node.t === 'html') {
    let text = node.text || '';
    if ((node.htmlType === 6 || node.htmlType === 7) && !P.atEnd &&
        text.endsWith('\n')) text = text.slice(0, -1);
    node.html = text;
    return;
  }
  if (node.t === 'hr') {
    node.html = '<hr>\n';
    return;
  }
}
function codeClass(info) {
  if (!info) return '';
  const lang = info.split(/\s+/)[0];
  return lang ? ' class="language-' + escText(lang) + '"' : '';
}

// ---- rendering pass (after the whole document is parsed) ----
function renderNode(node, refs, tightList) {
  switch (node.t) {
    case 'doc':
      return node.children.map((c) => renderNode(c, refs, false)).join('');
    case 'empty':
      return '';
    case 'para': {
      return '<p>' + inlineParse(node.text, refs) + '</p>\n';
    }
    case 'heading':
      return '<h' + node.level + '>' + inlineParse(node.text, refs) + '</h' + node.level + '>\n';
    case 'quote':
      return '<blockquote>\n' + node.children.map((c) => renderNode(c, refs, false)).join('') + '</blockquote>\n';
    case 'list': {
      const tag = node.ordered ? 'ol' : 'ul';
      const startAttr = node.ordered && node.start !== 1 ? ' start="' + node.start + '"' : '';
      return '<' + tag + startAttr + '>\n' +
        node.children.map((c) => renderNode(c, refs, node.tight)).join('') +
        '</' + tag + '>\n';
    }
    case 'item': {
      // a paragraph directly inside a tight list item loses its <p> wrapper;
      // it is followed by a newline only when another block follows it.
      let out = '<li>';
      const kids = node.children;
      // GFM task list: a first paragraph starting with [ ] / [x] / [X]
      // (followed by a space or end of line) becomes a checkbox
      let task = null;
      if (kids.length > 0 && kids[0].t === 'para') {
        const m = kids[0].text.match(/^\[([ xX])\]( |$)/);
        if (m) {
          task = {
            checked: m[1] === 'x' || m[1] === 'X',
            rest: kids[0].text.slice(m[0].length),
          };
        }
      }
      for (let i = 0; i < kids.length; i++) {
        const c = kids[i];
        if (i === 0 && task) {
          const box = task.checked
            ? '<input checked="" disabled="" type="checkbox">'
            : '<input disabled="" type="checkbox">';
          const inner = task.rest ? ' ' + inlineParse(task.rest, refs) : '';
          if (c.t === 'para' && tightList) out += box + inner;
          else out += '<p>' + box + inner + '</p>\n';
        } else if (c.t === 'para' && tightList) {
          out += inlineParse(c.text, refs);
        } else {
          out += renderNode(c, refs, tightList);
        }
      }
      out += '</li>\n';
      return out;
    }
    case 'table': {
      const t = node.table;
      let out = '<table>\n<thead>\n<tr>\n';
      for (let i = 0; i < t.header.length; i++) {
        const a = t.aligns[i];
        out += a ? '<th align="' + a + '">' : '<th>';
        out += inlineParse(t.header[i], refs);
        out += '</th>\n';
      }
      out += '</tr>\n</thead>\n';
      if (t.rows.length > 0) {
        out += '<tbody>';
        for (const row of t.rows) {
          out += '<tr>\n';
          for (let i = 0; i < row.length; i++) {
            const a = t.aligns[i];
            out += a ? '<td align="' + a + '">' : '<td>';
            out += inlineParse(row[i], refs);
            out += '</td>\n';
          }
          out += '</tr>\n';
        }
        out += '</tbody>';
      }
      out += '</table>\n';
      return out;
    }
    default:
      return node.html || '';
  }
}

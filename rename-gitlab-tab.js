// ==UserScript==
// @name         Shorten GitLab tab titles
// @match        https://gitlab.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
  console.log('gitlab-title script loaded');
  const cut = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;
  const words = ['Merge requests?', 'Issues?', 'Pipelines?', 'Jobs?',
    'Repository', 'Snippets', 'Wiki', 'Activity', 'Settings', 'Files',
    'Members', 'Labels', 'Boards', 'Releases', 'Analytics', 'Security',
    'Registry', 'Deployments', 'Environments', 'Terraform', 'Kubernetes',
    'Packages', 'Audit', 'Value stream', 'Roadmap', 'CI\\/CD', 'General',
    'Compliance', 'Runner', 'Cluster'];
  const section = new RegExp('^(' + words.join('|') + ')$');

  const pageKind = part => {
    const m = part.match(/([!#])(\d+)\)?$/);
    return m ? { marker: m[1], id: m[2] } : null;
  };
  const pageType = (part, kind) => {
    const body = cut(part
      .slice(0, part.lastIndexOf(kind.marker + kind.id))
      .replace(/ ?\($/, '')
      .replace(/^[a-z]+(\([^)]*\))?: /, ''), 30);
    return kind.marker + kind.id + (body ? ' ' + body : '');
  };
  const getTypeOfPage = parts => {
    const pagePart = parts.map(p => ({ p, k: pageKind(p) })).find(x => x.k);
    if (pagePart) return pageType(pagePart.p, pagePart.k);
    const sectionWord = parts.find(p => section.test(p));
    if (sectionWord) return sectionWord;
    return parts[0] || 'Overview';
  };
  const formatTitle = (project, type) => cut('[' + project + '] ' + type, 60).trim();

  const shorten = v => {
    const parts = v.split(' · ').filter(p => p !== 'GitLab');
    const project = parts.pop().split(' / ').pop();
    return formatTitle(project, getTypeOfPage(parts));
  };

  const orig = Object.getOwnPropertyDescriptor(Document.prototype, 'title');
  let last = '';
  const write = v => { last = v; orig.set.call(document, v); };
  const sync = () => {
    const t = orig.get.call(document);
    if (t && t !== last) write(shorten(t));
  };
  Object.defineProperty(document, 'title', {
    get() { return orig.get.call(document); },
    set(v) { write(shorten(v)); }
  });

  const observer = new MutationObserver(sync);
  const hook = () => {
    const el = document.querySelector('title');
    if (el) observer.observe(el, { childList: true });
  };
  const rename = () => { const t = orig.get.call(document); if (t) write(shorten(t)); };
  new MutationObserver(hook).observe(document.documentElement, { childList: true, subtree: true });
  rename();
  hook();
  setInterval(sync, 1000);
})();

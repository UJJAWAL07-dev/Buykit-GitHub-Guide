import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDown, ArrowUpRight, Check, CheckCircle2, ChevronRight, Clipboard,
  ExternalLink, GitBranch, Menu, RotateCcw, Search, ShieldCheck, Terminal, X
} from 'lucide-react';
import './style.css';

type Section = { id: string; number: string; label: string; title: string };

const sections: Section[] = [
  { id: 'answer', number: '01', label: 'FOUNDATIONS', title: 'What actually is GitHub?' },
  { id: 'map', number: '02', label: 'MENTAL MODEL', title: 'The moving parts' },
  { id: 'account', number: '03', label: 'START HERE', title: 'Set up your account' },
  { id: 'repo', number: '04', label: 'REPOSITORIES', title: 'Build your first repository' },
  { id: 'commits', number: '05', label: 'HISTORY', title: 'Commits, branches & undoing mistakes' },
  { id: 'pr', number: '06', label: 'COLLABORATION', title: 'Pull requests, forks & issues' },
  { id: 'local', number: '07', label: 'LOCAL GIT', title: 'Work from your computer' },
  { id: 'tools', number: '08', label: 'POWER TOOLS', title: 'Pages, Actions, Codespaces & more' },
  { id: 'security', number: '09', label: 'SECURITY', title: 'Keep secrets out' },
  { id: 'project', number: '10', label: 'SHIP IT', title: 'Build your first real project' },
  { id: 'faq', number: '11', label: 'NO MYSTERIES', title: 'Questions beginners ask' },
];

const commands = [
  ['git status', 'See what changed, what is staged, and which branch you are on.', 'Run this when you feel lost.'],
  ['git add .', 'Stage the current changes for the next commit.', 'Review status first so you know what you are staging.'],
  ['git commit -m "message"', 'Record a named snapshot of the staged changes.', 'Describe the change, not your mood.'],
  ['git push', 'Send your local commits to a remote repository such as GitHub.', 'Push after committing, and check your branch first.'],
  ['git pull', 'Bring remote changes into your local branch.', 'Use before shared work when others may have pushed.'],
  ['git clone URL', 'Download an existing remote repository to your computer.', 'Use it when starting from a project that already exists.'],
  ['git switch -c feature-name', 'Create a new branch and switch to it.', 'Use a focused branch for a feature or fix.'],
  ['git diff', 'Inspect unstaged line-by-line changes.', 'Use it before staging when you want to review your work.'],
  ['git log --oneline', 'Read a compact view of your commit history.', 'Useful when you need context about older changes.'],
  ['git stash', 'Temporarily put unfinished changes aside.', 'Useful when you must change branches without committing yet.'],
];

const faqs = [
  ['Is GitHub the same as Git?', 'No. Git is the version-control system that tracks project history. GitHub hosts Git repositories online and adds collaboration features such as pull requests, issues, code review and automation.'],
  ['Can I use GitHub without knowing Git?', 'Yes. You can create repositories, edit files in the browser and collaborate without using a terminal. Learning a small set of Git commands becomes valuable as soon as you work locally or with other developers.'],
  ['Should my first repository be public?', 'Only if you are comfortable making its contents public. A private repository is often better for coursework, unfinished experiments or anything containing information that should not be shared.'],
  ['What should I never upload?', 'Never intentionally commit passwords, API keys, private tokens, cloud credentials, private certificates or other secrets. Also avoid generated dependency folders such as node_modules when the project uses a package manager.'],
  ['What is the difference between clone, pull and push?', 'Clone creates your local copy of a remote repository. Pull brings new remote changes into your local branch. Push sends your local commits to the remote repository.'],
  ['What is a fork?', 'A fork is your own copy of another user or organization repository on GitHub. It is commonly used when you want to propose changes to a project where you do not have direct write access.'],
];

const external = (href: string, label: string) => (
  <a href={href} target="_blank" rel="noreferrer" className="inline-link">{label} <ExternalLink size={13} aria-hidden="true" /></a>
);

function Copy({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard?.writeText(value); } catch { /* clipboard can be unavailable in preview */ }
    setDone(true);
    window.setTimeout(() => setDone(false), 1200);
  };
  return <button className="copy" type="button" aria-label={`Copy ${value}`} onClick={copy}>{done ? <Check size={14} /> : <Clipboard size={14} />}{done ? 'Copied' : 'Copy'}</button>;
}

function Code({ children, label = 'terminal' }: { children: string; label?: string }) {
  return <div className="code-block"><div className="code-bar"><span>{label}</span><Copy value={children} /></div><pre><code><b>$</b> {children}</code></pre></div>;
}

function SectionHead({ section, title, intro }: { section: Section; title: string; intro?: React.ReactNode }) {
  return <header className="section-head"><div className="section-index"><span>{section.number}</span><span>{section.label}</span></div><h2>{title}</h2>{intro && <p className="lede">{intro}</p>}</header>;
}

function App() {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState('answer');
  const [menu, setMenu] = useState(false);
  const [map, setMap] = useState('You');
  const [prTab, setPrTab] = useState('Conversation');
  const [terminal, setTerminal] = useState('Choose a command. This safe simulation never runs anything on your computer.');
  const [terminalNote, setTerminalNote] = useState('Pick a command to see the output and why you would use it.');
  const [bad, setBad] = useState<string[]>([]);
  const [checked, setChecked] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('buykit-github-checklist') || '[]'); } catch { return []; }
  });

  const term = useMemo(() => ({
    'git status': ['On branch main\nChanges not staged for commit:\n  modified:   style.css', 'Status tells you where you are and what Git currently sees as changed.'],
    'git add .': ['Staged 2 files.\nYour next commit will include them.', 'Staging is the review area between editing files and making a commit.'],
    'git commit': ['[main a1b2c3d] Add responsive navigation\n 2 files changed, 41 insertions(+)', 'A commit records the staged snapshot and gives it a message plus an ID.'],
    'git push': ['Enumerating objects: 5, done.\nTo github.com:you/first-project.git\n   8d4c...a1b2  main -> main', 'Push sends commits from your local repository to its remote repository.'],
  } as Record<string, [string, string]>), []);

  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setProgress(Math.min(100, Math.round((window.scrollY / max) * 100)));
      let found = 'answer';
      sections.forEach(section => {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top < 220) found = section.id;
      });
      setActive(found);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const jump = (id: string) => {
    setMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleChecklist = (item: string) => {
    const next = checked.includes(item) ? checked.filter(x => x !== item) : [...checked, item];
    setChecked(next);
    localStorage.setItem('buykit-github-checklist', JSON.stringify(next));
  };

  const mapText: Record<string, string> = {
    You: 'the person making decisions.',
    Project: 'the files that become a website, app, assignment or experiment.',
    Git: 'the local version-control system that records project history.',
    Repository: 'the project plus the history Git records for it.',
    Commit: 'a named snapshot of staged changes.',
    Branch: 'a separate line of work for a focused change.',
    'Pull request': 'a proposal to merge one branch into another on GitHub.',
    Review: 'the conversation, comments and checks around a proposed change.',
    Merge: 'the operation that joins one line of development into another.',
    GitHub: 'the online platform that hosts repositories and collaboration workflows.',
  };

  const checklist = ['Explain Git vs GitHub', 'Create a repository', 'Commit changes', 'Create a branch', 'Push code', 'Pull code', 'Clone a repository', 'Open a pull request', 'Fork a repository', 'Write a README', 'Protect secrets', 'Publish a simple website'];
  const risky = ['node_modules/', '.env', 'final-final/'];

  return <>
    <div className="progress" style={{ transform: `scaleX(${progress / 100})` }} aria-hidden="true" />
    <header className="topbar">
      <a className="brand" href="https://buykit.in/" target="_self" aria-label="Visit BuyKit website" onClick={(event) => { event.preventDefault(); window.location.assign("https://buykit.in/"); }}>
        <img src="https://insights.buykit.in/images/buykit-logo.png" alt="BuyKit" />
        <span><b>BUYKIT</b><i>/</i> FIELD GUIDE</span>
      </a>
      <div className="top-meta"><span>GITHUB FOR BEGINNERS</span><b>{progress}%</b><span>READ</span></div>
      <button className="menu-button" type="button" aria-label="Toggle guide navigation" aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
    </header>

    <aside className={`toc ${menu ? 'open' : ''}`} aria-label="Guide sections">
      <div className="toc-head"><span>IN THIS GUIDE</span><small>SCROLL TO EXPLORE</small></div>
      {sections.map(section => <a key={section.id} href={`#${section.id}`} className={active === section.id ? 'selected' : ''} onClick={() => setMenu(false)}><b>{section.number}</b><span>{section.title}</span></a>)}
      <a className="toc-source" href="https://docs.github.com/en/get-started" target="_blank" rel="noreferrer">Official GitHub Docs <ExternalLink size={12} /></a>
    </aside>

    <main id="top">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-topline"><span>BUYKIT / FIELD NOTES / 01</span><span>UPDATED <time dateTime="2026-09-22">22 SEP 2026</time></span></div>
        <div className="hero-kicker">GitHub for beginners · a practical visual guide</div>
        <h1 id="hero-title">GITHUB<br /><span>FROM ZERO</span><br /><em>TO SHIPPING.</em></h1>
        <div className="hero-deck"><p>Everything you need to go from “what is a repository?” to confidently creating, committing, branching, collaborating and shipping your own first project.</p><div className="hero-flow"><span>EDIT</span><b>→</b><span>COMMIT</span><b>→</b><span>PUSH</span><b>→</b><span>COLLABORATE</span></div></div>
        <div className="hero-actions"><a className="primary-cta" href="#answer">Start the guide <ArrowDown size={17} /></a><span>~35 min · beginner friendly · interactive</span></div>
        <div className="hero-bottomline"><span>GIT IS THE ENGINE.</span><span>GITHUB IS THE COLLABORATION LAYER.</span></div>
      </section>

      <nav className="intent" aria-label="Choose a learning path">
        <div className="intent-label">IF YOU ARE THINKING…</div>
        <div className="intent-title">“I just want to know what to do next.”</div>
        <div className="intent-links">
          <a href="#repo">I have a project already <ArrowUpRight size={14} /></a>
          <a href="#account">I am completely new <ArrowUpRight size={14} /></a>
          <a href="#local">I want to use VS Code + Git <ArrowUpRight size={14} /></a>
          <a href="#pr">I want to collaborate <ArrowUpRight size={14} /></a>
          <a href="#tools">I want to publish a site <ArrowUpRight size={14} /></a>
        </div>
      </nav>

      <article>
        <section id="answer">
          <SectionHead section={sections[0]} title="What actually is GitHub?" intro="Start with the one distinction that makes almost everything else easier." />
          <div className="prose"><p>Imagine a project that works perfectly at 10:05 PM. By 11:00, three hopeful changes have turned it into a small disaster. <strong>Git</strong> gives you named snapshots, so “the version that worked” is never a mystery.</p><p><strong>GitHub</strong> is an online platform built around Git repositories. It stores repositories remotely and adds tools for collaboration: pull requests, reviews, issues, discussions, automation and more. Git itself can work perfectly well without GitHub. </p></div>
          <div className="quote-rule"><span>THE SHORT VERSION</span><strong>Git tracks the history. GitHub helps people work with that history together.</strong></div>
          <figure className="pipeline"><div><b>YOUR LAPTOP</b><small>files you edit</small></div><span>→</span><div className="accent"><b>GIT</b><small>history + snapshots</small></div><span>→</span><div><b>GITHUB</b><small>remote repository</small></div><span>→</span><div><b>PEOPLE</b><small>review + collaborate</small></div><figcaption>Git can live locally. GitHub adds the online collaboration layer.</figcaption></figure>
          <div className="comparison"><div><span>01 / LOCAL</span><h3>Git</h3><p>Runs on your computer. Tracks changes, branches and commits. It does not require an internet connection for normal local history work.</p></div><div><span>02 / ONLINE</span><h3>GitHub</h3><p>Hosts Git repositories and adds a web workflow around them: pull requests, issues, reviews, permissions, automation and community.</p></div></div>
          <div className="source-note">Based on the current GitHub and Git documentation. {external('https://docs.github.com/en/get-started/using-git/about-git', 'Read GitHub’s explanation of Git')}.</div>
        </section>

        <section id="map" className="wide">
          <SectionHead section={sections[1]} title="The map before the terrain" intro="Do not memorise the vocabulary. Click through it until the relationships make sense." />
          <div className="map-wrap"><div className="map-label"><span>THE GITHUB FLOW</span><small>CLICK A NODE</small></div><div className="map" aria-label="Interactive GitHub concept map">{['You', 'Project', 'Git', 'Repository', 'Commit', 'Branch', 'Pull request', 'Review', 'Merge', 'GitHub'].map((x, i) => <React.Fragment key={x}><button type="button" aria-pressed={map === x} className={map === x ? 'on' : ''} onClick={() => setMap(x)}>{x}</button>{i < 9 && <b>↓</b>}</React.Fragment>)}</div><p className="map-copy"><strong>{map}</strong><span>{mapText[map]}</span></p></div>
          <div className="three-column"><div><span>REPOSITORY</span><strong>Project home + history</strong><p>Files, folders and Git history live together.</p></div><div><span>BRANCH</span><strong>Safe parallel work</strong><p>Change one thing without disturbing the main line.</p></div><div><span>PULL REQUEST</span><strong>Propose the change</strong><p>Compare, discuss, check and merge.</p></div></div>
        </section>

        <section id="account">
          <SectionHead section={sections[2]} title="Set up your account with intent" intro="You can start quickly, but a few small choices save future headaches." />
          <ol className="steps"><li><b>01</b><div><strong>Create and verify your account.</strong><p>Use an email you can access long-term. Verification is part of the normal onboarding flow.</p></div></li><li><b>02</b><div><strong>Choose a username you will not hate later.</strong><p>It becomes part of your public profile URL, so readable usually beats clever.</p></div></li><li><b>03</b><div><strong>Make the profile useful.</strong><p>Add a short bio, relevant links and a few repositories worth showing. You do not need to pretend you are a senior developer.</p></div></li><li><b>04</b><div><strong>Protect the account.</strong><p>Turn on two-factor authentication and use a unique password or password manager.</p></div></li></ol>
          <div className="tip"><ShieldCheck /><div><strong>Public means public.</strong><p>Before creating a public repository, remember that source code, commit history, issues and many profile details can be visible to other people.</p></div></div>
        </section>

        <section id="repo">
          <SectionHead section={sections[3]} title="Build your first repository" intro="A repository is not just a folder online. Think of it as the home, history and collaboration space for a project." />
          <div className="repo-choice"><div><span>STARTING FROM SCRATCH</span><strong>Create it on GitHub</strong><p>Choose a clear name, description and visibility. A README is useful when the repository starts on GitHub.</p></div><div><span>ALREADY HAVE CODE</span><strong>Connect your local project</strong><p>Initialise Git locally, make a first commit, add the GitHub remote, then push your branch.</p></div></div>
          <div className="repo"><div className="repo-bar"><GitBranch size={17} /> you / <b>my-first-project</b><span>Public</span></div><pre>my-first-project/<br />├── <b>README.md</b><br />├── index.html<br />├── style.css<br />├── script.js<br />└── .gitignore</pre></div>
          <div className="readme"><div className="readme-top"><span>README.md</span><small>PROJECT FRONT DOOR</small></div><h3>A README should answer “what am I looking at?”</h3><p>Tell a visitor what the project does, how to run it, which tools you used and where they can see it. Add screenshots or a demo when they genuinely help.</p><pre># My first project<br /><br />A small browser project for practising Git and GitHub.<br /><br />## Run it<br />Open index.html in a browser.</pre></div>
          <div className="micro-note"><strong>Pro tip:</strong> Name repositories like you expect someone else to search for them. <code>study-timer</code> says more than <code>project123</code>.</div>
        </section>

        <section id="commits">
          <SectionHead section={sections[4]} title="Commits, branches & undoing mistakes" intro="The point of Git is not to make you type commands. The point is to make change understandable." />
          <div className="timeline"><div><time>10:02</time><b>Initial project</b><small>Set up HTML and CSS</small></div><div><time>10:18</time><b>Add navigation</b><small>One focused checkpoint</small></div><div><time>10:41</time><b>Fix mobile overflow</b><small>The message tells future-you why</small></div><div><time>11:05</time><b>Add dark mode</b><small>History stays readable</small></div></div>
          <div className="goodbad"><div><span>WEAK</span><code>update<br />changes<br />asdf</code></div><div><span>USEFUL</span><code>Add responsive navigation<br />Fix mobile menu overflow<br />Add dark mode toggle</code></div></div>
          <h3 className="sub">Branches are workspaces for change</h3><div className="branch"><div className="mainline"><b>main</b><i /><i /><i /></div><div className="forkline"><b>feature/navbar</b><i /><i /></div><div className="forkline dark"><b>feature/dark-mode</b><i /><i /></div><div className="forkline second"><b>fix/mobile-layout</b><i /></div><p>Create branch → make changes → commit → push → pull request → review → merge.</p></div>
          <div className="mistakes"><span>WHEN SOMETHING GOES WRONG</span><strong>Do not panic. First inspect.</strong><p><code>git status</code> and <code>git diff</code> are often better first moves than random undo commands. If you need to recover something destructive, stop and check the official Git documentation before continuing.</p></div>
        </section>

        <section id="pr" className="wide">
          <SectionHead section={sections[5]} title="A pull request is a proposed change" intro="A pull request gives people a shared place to compare a branch, discuss it, run checks and decide whether it should be merged." />
          <div className="pr"><div className="pr-top"><GitBranch size={18} /><b>feature/navbar</b><ChevronRight size={16} /><b>main</b><span>Open</span></div><div className="tabs" role="tablist" aria-label="Pull request views">{['Conversation', 'Files changed', 'Commits', 'Checks'].map(x => <button type="button" role="tab" aria-selected={prTab === x} className={prTab === x ? 'active' : ''} onClick={() => setPrTab(x)} key={x}>{x}</button>)}</div><div className="pr-content">{prTab === 'Conversation' && <><b>Priya requested review</b><p>“The menu is keyboard-friendly now. Could you check the phone layout?”</p><button className="approve" type="button">✓ Approve</button></>}{prTab === 'Files changed' && <pre>+ &lt;nav aria-label="Main navigation"&gt;<br />+   …<br />+ &lt;/nav&gt;</pre>}{prTab === 'Commits' && <p><b>3 commits</b><br />Add responsive navigation<br />Fix focus ring contrast<br />Tidy mobile spacing</p>}{prTab === 'Checks' && <p className="pass">● All checks have passed</p>}</div></div>
          <div className="three-column collaboration"><div><span>FORK</span><strong>Your copy</strong><p>Use a fork when you want to propose changes to a repository where you do not have direct write access.</p></div><div><span>ISSUE</span><strong>Track a problem</strong><p>A bug, task, question or feature request with context and discussion.</p></div><div><span>DISCUSSION</span><strong>Talk it through</strong><p>Longer conversations that do not need to be tied to a single bug or code change.</p></div></div>
        </section>

        <section id="local">
          <SectionHead section={sections[6]} title="Work from your computer" intro="Browser editing is useful. Local Git becomes powerful when you are building real projects in VS Code or another editor." />
          <div className="install-grid"><div><span>01 / INSTALL</span><h3>Get Git</h3><p>Use the official installer for your operating system.</p>{external('https://git-scm.com/downloads', 'Download Git')}</div><div><span>02 / CONFIGURE</span><h3>Identify your commits</h3><p>Set your name and email once on your computer.</p></div></div>
          <Code>git --version</Code><Code>git config --global user.name "Your Name"</Code><Code>git config --global user.email "you@example.com"</Code>
          <div className="workflow"><span>EDIT</span><b>↓</b><span>STATUS</span><b>↓</b><span>ADD</span><b>↓</b><span>COMMIT</span><b>↓</b><span className="accent">PUSH</span><b>↓</b><span>GITHUB</span><b>↓</b><span>PR</span></div>
          <h3 className="sub">A safe terminal rehearsal</h3>
          <div className="sim"><div className="sim-head"><span><Terminal size={16} /> simulated terminal <i>SAFE / LOCAL DEMO</i></span><button className="reset-terminal" type="button" onClick={() => { setTerminal('Choose a command. This safe simulation never runs anything on your computer.'); setTerminalNote('Pick a command to see the output and why you would use it.'); }}><RotateCcw size={13} /> Reset</button></div><pre aria-live="polite">$ <span>{terminal}</span></pre><div className="sim-controls">{Object.keys(term).map(x => <button type="button" key={x} onClick={() => { setTerminal(term[x][0]); setTerminalNote(term[x][1]); }}>{x}</button>)}</div><p className="sim-explain"><CheckCircle2 size={16} />{terminalNote}</p></div>
          <div className="command-flow"><div><b>Have code already?</b><code>git init</code><code>git add .</code><code>git commit -m "Initial commit"</code></div><div><b>Connect it to GitHub</b><code>git remote add origin URL</code><code>git branch -M main</code><code>git push -u origin main</code></div></div>
          <p className="source-note">Git's official documentation covers repositories, staging, commits, branches and remotes in more detail. {external('https://git-scm.com/book/en/v2', 'Read Pro Git')}.</p>
        </section>

        <section id="tools">
          <SectionHead section={sections[7]} title="Power tools — later, not all at once" intro="You do not need every GitHub feature on day one. Learn them when a project gives you a reason." />
          <div className="tool-grid">{[
            ['GitHub Pages', 'Publish a static HTML/CSS/JS project from a repository.', 'After your first small website.'],
            ['GitHub Actions', 'Automate tests, builds and deployments when repository events happen.', 'After you can push confidently.'],
            ['Codespaces', 'A cloud development environment connected to a repository.', 'When local setup becomes a bottleneck.'],
            ['GitHub CLI', 'Use the gh command-line tool for GitHub tasks such as pull requests and issues.', 'After basic Git feels normal.'],
            ['Dependabot', 'Surface dependency updates and security-related update work.', 'When your project has dependencies.'],
            ['Projects', 'Plan and track work using issues, views, boards or tables.', 'When a project has enough work to organise.'],
          ].map(([name, desc, when], i) => <div className="tool" key={name}><span>0{i + 1}</span><h3>{name}</h3><p>{desc}</p><small><b>Learn when:</b> {when}</small></div>)}</div>
          <div className="yaml"><div><span>.github/workflows/test.yml</span><small>CONCEPTUAL EXAMPLE</small></div><pre>{`name: Test\non: [push]\njobs:\n  check:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo "Run tests here"`}</pre></div>
          <div className="tools-links"><span>PRIMARY SOURCES</span>{external('https://docs.github.com/pages', 'GitHub Pages')}{external('https://docs.github.com/actions', 'GitHub Actions')}{external('https://docs.github.com/codespaces', 'Codespaces')}{external('https://cli.github.com/manual/', 'GitHub CLI')}</div>
        </section>

        <section id="security">
          <SectionHead section={sections[8]} title="Never make secrets part of project history" intro="Security is part of the GitHub workflow, not an optional chapter you read after something goes wrong." />
          <div className="security"><div><span>DO NOT COMMIT</span><code>API_KEY=abc123…<br />PASSWORD=letmein<br />AWS_SECRET_ACCESS_KEY=…</code></div><div><span>DO THIS INSTEAD</span><code>.env<br /><br /># .gitignore<br />.env<br />node_modules/</code></div></div>
          <div className="warning"><ShieldCheck /><p><strong>If a secret reaches GitHub:</strong> revoke or rotate it immediately. Deleting the file in a later commit does not automatically erase the secret from every place it may have appeared. {external('https://docs.github.com/en/code-security/secret-scanning/remediating-a-leaked-secret', 'Follow GitHub’s current secret-remediation guidance')}.</p></div>
          <h3 className="sub">Repair this repository</h3><p className="lede">Click the entries that should not be committed. Then look at the clean version.</p>
          <div className="repair">{['node_modules/', '.env', 'final-final/', 'README.md', 'src/', 'package.json'].map(x => { const safe = !risky.includes(x); return <button type="button" className={`${bad.includes(x) ? 'hit ' : ''}${safe ? 'safe' : ''}`} onClick={() => !safe && setBad([...new Set([...bad, x])])} key={x}>{x}{bad.includes(x) && ' ✓'}</button>; })}</div>
          {bad.length > 0 && <p className="clean"><CheckCircle2 size={15} /> Good catches: {bad.join(' · ')}</p>}
        </section>

        <section id="project">
          <SectionHead section={sections[9]} title="Build your first real project" intro="The fastest way to understand GitHub is to use it for something small enough to finish." />
          <div className="project"><div><span>WEEKEND PROJECT</span><h3>Build a study-timer website.</h3><p>Keep it deliberately small: start/stop timer, a clean interface and a README. The goal is practising an honest workflow, not shipping a startup.</p></div><ol><li>Create <code>study-timer</code> on GitHub.</li><li>Build the first version on <code>main</code> only if you are working alone.</li><li>Create <code>feature/timer</code> for the main feature.</li><li>Commit small, understandable changes.</li><li>Push the branch and open a pull request.</li><li>Review it, merge it and publish the static site with Pages.</li></ol></div>
          <h3 className="sub">Command cheat sheet</h3><div className="cheat">{commands.map(([command, description, remember]) => <div key={command}><div><code>{command}</code><Copy value={command} /></div><p>{description}</p><small><strong>Remember:</strong> {remember}</small></div>)}</div>
          <div className="checklist-head"><div><span>FINAL CHECK</span><h3 className="sub">You are ready when you can…</h3></div><strong>{checked.length} / {checklist.length}</strong></div>
          <div className="checklist">{checklist.map(item => <button type="button" onClick={() => toggleChecklist(item)} className={checked.includes(item) ? 'done' : ''} key={item}><i>{checked.includes(item) ? <Check size={14} /> : null}</i>{item}</button>)}</div>
        </section>

        <section id="faq">
          <SectionHead section={sections[10]} title="Questions beginners ask" intro="A few answers worth bookmarking before you start experimenting." />
          <div className="faq">{faqs.map(([q, a]) => <details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div>
          <div className="learn"><div><span>PRIMARY SOURCES</span><h3>When in doubt, read the docs closest to the source.</h3></div>{external('https://docs.github.com/en/get-started', 'GitHub Docs')}{external('https://git-scm.com/doc', 'Git documentation')}{external('https://skills.github.com/', 'GitHub Skills')}{external('https://docs.github.com/pages', 'GitHub Pages')}</div>
          <div className="search-strip"><Search size={16} /><div><strong>What should you search next?</strong><p>Try “GitHub flow”, “Git branching”, “GitHub Pages”, “GitHub Actions” or the exact Git command you are trying to understand.</p></div></div>
        </section>
      </article>
    </main>

    <footer><a className="footer-brand" href="https://buykit.in/" target="_self" aria-label="Visit BuyKit website" onClick={(event) => { event.preventDefault(); window.location.assign("https://buykit.in/"); }}><img src="https://insights.buykit.in/images/buykit-logo.png" alt="BuyKit" /><span>BUYKIT / FIELD GUIDE</span></a><p>Built for people who are tired of confusing GitHub tutorials.</p><div className="footer-links">{external('https://buykit.in', 'BuyKit')}{external('https://github.com/', 'GitHub')}{external('https://docs.github.com/', 'GitHub Docs')}</div><small>© {new Date().getFullYear()} BuyKit · Updated September 2026</small></footer>
  </>;
}

createRoot(document.getElementById('root')!).render(<App />);

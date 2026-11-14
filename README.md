# Tissue

A simple static website starter built with **Python, Markdown, Jinja, and Tailwind CSS**, ready to build and host on Cloudflare Pages.

Write your content in Markdown, customize the templates with Tailwind, and run `build.sh` to generate a complete site. Python and Node.js are needed only for the build; the published site is static HTML, CSS, and JavaScript.

## Included

- A responsive layout with a shared header, content section, and footer.
- A hamburger menu linking to Home, About, and Search.
- A search icon linking to a search page powered by Tissue’s generated search index.
- An SVG favicon included in every page template.
- Tailwind CSS compiled into a local CSS file at build time.
- Automatic sitemap and search index generation.
- A build script that creates the Python virtual environment automatically.

## Quick start

You will need Git, Node.js 22 with npm, and Python 3 with pip and virtual environment support. The build script uses Bash; on Windows, use WSL.

Clone this repository, open its directory, then run:

```bash
bash build.sh
python3 -m http.server 8000 --directory public
```

Visit **http://localhost:8000**.

The build installs Node dependencies in `node_modules/`, creates `.venv/`, installs the Python dependencies, generates the pages in `public/`, and compiles the CSS. You do not need to create or activate a virtual environment yourself.

Each build replaces the generated `public/` directory. Make your changes in the source files described below.

## Project structure

```text
.
├── markdown/                 # Page content
│   ├── index.md              # Home page
│   ├── about.md              # About page
│   ├── search.md             # Search page metadata
│   └── work/                 # Space for additional pages
├── templates/                # Jinja HTML templates
│   ├── base.html             # Shared header, footer, CSS, and favicon
│   ├── template_home.html
│   ├── template_case.html
│   └── template_search.html
├── static/                   # JavaScript and other static assets
│   ├── site.js               # Menu interactions and browser search
│   ├── _headers              # Cloudflare Pages response headers
│   └── favicon/              # Space for additional favicon assets
├── styles/
│   └── input.css             # Tailwind source stylesheet
├── fav.svg                   # Site favicon
├── tissue.py                 # Static site generator
├── build.sh                  # Complete build and dependency setup
├── bash.sh                   # Compatibility wrapper for build.sh
├── package.json              # Node dependencies and CSS commands
├── package-lock.json         # Locked Node dependency versions
├── requirements.txt          # Python dependencies
└── public/                   # Generated site; excluded from Git
```

Empty source directories contain `.gitkeep` files so they remain present when the repository is cloned.

## Edit the site

| What to change | File |
| --- | --- |
| Homepage content | [`markdown/index.md`](markdown/index.md) |
| About page content | [`markdown/about.md`](markdown/about.md) |
| Header, menu, footer, and favicon link | [`templates/base.html`](templates/base.html) |
| Search page layout | [`templates/template_search.html`](templates/template_search.html) |
| Tailwind styles | [`styles/input.css`](styles/input.css) |
| Menu and search behavior | [`static/site.js`](static/site.js) |
| Favicon image | [`fav.svg`](fav.svg) |

Run `bash build.sh` after editing content or templates, then refresh your local preview.

### Add a page

Create a Markdown file with YAML frontmatter, for example `markdown/work/example.md`:

```markdown
---
title: Example page
desc: A short description of this page.
image: ""
template: template_case.html
---

## Hello

Write your page content here.
```

After rebuilding, this page is available at `/work/example/`. The special file `markdown/index.md` becomes the homepage at `/`.

Add navigation links in `templates/base.html` when needed. New pages are automatically included in the search index unless excluded.

### Work with Tailwind CSS

Use complete Tailwind utility classes in your templates, such as `text-teal-800` or `px-6`. Tailwind scans the templates, Markdown, static files, and `tissue.py`.

**Source CSS:** `styles/input.css`

**Compiled CSS:** `public/static/site.css`

The shared template loads `/static/site.css`. There is no `styles.css` file or Tailwind browser CDN dependency.

After the first build, you can watch CSS changes in a separate terminal:

```bash
npm run watch:css
```

The watcher recompiles CSS; content and template changes still require a site rebuild to update the generated HTML.

### Search

Search runs in the browser against `/search_index.json`. It matches all query words against page titles, descriptions, and content. Queries can be shared as `/search/?q=your+words`.

The search page excludes itself from results using `exclude: [search]`. Rebuild the site after changing content to refresh the index. Search requires JavaScript; the navigation menu also works without it.

## Deploy to Cloudflare Pages

Push the repository to GitHub and connect it to a Cloudflare **Pages** project using Git integration. Use these settings:

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | `bash build.sh` |
| Build output directory | `public` |
| Root directory | Repository root |
| Production branch | Your default branch, usually `main` |

Set the environment variable `TISSUE_SITEMAP_BASE_URL` to your canonical public URL, such as `https://example.com`.

When this variable is omitted, `build.sh` uses Cloudflare’s `CF_PAGES_URL`. Local builds fall back to `http://127.0.0.1:8000`. A localhost sitemap URL is rejected during Cloudflare Pages builds.

The build copies `static/_headers` to `public/_headers` and `fav.svg` to `public/favicon.svg`.

Commit the source files and `package-lock.json`. The generated `.venv/`, `node_modules/`, and `public/` directories are excluded from Git and recreated by the build.

## Commands

| Command | Purpose |
| --- | --- |
| `bash build.sh` | Install dependencies and build the complete site |
| `npm run build` | Run the same complete build |
| `npm run build:css` | Compile minified CSS only |
| `npm run watch:css` | Watch and compile CSS while editing |
| `python3 -m http.server 8000 --directory public` | Serve the generated site locally |

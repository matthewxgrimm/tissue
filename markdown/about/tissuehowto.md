---
title: How to use Tissue
desc: How Tissue builds page lists, search, and a sitemap, and how to style pages with Tailwind CSS.
image: /favicon.svg
template: template_case.html
---

Tissue turns Markdown files into a static website. You write content in `markdown/`, choose a Jinja template, and run `bash build.sh`. The build generates HTML in `public/`, copies static assets, creates the search index and sitemap, and compiles Tailwind CSS. Publish the contents of `public/` to host the site.

## How pages become a usable list

Before rendering any pages, `tissue.py` reads every `.md` file inside `markdown/`, including subfolders. It validates the YAML frontmatter and creates a record containing the page's title, description, image, rendered content, template, permalink, section, and exclusions.

Each Jinja template receives `this_page` (the current page) and `all_pages` (the collection of page records, except those excluded from that collection). Templates can loop through this collection to create linked lists, cards, navigation, or section indexes. Lists are generated at build time and do not need JavaScript.

The section is the name of the file's immediate parent folder. For example, `markdown/about/tissuehowto.md` belongs to `about`, while `markdown/work/example.md` belongs to `work`. Top-level files belong to `root`. With deeper folders, the immediate parent still determines the section: `markdown/work/notes/example.md` belongs to `notes`.

By default, `markdown/index.md` becomes `/`, and other file paths become directory URLs. This guide becomes `/about/tissuehowto/`. An optional `permalink` in frontmatter overrides the generated URL.

## Example: the About pages list

This guide is a working example. Its source is `markdown/about/tissuehowto.md`, and its frontmatter is:

    ---
    title: How to use Tissue
    desc: How Tissue builds page lists, search, and a sitemap, and how to style pages with Tailwind CSS.
    image: /favicon.svg
    template: template_case.html
    ---

The [About page](/about/) uses `template_about.html`, which extends `base.html` and adds an alphabetically sorted list. The essential Jinja loop is:

    <ul>
      {% for page in all_pages|sort(attribute='title') %}
      {% if page.section == 'about' and 'section' not in page.exclude and page.permalink != this_page.permalink %}
      <li>
        <a href="{{ page.permalink|e }}">{{ page.title|e }}</a>
        <p>{{ page.desc|e }}</p>
      </li>
      {% endif %}
      {% endfor %}
    </ul>

The `|e` filter escapes values for HTML. The section check selects About pages, the exclusion check respects `exclude: [section]`, and the permalink check avoids linking a page to itself. The actual template adds Tailwind classes to display the entries as cards.

To add another About page, create a Markdown file in `markdown/about/` with the required `title`, `desc`, `image`, and `template` fields, then rebuild. It will appear in the list automatically. To make a Work list, use the same pattern with `page.section == 'work'` in a suitable template. The `work/` folder is simply a place for content; it does not automatically create a section landing page or menu item.

Jinja runs in HTML templates, not in Markdown bodies. Put loops in `templates/`; code examples in Markdown are displayed as examples rather than executed.

## How search works

Every build writes `/search_index.json`. Each included record contains the title, description, image, permalink, section, and rendered HTML content. The [Search page](/search/) loads that file using `static/site.js`, converts content to plain text, and searches in the browser.

Matching ignores letter case. Every word in the query must appear somewhere in the combined title, description, and content; the words do not have to be adjacent. Matches are substring matches, without relevance ranking. Results link to the page and show its description. A query can be shared using a URL such as `/search/?q=tailwind`.

Search requires JavaScript and an HTTP server; use a local server instead of opening generated HTML directly from disk. After editing content, rebuild to refresh the index.

In the current generator, any nonempty `exclude` list removes a page from search. This includes `exclude: [section]` or `exclude: [sitemap]`, as well as `exclude: [search]`. The search page itself uses `exclude: [search]` so it does not appear in results.

## How the sitemap works

Every build also writes `/sitemap.xml`, an XML list of absolute page URLs for search engines. Each URL combines the site's base URL with the page's permalink. Pages containing `sitemap` in their `exclude` list are omitted; other exclusion values do not remove them from the sitemap.

Set the canonical public URL when building for your domain:

    TISSUE_SITEMAP_BASE_URL=https://example.com bash build.sh

Replace `https://example.com` with your site's URL. The build script uses `TISSUE_SITEMAP_BASE_URL` first, then Cloudflare's `CF_PAGES_URL`, then `http://127.0.0.1:8000` for local builds. Cloudflare Pages builds reject a localhost sitemap base URL. The sitemap helps search engines discover pages; it does not guarantee indexing.

## Controlling which lists include a page

The optional frontmatter field `exclude` is a YAML list. The accepted values are:

- `all_pages`: removes the page from the collection passed to templates.
- `section`: a signal for section-list templates to omit the page, as the About template does.
- `sitemap`: removes the page from `sitemap.xml`.
- `search`: removes the page from the search index.

For example:

    exclude: [all_pages, section, sitemap, search]

Exclusions do not stop the page's HTML from being generated or make it private. Remember that, in the current implementation, any of these values also removes the page from search. Without an `exclude` field, this guide participates in the About list, search index, and sitemap.

## How Tailwind is available

Tailwind CSS is installed through the Node dependencies in `package.json`. The source stylesheet, `styles/input.css`, imports Tailwind and explicitly scans `templates/`, `markdown/`, `static/`, and `tissue.py` for utility classes. The build compiles the result to `public/static/site.css`, and `base.html` loads that stylesheet on every page that extends it. Visitors receive a local CSS file; they do not need Node or a Tailwind browser runtime.

Use complete utility class names directly in Jinja templates, for example:

    <div class="rounded-xl border border-stone-200 bg-white p-6">
      <h2 class="text-xl font-semibold text-teal-800">A useful note</h2>
      <p class="mt-2 text-stone-600">Styled with Tailwind utilities.</p>
    </div>

You can also place raw HTML with Tailwind classes in Markdown. Regular Markdown gets its shared typography from the `.page-content` rules in `styles/input.css`. For reusable styles, add CSS there; the existing `.icon-button` and `.menu-link` rules demonstrate Tailwind's `@apply` syntax.

Keep utility names complete and literal so the scanner can detect them. Instead of constructing a class such as `text-{{ color }}-800`, choose between full strings such as `text-teal-800` and `text-stone-800`. Custom names need corresponding CSS or theme definitions; a name alone does not create a color or style.

## Build and preview

From the repository directory, run:

    bash build.sh
    python3 -m http.server 8000 --directory public

Open `http://localhost:8000/about/` to see the list, then follow this guide's link. The build script creates and uses `.venv` automatically, so you do not need to activate it.

After the first build, `npm run watch:css` watches for changes and recompiles CSS. Changes to Markdown or templates still require a full rebuild to update the generated HTML, page lists, search index, and sitemap. Edit source files rather than files inside `public/`, because each full build replaces that directory.

[Back to About](/about/)

import { HTML_TASK_BY_ID } from '../data/htmlBasics'

const hasText = (element) => Boolean(element?.textContent?.trim())
const hasMeaningfulLinkText = (link) => {
  const text = link?.textContent?.trim().replace(/\s+/g, ' ')
  return Boolean(text && text.length >= 5 && !/^(click here|here|link|read more|learn more)$/i.test(text))
}
const hasMeaningfulAlt = (image) => {
  const alt = image?.getAttribute('alt')?.trim().replace(/\s+/g, ' ')
  return Boolean(alt && alt.length >= 4 && !/^(image|photo|picture|image here|alt text)$/i.test(alt))
}
const hasExternalHref = (element) => {
  const href = element?.getAttribute('href')?.trim()
  if (!href) return false
  try {
    return ['http:', 'https:'].includes(new URL(href).protocol)
  } catch {
    return false
  }
}

function parseDocument(code) {
  return new DOMParser().parseFromString(code, 'text/html')
}

function check(label, passed, hint) {
  return { label, passed, hint: passed ? '' : hint }
}

const validators = {
  'html-01-first-page': (code, doc) => {
    const title = doc.querySelector('head > title')
    const heading = [...doc.querySelectorAll('body h1')].find((element) => /hello\s+world/i.test(element.textContent))
    return [
      check('Declares an HTML5 document and document structure', /^\s*<!doctype\s+html\s*>/i.test(code) && /<html(?:\s|>)/i.test(code) && /<head(?:\s|>)/i.test(code) && /<body(?:\s|>)/i.test(code), 'Add <!doctype html> and explicit html, head, and body elements.'),
      check('Includes a non-empty page title', hasText(title), 'Add descriptive text inside <title> in the document head.'),
      check('Displays a “Hello World” h1', Boolean(heading), 'Add an h1 in the body containing “Hello World”.'),
    ]
  },
  'html-02-headings': (_code, doc) => {
    const headings = [...doc.querySelectorAll('h1, h2, h3')]
    const positions = ['h1', 'h2', 'h3'].map((name) => headings.findIndex((element) => element.tagName.toLowerCase() === name))
    return [
      check('Includes a meaningful h1', hasText(doc.querySelector('h1')), 'Add a non-empty h1 for the page’s main topic.'),
      check('Includes a meaningful h2', hasText(doc.querySelector('h2')), 'Add a non-empty h2 for a section.'),
      check('Includes a meaningful h3', hasText(doc.querySelector('h3')), 'Add a non-empty h3 for a subsection.'),
      check('Uses h1, h2, and h3 in hierarchy order', positions.every((position) => position >= 0) && positions[0] < positions[1] && positions[1] < positions[2], 'Place an h1 before an h2, and the h2 before an h3.'),
    ]
  },
  'html-03-paragraphs-breaks': (_code, doc) => [
    check('Has at least two paragraphs with text', [...doc.querySelectorAll('p')].filter(hasText).length >= 2, 'Add at least two non-empty p elements.'),
    check('Uses a line break', Boolean(doc.querySelector('br')), 'Add a br element inside paragraph text to create a line break.'),
    check('Separates content with a horizontal rule', Boolean(doc.querySelector('hr')), 'Add an hr element between two parts of the content.'),
  ],
  'html-04-text-formatting': (_code, doc) => [
    check('Emphasizes important text with strong', hasText(doc.querySelector('strong')), 'Add meaningful text inside a strong element.'),
    check('Uses em for verbal emphasis', hasText(doc.querySelector('em')), 'Add meaningful text inside an em element.'),
    check('Highlights relevant text with mark', hasText(doc.querySelector('mark')), 'Add meaningful text inside a mark element.'),
  ],
  'html-05-hyperlinks': (_code, doc) => {
    const links = [...doc.querySelectorAll('a')]
    return [
      check('Has an external link with an HTTP(S) href', links.some(hasExternalHref), 'Add an anchor whose href points to an external http:// or https:// destination.'),
      check('Uses descriptive, visible link text', links.some((link) => hasExternalHref(link) && hasMeaningfulLinkText(link)), 'Give the external link descriptive text (not just “click here” or “link”).'),
    ]
  },
  'html-06-images': (_code, doc) => {
    const images = [...doc.querySelectorAll('img')]
    return [
      check('Displays an image with a source', images.some((image) => {
        const src = image.getAttribute('src')?.trim()
        return Boolean(src) && !/^javascript:/i.test(src)
      }), 'Add an img with a non-empty src URL or path.'),
      check('Provides meaningful alternative text', images.some(hasMeaningfulAlt), 'Describe the image in alt text; avoid generic text such as “image”.'),
    ]
  },
  'html-07-lists': (_code, doc) => [
    check('Has an ordered list with at least three items', (doc.querySelector('ol')?.querySelectorAll(':scope > li').length ?? 0) >= 3, 'Add an ol containing at least three direct li items.'),
    check('Has an unordered list with at least three items', (doc.querySelector('ul')?.querySelectorAll(':scope > li').length ?? 0) >= 3, 'Add a ul containing at least three direct li items.'),
    check('List items contain readable text', [...doc.querySelectorAll('ol > li, ul > li')].filter(hasText).length >= 6, 'Give each list item meaningful text.'),
  ],
  'html-08-tables': (_code, doc) => {
    const table = doc.querySelector('table')
    return [
      check('Uses a table with a header section and header cells', Boolean(table?.querySelector('thead th')), 'Add a table with thead, a header row, and at least one th cell.'),
      check('Groups table data in a tbody', Boolean(table?.querySelector('tbody')), 'Place the data rows inside tbody.'),
      check('Includes at least two data rows', (table?.querySelectorAll('tbody tr').length ?? 0) >= 2, 'Add at least two tr rows inside tbody.'),
      check('Uses data cells in the rows', [...(table?.querySelectorAll('tbody tr') ?? [])].filter((row) => row.querySelector('td')).length >= 2, 'Include td data cells in at least two rows.'),
    ]
  },
  'html-09-forms': (_code, doc) => {
    const form = doc.querySelector('form')
    const inputs = [...(form?.querySelectorAll('input') ?? [])]
    const associatedInput = (type, fieldName) => inputs.some((input) => {
      if ((input.getAttribute('type') ?? 'text').toLowerCase() !== type
        || input.getAttribute('name')?.toLowerCase() !== fieldName) return false
      const id = input.getAttribute('id')
      const labels = [...form.querySelectorAll('label')]
      const describesField = (label) => new RegExp(`\\b${fieldName}\\b`, 'i').test(label.textContent)
      return Boolean(id && labels.some((label) => label.getAttribute('for') === id && hasText(label) && describesField(label)))
        || labels.some((label) => label.contains(input) && hasText(label) && describesField(label))
    })
    return [
      check('Groups the fields inside a form', Boolean(form), 'Wrap the form controls in a form element.'),
      check('Has a labeled name text field', associatedInput('text', 'name'), 'Add a name input (name="name", type="text") and an associated label that says Name.'),
      check('Has a labeled email field', associatedInput('email', 'email'), 'Add an email input (name="email", type="email") and an associated label that says Email.'),
      check('Provides a submit button', Boolean(form?.querySelector('button[type="submit"], input[type="submit"]')), 'Add a button with type="submit" (or an input with type="submit") inside the form.'),
    ]
  },
  'html-10-profile-page': (_code, doc) => {
    const links = [...doc.querySelectorAll('a')]
    const images = [...doc.querySelectorAll('img')]
    return [
      check('Organizes the page with header, main, and footer', Boolean(doc.querySelector('header') && doc.querySelector('main') && doc.querySelector('footer')), 'Include semantic header, main, and footer elements.'),
      check('Includes a section in the main content', Boolean(doc.querySelector('main section')), 'Add a section inside main to group profile content.'),
      check('Introduces the profile with a heading and paragraph', hasText(doc.querySelector('h1')) && hasText(doc.querySelector('main p')), 'Add a non-empty profile h1 and a profile paragraph inside main.'),
      check('Includes a descriptive external link', links.some((link) => hasExternalHref(link) && hasMeaningfulLinkText(link)), 'Add an external link with descriptive text rather than “click here”.'),
      check('Displays an image with alternative text', images.some((image) => image.getAttribute('src')?.trim() && hasMeaningfulAlt(image)), 'Add an img with a source and descriptive alt text.'),
      check('Lists at least one profile interest', [...doc.querySelectorAll('main ul > li, main ol > li')].some(hasText), 'Add an interest as a non-empty li inside an ordered or unordered list in main.'),
    ]
  },
  'html-11-attributes': (_code, doc) => [
    check('Uses a non-empty id attribute', [...doc.querySelectorAll('[id]')].some((element) => element.id.trim()), 'Add a non-empty id to an element, such as id="welcome".'),
    check('Keeps each id unique', (() => {
      const ids = [...doc.querySelectorAll('[id]')].map((element) => element.id.trim())
      return ids.length > 0 && new Set(ids).size === ids.length
    })(), 'Each id value should identify only one element in the document.'),
    check('Uses a class attribute', [...doc.querySelectorAll('[class]')].some((element) => element.classList.length > 0), 'Add a class to an element, such as class="intro".'),
    check('Adds a helpful title attribute', [...doc.querySelectorAll('[title]')].some((element) => element.title.trim().length >= 4), 'Add a short helpful title attribute to an element.'),
  ],
  'html-12-comments-entities': (code, doc) => [
    check('Includes a descriptive HTML comment', /<!--[\s\S]{3,}?-->/m.test(code), 'Add a useful note between <!-- and -->.'),
    check('Uses character references for < and >', /&lt;/i.test(code) && /&gt;/i.test(code), 'Write &lt; and &gt; in your source to display angle brackets.'),
    check('Uses a character reference for &', /&amp;/i.test(code), 'Write &amp; in your source to display an ampersand.'),
    check('Displays the special characters in page text', /[<>&]/.test(doc.body.textContent), 'Make sure the character references appear in visible page text.'),
  ],
  'html-13-div-span': (_code, doc) => [
    check('Groups content in a div', Boolean(doc.querySelector('div h2, div p')), 'Add a div that groups a heading or paragraph.'),
    check('Uses a span around readable inline text', [...doc.querySelectorAll('span')].some(hasText), 'Add a span around a short phrase inside text.'),
    check('Includes meaningful heading and paragraph content', hasText(doc.querySelector('h2')) && hasText(doc.querySelector('p')), 'Add a non-empty h2 and paragraph to your grouped content.'),
  ],
  'html-14-semantic-elements': (_code, doc) => [
    check('Has a page header, main, and footer', Boolean(doc.querySelector('header') && doc.querySelector('main') && doc.querySelector('footer')), 'Add header, main, and footer landmarks.'),
    check('Groups the article topic in a section', Boolean(doc.querySelector('main section')), 'Add a section inside main for the article topic.'),
    check('Includes meaningful headings and text', hasText(doc.querySelector('header h1')) && hasText(doc.querySelector('main section h2')) && hasText(doc.querySelector('main section p')), 'Add a heading in header and a heading and paragraph in the section.'),
  ],
  'html-15-figure-caption': (_code, doc) => {
    const figure = doc.querySelector('figure')
    const image = figure?.querySelector('img')
    return [
      check('Groups the image in a figure', Boolean(figure && image?.getAttribute('src')?.trim()), 'Add a figure containing an img with a non-empty src.'),
      check('Provides useful image alternative text', Boolean(image && hasMeaningfulAlt(image)), 'Write descriptive alt text for the image.'),
      check('Adds a readable figcaption', hasText(figure?.querySelector('figcaption')), 'Add a non-empty figcaption inside the figure.'),
    ]
  },
  'html-16-audio-video': (_code, doc) => {
    const audio = doc.querySelector('audio')
    const video = doc.querySelector('video')
    const hasMediaSource = (element) => {
      const source = element?.getAttribute('src') ?? element?.querySelector('source[src]')?.getAttribute('src')
      return Boolean(source?.trim() && !/^javascript:/i.test(source.trim()))
    }
    return [
      check('Adds an audio player with controls', Boolean(audio?.hasAttribute('controls')), 'Add an audio element with the controls attribute.'),
      check('Provides a source for the audio', hasMediaSource(audio), 'Add a non-empty src to audio or a source child with its own src.'),
      check('Adds a video player with controls', Boolean(video?.hasAttribute('controls')), 'Add a video element with the controls attribute.'),
      check('Provides a source for the video', hasMediaSource(video), 'Add a non-empty src to video or a source child with its own src.'),
      check('Provides helpful fallback text', hasText(audio) && hasText(video), 'Add fallback text inside both audio and video elements.'),
    ]
  },
  'html-17-details-summary': (_code, doc) => {
    const details = doc.querySelector('details')
    return [
      check('Uses a details disclosure element', Boolean(details), 'Add a details element.'),
      check('Starts with a meaningful summary label', Boolean(details?.firstElementChild?.tagName === 'SUMMARY' && hasText(details.firstElementChild)), 'Put a non-empty summary as the first child of details.'),
      check('Includes readable expandable content', [...(details?.children ?? [])].some((element) => element.tagName !== 'SUMMARY' && hasText(element)), 'Add a paragraph or other readable content after summary.'),
    ]
  },
  'html-18-form-controls': (_code, doc) => {
    const labels = [...doc.querySelectorAll('label')]
    const select = doc.querySelector('select')
    const checkbox = doc.querySelector('input[type="checkbox"]')
    const textarea = doc.querySelector('textarea')
    const hasAssociatedLabel = (control) => {
      if (!control) return false
      const id = control.id
      return Boolean(id && labels.some((label) => label.htmlFor === id && hasText(label)))
        || labels.some((label) => label.contains(control) && hasText(label))
    }
    return [
      check('Adds a select menu with at least two options', Boolean(select && select.querySelectorAll('option').length >= 2), 'Add a select element with at least two option elements.'),
      check('Labels the select menu', hasAssociatedLabel(select), 'Associate a non-empty label with the select control.'),
      check('Adds a labeled checkbox', hasAssociatedLabel(checkbox), 'Add a checkbox input with an associated non-empty label.'),
      check('Adds a labeled textarea', hasAssociatedLabel(textarea), 'Add a textarea with an associated non-empty label.'),
    ]
  },
  'html-19-page-metadata': (_code, doc) => {
    const description = doc.querySelector('head meta[name="description"]')
    return [
      check('Declares UTF-8 character encoding', Boolean(doc.querySelector('head meta[charset="UTF-8" i]')), 'Add <meta charset="UTF-8"> inside head.'),
      check('Includes a responsive viewport setting', /width\s*=\s*device-width/i.test(doc.querySelector('head meta[name="viewport"]')?.content ?? ''), 'Add a viewport meta tag with width=device-width.'),
      check('Sets a non-empty page title', hasText(doc.querySelector('head title')), 'Write a descriptive title inside head.'),
      check('Adds a non-empty page description', Boolean(description?.content?.trim()), 'Add a meta name="description" with a short content value.'),
    ]
  },
  'html-20-accessibility': (_code, doc) => {
    const headings = [...doc.querySelectorAll('h1, h2')]
    const h1Index = headings.findIndex((element) => element.tagName === 'H1')
    const h2Index = headings.findIndex((element) => element.tagName === 'H2')
    const image = doc.querySelector('img')
    const input = doc.querySelector('input')
    const label = [...doc.querySelectorAll('label')].some((element) =>
      hasText(element) && (element.htmlFor === input?.id || element.contains(input)),
    )
    return [
      check('Declares the page language', Boolean(doc.documentElement.lang?.trim()), 'Set a language on html, for example <html lang="en">.'),
      check('Uses a logical h1 then h2 outline', h1Index >= 0 && h2Index > h1Index && headings.slice(h1Index, h2Index).every((element) => hasText(element)), 'Add a meaningful h1 before a meaningful h2.'),
      check('Describes the image with alt text', Boolean(image && hasMeaningfulAlt(image)), 'Add an image with useful alt text.'),
      check('Associates a readable label with the input', Boolean(input && label), 'Add a non-empty label associated with the input using for/id or nesting.'),
    ]
  },
  'html-21-code-and-quotes': (_code, doc) => [
    check('Marks inline code with code', hasText(doc.querySelector('p code')), 'Add a code element containing a short code example inside a paragraph.'),
    check('Preserves a multi-line example with pre and code', hasText(doc.querySelector('pre code')), 'Add a code element inside pre for a formatted code example.'),
    check('Includes a readable quotation', hasText(doc.querySelector('blockquote')), 'Add a blockquote with a meaningful quotation.'),
  ],
  'html-22-page-navigation': (_code, doc) => {
    const navLinks = [...(doc.querySelector('nav')?.querySelectorAll('a[href^="#"]') ?? [])]
    const internalTargetExists = navLinks.some((link) => {
      const targetId = link.getAttribute('href').slice(1)
      return Boolean(targetId && doc.getElementById(targetId))
    })
    const emailLinks = [...doc.querySelectorAll('a[href^="mailto:"]')]
    return [
      check('Groups navigation links in a nav landmark', Boolean(doc.querySelector('nav')), 'Wrap the page navigation links in a nav element.'),
      check('Links to an existing section on the page', internalTargetExists, 'Add a descriptive href="#section-id" link and an element with that matching id.'),
      check('Provides a descriptive email link', emailLinks.some(hasMeaningfulLinkText), 'Add a mailto link with descriptive visible text.'),
    ]
  },
  'html-project-portfolio': (_code, doc) => {
    const projects = [...doc.querySelectorAll('main article')]
    const links = [...doc.querySelectorAll('main a')]
    const images = [...doc.querySelectorAll('main img')]
    const form = doc.querySelector('form')
    const email = form?.querySelector('input[type="email"]')
    const emailLabel = [...(form?.querySelectorAll('label') ?? [])].some((label) =>
      hasText(label) && (label.htmlFor === email?.id || label.contains(email)),
    )
    return [
      check('Uses header, navigation, main, and footer', Boolean(doc.querySelector('header nav') && doc.querySelector('main') && doc.querySelector('footer')), 'Add header with nav, main content, and footer.'),
      check('Introduces the creator with a heading and text', hasText(doc.querySelector('header h1')) && hasText(doc.querySelector('main p')), 'Add a creator name heading and an introduction paragraph.'),
      check('Includes at least two project cards', projects.length >= 2, 'Add at least two article elements inside main, one per project.'),
      check('Provides project links and accessible images', links.some((link) => hasExternalHref(link) && hasMeaningfulLinkText(link)) && images.some(hasMeaningfulAlt), 'Add a descriptive external project link and an image with useful alt text.'),
      check('Adds a labeled contact email field', Boolean(email && emailLabel), 'Add an email input associated with a visible label in a contact form.'),
    ]
  },
  'html-project-recipe': (_code, doc) => {
    const main = doc.querySelector('main')
    return [
      check('Introduces the recipe with a heading and description', hasText(main?.querySelector('h1')) && hasText(main?.querySelector('p')), 'Add a recipe h1 and a short introductory paragraph inside main.'),
      check('Shows an accessible figure and caption', Boolean(main?.querySelector('figure img[src]')) && hasMeaningfulAlt(main?.querySelector('figure img')) && hasText(main?.querySelector('figure figcaption')), 'Add a figure with an image source, descriptive alt text, and figcaption.'),
      check('Lists at least three ingredients', [...(main?.querySelectorAll('ul > li') ?? [])].filter(hasText).length >= 3, 'Add at least three non-empty ingredient list items.'),
      check('Lists at least three ordered cooking steps', [...(main?.querySelectorAll('ol > li') ?? [])].filter(hasText).length >= 3, 'Add at least three non-empty steps in an ordered list.'),
      check('Includes preparation details in a table', Boolean(main?.querySelector('table thead th') && main.querySelectorAll('table tbody tr').length >= 1), 'Add a table with a header and at least one data row for preparation details.'),
    ]
  },
  'html-project-event': (_code, doc) => {
    const main = doc.querySelector('main')
    const rows = main?.querySelectorAll('table tbody tr').length ?? 0
    const form = main?.querySelector('form')
    const namedInput = form?.querySelector('input[name="name"]')
    const emailInput = form?.querySelector('input[name="email"][type="email"]')
    const labels = [...(form?.querySelectorAll('label') ?? [])]
    const labeled = (input) => Boolean(input && labels.some((label) =>
      hasText(label) && (label.htmlFor === input.id || label.contains(input)),
    ))
    return [
      check('Introduces the event in semantic page regions', Boolean(doc.querySelector('header h1') && main && doc.querySelector('footer')), 'Add a page header with event title, main, and footer.'),
      check('Includes event information', hasText(main?.querySelector('section h2')) && hasText(main?.querySelector('section p')), 'Add an event section with a heading and details paragraph.'),
      check('Shows a schedule with headers and two rows', Boolean(main?.querySelector('table thead th')) && rows >= 2, 'Add a schedule table with header cells and at least two data rows.'),
      check('Provides labeled name and email fields', labeled(namedInput) && labeled(emailInput), 'Add name and email inputs with matching visible labels.'),
      check('Includes an RSVP submit button', Boolean(form?.querySelector('button[type="submit"], input[type="submit"]')), 'Add a submit button inside the RSVP form.'),
    ]
  },
}

export function validateHtmlTask(taskId, code) {
  if (!HTML_TASK_BY_ID[taskId]) throw new Error('Unknown HTML task.')
  if (typeof code !== 'string') throw new TypeError('Task code must be a string.')
  const doc = parseDocument(code)
  const checks = validators[taskId](code, doc)
  return { passed: checks.every((result) => result.passed), checks }
}

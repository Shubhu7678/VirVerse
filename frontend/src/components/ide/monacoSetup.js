import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor/editor/editor.api.js'
import EditorWorker from 'monaco-editor/editor/editor.worker.js?worker'
import { conf as pythonConf, language as pythonLanguage } from 'monaco-editor/languages/definitions/python/python.js'
import { formatPythonCode } from './pythonFormatter'

// Only the editor features this IDE needs (keeps the bundle far smaller than the full Monaco build).
import 'monaco-editor/editor/contrib/bracketMatching/browser/bracketMatching.js'
import 'monaco-editor/editor/contrib/clipboard/browser/clipboard.js'
import 'monaco-editor/editor/contrib/comment/browser/comment.js'
import 'monaco-editor/editor/contrib/contextmenu/browser/contextmenu.js'
import 'monaco-editor/editor/contrib/cursorUndo/browser/cursorUndo.js'
import 'monaco-editor/editor/contrib/find/browser/findController.js'
import 'monaco-editor/editor/contrib/folding/browser/folding.js'
import 'monaco-editor/editor/contrib/format/browser/formatActions.js'
import 'monaco-editor/editor/contrib/format/browser/format.js'
import 'monaco-editor/editor/contrib/hover/browser/hoverContribution.js'
import 'monaco-editor/editor/contrib/indentation/browser/indentation.js'
import 'monaco-editor/editor/contrib/linesOperations/browser/linesOperations.js'
import 'monaco-editor/editor/contrib/multicursor/browser/multicursor.js'
import 'monaco-editor/editor/contrib/snippet/browser/snippetController2.js'
import 'monaco-editor/editor/contrib/suggest/browser/suggestController.js'
import 'monaco-editor/editor/contrib/wordHighlighter/browser/wordHighlighter.js'
import 'monaco-editor/editor/contrib/wordOperations/browser/wordOperations.js'
import 'monaco-editor/editor/browser/coreCommands.js'
import 'monaco-editor/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js'
import 'monaco-editor/editor/common/standaloneStrings.js'
import 'monaco-editor/languages/definitions/cpp/register.js'
import '../../../node_modules/monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.css'

self.MonacoEnvironment = { getWorker: () => new EditorWorker() }

// Serve Monaco from our own bundle instead of a CDN.
loader.config({ monaco })

const pythonKeywords = [
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'case',
  'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for',
  'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'match', 'nonlocal',
  'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
]
const pythonBuiltins = [
  'abs', 'all', 'any', 'bool', 'dict', 'enumerate', 'filter', 'float', 'int',
  'len', 'list', 'map', 'max', 'min', 'open', 'print', 'range', 'reversed',
  'round', 'set', 'sorted', 'str', 'sum', 'tuple', 'type', 'zip',
]

if (!monaco.languages.getLanguages().some(({ id }) => id === 'python')) {
  monaco.languages.register({
    id: 'python',
    extensions: ['.py', '.pyw'],
    aliases: ['Python', 'py'],
  })
}

monaco.languages.setLanguageConfiguration('python', pythonConf)
monaco.languages.setMonarchTokensProvider('python', {
  ...pythonLanguage,
  keywords: pythonKeywords,
  builtins: pythonBuiltins,
  tokenizer: {
    ...pythonLanguage.tokenizer,
    root: [
      { include: '@whitespace' },
      { include: '@numbers' },
      { include: '@strings' },
      [/[,:;]/, 'delimiter'],
      [/(?:[{}()]|\[|\])/, '@brackets'],
      [/@[a-zA-Z_]\w*/, 'tag'],
      [/[+*/%=<>!&|^~@-]+/, 'operator'],
      [
        /[a-zA-Z_]\w*(?=\s*\()/,
        { cases: { '@keywords': 'keyword', '@builtins': 'predefined', '@default': 'function' } },
      ],
      [
        /[a-zA-Z_]\w*/,
        { cases: { '@keywords': 'keyword', '@builtins': 'predefined', '@default': 'identifier' } },
      ],
    ],
  },
})

const themeRules = (colors) => [
  { token: 'keyword', foreground: colors.keyword },
  { token: 'string', foreground: colors.string },
  { token: 'string.escape', foreground: colors.string },
  { token: 'number', foreground: colors.number },
  { token: 'number.hex', foreground: colors.number },
  { token: 'comment', foreground: colors.comment, fontStyle: 'italic' },
  { token: 'function', foreground: colors.function },
  { token: 'predefined', foreground: colors.builtin },
  { token: 'operator', foreground: colors.operator },
  { token: 'delimiter', foreground: colors.delimiter },
  { token: 'identifier', foreground: colors.foreground },
  { token: 'type.identifier', foreground: colors.type },
  { token: 'tag', foreground: colors.keyword },
]

const defineEditorTheme = (name, colors) => {
  monaco.editor.defineTheme(name, {
    base: 'vs-dark',
    inherit: true,
    rules: themeRules(colors),
    colors: {
      'editor.background': colors.background,
      'editor.foreground': colors.foreground,
      'editorLineNumber.foreground': colors.lineNumber,
      'editorLineNumber.activeForeground': colors.foreground,
      'editor.lineHighlightBackground': colors.lineHighlight,
      'editor.lineHighlightBorder': '#00000000',
      'editorCursor.foreground': colors.cursor,
      'editor.selectionBackground': colors.selection,
      'editor.inactiveSelectionBackground': colors.selection,
      'editorIndentGuide.background1': colors.indentGuide,
      'editorBracketMatch.background': colors.bracketBackground,
      'editorBracketMatch.border': colors.cursor,
      'editorBracketHighlight.foreground1': colors.bracket1,
      'editorBracketHighlight.foreground2': colors.bracket2,
      'editorBracketHighlight.foreground3': colors.bracket3,
      'editorBracketHighlight.foreground4': colors.bracket4,
      'editorBracketHighlight.foreground5': colors.bracket5,
      'editorBracketHighlight.foreground6': colors.bracket6,
      'editorBracketHighlight.unexpectedBracket.foreground': colors.error,
    },
  })
}

defineEditorTheme('virverse-vscode-dark', {
  background: '#171a1f', foreground: '#d4d9e1', lineNumber: '#737d8c',
  lineHighlight: '#ffffff08', cursor: '#54d6b3', selection: '#28454d',
  indentGuide: '#303740', bracketBackground: '#54d6b322', bracket1: '#ffd580',
  bracket2: '#89ddff', bracket3: '#c792ea', bracket4: '#f78c6c',
  bracket5: '#c3e88d', bracket6: '#82aaff', error: '#f44747',
  keyword: '#c586c0', string: '#ce9178', number: '#b5cea8', comment: '#6a9955',
  function: '#dcdcaa', builtin: '#4fc1ff', operator: '#d4d4d4',
  delimiter: '#c8c8c8', type: '#4ec9b0',
})

defineEditorTheme('virverse-one-dark', {
  background: '#282c34', foreground: '#abb2bf', lineNumber: '#636d83',
  lineHighlight: '#ffffff08', cursor: '#61afef', selection: '#3e4451',
  indentGuide: '#3b4048', bracketBackground: '#61afef22', bracket1: '#e5c07b',
  bracket2: '#56b6c2', bracket3: '#c678dd', bracket4: '#d19a66',
  bracket5: '#98c379', bracket6: '#61afef', error: '#e06c75',
  keyword: '#c678dd', string: '#98c379', number: '#d19a66', comment: '#5c6370',
  function: '#61afef', builtin: '#56b6c2', operator: '#56b6c2',
  delimiter: '#abb2bf', type: '#e5c07b',
})

defineEditorTheme('virverse-dracula', {
  background: '#282a36', foreground: '#f8f8f2', lineNumber: '#6272a4',
  lineHighlight: '#ffffff08', cursor: '#f8f8f2', selection: '#44475a',
  indentGuide: '#44475a', bracketBackground: '#bd93f922', bracket1: '#f1fa8c',
  bracket2: '#8be9fd', bracket3: '#bd93f9', bracket4: '#ff79c6',
  bracket5: '#50fa7b', bracket6: '#ffb86c', error: '#ff5555',
  keyword: '#ff79c6', string: '#f1fa8c', number: '#bd93f9', comment: '#6272a4',
  function: '#50fa7b', builtin: '#8be9fd', operator: '#ff79c6',
  delimiter: '#f8f8f2', type: '#8be9fd',
})

const pythonKeywordSuggestions = [
  'if', 'elif', 'else', 'for', 'while', 'def', 'return', 'class', 'import', 'from',
  'as', 'try', 'except', 'finally', 'with', 'pass', 'break', 'continue', 'and',
  'or', 'not', 'in', 'is', 'True', 'False', 'None',
]
const pythonBuiltinSuggestions = [
  ['print', 'print(${1:value})', 'Display a value in the output.'],
  ['input', 'input(${1:prompt})', 'Ask the user to enter text.'],
  ['len', 'len(${1:items})', 'Get the number of items.'],
  ['range', 'range(${1:stop})', 'Create a sequence of numbers for a loop.'],
  ['int', 'int(${1:value})', 'Convert a value to an integer.'],
  ['float', 'float(${1:value})', 'Convert a value to a decimal number.'],
  ['str', 'str(${1:value})', 'Convert a value to text.'],
  ['sum', 'sum(${1:numbers})', 'Add the values in an iterable.'],
  ['min', 'min(${1:values})', 'Find the smallest value.'],
  ['max', 'max(${1:values})', 'Find the largest value.'],
  ['abs', 'abs(${1:number})', 'Get the distance from zero.'],
  ['round', 'round(${1:number})', 'Round a number.'],
  ['sorted', 'sorted(${1:items})', 'Return the items in sorted order.'],
  ['enumerate', 'enumerate(${1:items})', 'Loop over items with their indexes.'],
]

monaco.languages.registerCompletionItemProvider('python', {
  provideCompletionItems(model, position) {
    const word = model.getWordUntilPosition(position)
    const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn)
    const keywordKind = monaco.languages.CompletionItemKind.Keyword
    const functionKind = monaco.languages.CompletionItemKind.Function
    const snippetRule = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
    const query = word.word.toLowerCase()
    const suggestions = [
      ...pythonKeywordSuggestions
        .filter((label) => label.toLowerCase().startsWith(query))
        .map((label) => ({
          label,
          kind: keywordKind,
          insertText: label,
          detail: 'Python keyword',
          range,
        })),
      ...pythonBuiltinSuggestions
        .filter(([label]) => label.startsWith(query))
        .map(([label, insertText, documentation]) => ({
          label,
          kind: functionKind,
          insertText,
          insertTextRules: snippetRule,
          detail: 'Python built-in function',
          documentation,
          range,
        })),
    ]
    return { suggestions }
  },
})

monaco.languages.registerDocumentFormattingEditProvider('python', {
  async provideDocumentFormattingEdits(model) {
    const formatted = await formatPythonCode(model.getValue())
    return [{
      range: model.getFullModelRange(),
      text: formatted,
    }]
  },
})

export { monaco }

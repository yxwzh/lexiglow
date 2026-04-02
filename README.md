# LexiGlow

![LexiGlow banner](./assets/lexiglow-banner.svg)

<p align="center">
  Learn English vocabulary in the wild, directly on real web pages.
</p>

<p align="center">
  <a href="https://github.com/xiaoyao888888/lexiglow/stargazers">
    <img alt="GitHub stars" src="https://img.shields.io/github/stars/xiaoyao888888/lexiglow?style=flat-square" />
  </a>
  <a href="https://github.com/xiaoyao888888/lexiglow/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/xiaoyao888888/lexiglow?style=flat-square" />
  </a>
  <img alt="Chrome Extension" src="https://img.shields.io/badge/platform-Chrome%20Extension-f6c453?style=flat-square" />
  <img alt="TypeScript" src="https://img.shields.io/badge/built%20with-TypeScript-2f74c0?style=flat-square" />
</p>

LexiGlow is a Chrome extension for context-based English learning. It highlights words you still need to learn, shows Chinese translations on hover, and lets you gradually grow your personal vocabulary while reading real articles, docs, newsletters, and product pages.

It is designed to feel lightweight:

- no DOM wrapping of page text
- no broken page layout
- no aggressive full-page rewriting
- just a soft yellow glow, a hover card, and progressive vocabulary tracking

## Why It Feels Different

Most vocabulary tools either interrupt your reading flow or force you into a separate app.

LexiGlow keeps learning inside your normal workflow:

- Hover unfamiliar words to get instant Chinese translations
- Click `已掌握` to retire a word from future prompts
- Double-click a word to bring it back into review mode when you forget it
- Dynamically configure how many high-frequency words you already know
- Skip obvious proper nouns, brand names, and product terms by default

## Core Features

- Dynamic known-word threshold based on the Google 10,000 English word frequency list
- Manual mastered list that keeps growing over time
- Manual review mode for forgotten words
- Ignored-word logic for names, brands, and non-learning targets
- Current-page synchronization: once a word is marked mastered, matching highlights disappear right away
- Toolbar popup with learning stats and quick controls
- Full settings page for search, overrides, and cleanup

## How It Works

LexiGlow combines a few simple ideas:

1. Start from a ranked 10k English frequency list
2. Treat the top `N` words as already known
3. Highlight only words that are still worth learning
4. Let your own actions override the defaults

Your personal vocabulary state is stored in Chrome storage:

- `knownBaseRank` for the default high-frequency threshold
- `masteredOverrides` for words you have learned
- `unmasteredOverrides` for words you want to relearn
- `ignoredWords` for terms that should never trigger translation

## Interaction Model

- Hover a highlighted word: see a Chinese translation
- Click `已掌握`: remove it from the active learning set
- Double-click an English word: force it back into review mode
- Click the extension icon: check stats and adjust the threshold quickly

## Install for Development

```bash
npm install
npm run fetch:lexicon
npm run build
npm test
```

Then load the extension in Chrome:

1. Open `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select either:
   - the project root after build, or
   - the `dist` folder

## Tech Stack

- TypeScript
- Vite
- esbuild
- Chrome Manifest V3
- Native CSS Highlights API where available

## Current Limitations

- Chrome-focused for now
- Uses a lightweight Google web translate prototype instead of an official paid API
- Highlighting is intentionally conservative to avoid breaking layout

## Roadmap

- Better proper-noun and named-entity filtering
- Cleaner tooltip interactions and richer feedback states
- Optional personal export/import of learning progress
- Smarter translation providers and caching strategies
- Chrome Web Store packaging and release automation

## Validation

- `npm test`
- `npm run build`

## License

MIT

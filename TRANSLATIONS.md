# Translating the Room Summary Card

Thank you for your interest in helping translate the Room Summary Card! Translations make this card accessible to users around the world.

## Currently Supported Languages

- English (en)
- _Your language could be next!_

## How to Add a Translation

Only native speakers should translate to ensure high-quality and natural translations.

### Step 1: Create a Translation File

1. Copy `src/translations/en.json`
2. Name it with the appropriate language code following BCP 47 standards (e.g., `fr.json` for French, `de.json` for German, `zh-Hans.json` for Simplified Chinese)
3. Translate the values only — keep every key unchanged

Example (`fr.json`):

```json
{
  "editor": {
    "area": {
      "area": "Zone"
    }
  }
}
```

### Step 2: Register the Language

Open `src/localize/localize.ts` and:

1. Import your new translation file
2. Add it to the object passed to `createLocalize`

```typescript
import * as de from '../translations/de.json';

export const localize = createLocalize({
  en,
  de, // Add your language here
});
```

Translation keys are derived automatically from `en.json`. You do not need to update any TypeScript types when adding keys or languages.

### Step 3: Update Documentation

Add your language to the supported languages list in this file and in `README.md` if applicable.

### Step 4: Test Your Translation

1. Change your Home Assistant language to your translated language
2. Confirm all text appears correctly and fits within the card layout

### Step 5: Submit Your Translation

1. Fork the repository
2. Create a new branch for your translation
3. Commit your changes with a descriptive message
4. Open a Pull Request

## Translation Tips

- Keep translations concise to fit within the card's limited space
- Maintain the same meaning and tone as the original text
- Consider how the language will appear in different contexts
- Test your translations in the actual card UI if possible

## Need Help?

If you have any questions or need help with your translation, please:

- Open an issue with the "translation" label
- Join our Discord server for real-time support

Thank you for helping make the Room Summary Card more accessible to everyone!

## Translation Status

| Language             | Code   | Status     | Maintainer   |
| -------------------- | ------ | ---------- | ------------ |
| English              | en     | 100%       | @warmfire540 |
| _Your language here_ | _code_ | _progress_ | _your name_  |

## Files Overview

### Translation files (`src/translations/`)

Each language has its own JSON file named with the language code (e.g., `en.json`, `fr.json`). The structure is a nested JSON object: keys are translation paths, values are the translated strings. English is the source of truth for key structure.

### Localization wrapper (`src/localize/localize.ts`)

This thin wrapper imports all language JSON files and registers them with `createLocalize` from `@homeassistant-extras/hass`. The exported `localize()` function handles language lookup, English fallback, and optional string replacement.

### Using translations in components

```typescript
import { localize } from '@localize/localize';

const translatedText = localize(hass, 'editor.area.area');

// Optional string replacement
const message = localize(hass, 'editor.area.area_name', 'Area', 'Room');
```

## Guidelines for Good Translations

- **Be concise** — UI space is limited
- **Be consistent** — maintain the same terminology throughout
- **Maintain context** — understand how the string is used in the UI
- **Keep placeholders** — don't remove or change `{number}` or similar placeholders
- **Natural language** — translation should read naturally in your language, not as a direct word-for-word translation

Thank you for helping make Room Summary Card accessible to more users around the world!

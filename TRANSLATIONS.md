# Translating the Room Summary Card

Thank you for your interest in helping translate the Room Summary Card! Translations make this card accessible to users around the world.

## Currently Supported Languages

- English (en)
- _Your language could be next!_

## How to Add a Translation

Only native speakers should translate to ensure high-quality and natural translations.

### Step 1: Create a Translation File

1. Copy the `src/translations/en.json` file
2. Name it with the appropriate language code following BCP 47 standards (e.g., `fr.json` for French, `de.json` for German, `zh-Hans.json` for Simplified Chinese)
3. Translate the values (right side) only, leaving the keys (left side) unchanged

For example:

```json
{
  "editor": {
    "area": "Area", // Original English
    "area": "Zone" // Translated to French
  }
}
```

### Step 2: Update the Localization System

1. Open `src/localize/localize.ts`
2. Import your new translation file at the top:
   ```typescript
   import * as en from '../translations/en.json';
   import * as fr from '../translations/fr.json'; // Add your language here
   ```
3. Add your language to the `languages` record:
   ```typescript
   const languages: Record<string, any> = {
     en: en,
     fr: fr, // Add your language here
   };
   ```

### Step 3: Update Type Definitions (Optional)

If you've added new translation keys, update the `TranslationKey` type in `src/types/locale.ts`.

### Step 4: Update Documentation

1. Add your language to the list in the main README.md

### Step 5: Test Your Translation

1. Test locally by changing your Home Assistant language to your translated language
2. Make sure all text appears correctly and fits within the card layout

### Step 6: Submit Your Translation

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

# Explanation of Files to Update

Here's a breakdown of what files need to be updated when working with localization:

## 1. Translation Files

The core translation files are located in the `src/translations/` directory. Each language has its own JSON file with the language code as the filename:

- `en.json` - English (base language)
- Add new languages as needed (e.g., `fr.json`, `de.json`, etc.)

The structure of these files is a nested JSON object where keys represent the translation keys and values are the translated strings.

## 2. Localization System

The localization system is primarily in `src/localize/localize.ts`. This file contains:

- Imports for all language JSON files
- A `languages` record mapping language codes to their translations
- The `localize()` function that handles translation lookups and string replacements

When adding a new language:

1. Import the language file at the top
2. Add an entry to the `languages` record

## 3. Type Definitions

The file `src/types/locale.ts` contains TypeScript type definitions for translation keys. This provides type safety when using translations in the code.

If new translation keys are added, this file should be updated to include those keys.

## 4. Using Translations in Components

In component files, translations are used with the `localize()` function:

```typescript
import { localize } from '@localize/localize';

// Basic usage
const translatedText = localize(hass, 'editor.area');

// With string replacement
const clientsText = localize(
  hass,
  'editor.area',
  '{number}',
  clientCount.toString(),
);
```

## 5. README Updates

When a new language is added, the main README.md should be updated to include the new language in the supported languages list.

## Guidelines for Good Translations

- **Be concise** - UI space is limited
- **Be consistent** - Maintain same terminology throughout
- **Maintain context** - Understand how the string is used in the UI
- **Keep placeholders** - Don't remove or change `{number}` or similar placeholders
- **Natural language** - Translation should read naturally in your language, not as a direct word-for-word translation

Thank you for helping make Room Summary Card accessible to more users around the world!

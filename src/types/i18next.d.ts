import 'i18next'
import translation from '../locales/en/translation.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      en: typeof translation
    }
    returnNull: false
    allowObjectInHTMLChildren: true
  }
}

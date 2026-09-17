import { ko } from './ko';
import { en } from './en';
import { Language } from '../types';

export const translations = {
  ko,
  en
};

export type TranslationKey = keyof typeof ko;

export function getTranslation(lang: Language, key: TranslationKey): string {
  return translations[lang][key] || translations.ko[key] || key;
}

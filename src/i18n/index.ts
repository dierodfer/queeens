import { enLocale } from './locales/en';
import { esLocale } from './locales/es';
import type { Lang, LocaleDict } from '../types/i18n';

export type { BlindLevel, GameMode, Lang } from '../types/i18n';

export const I18N: Record<Lang, LocaleDict> = {
  en: enLocale,
  es: esLocale,
};

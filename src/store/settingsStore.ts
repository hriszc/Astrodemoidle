import { map } from 'nanostores';

export type Language = 'en' | 'zh';

export const $settings = map<{ lang: Language }>({ 
  lang: 'zh' // Default to Chinese as requested
});

export const toggleLanguage = () => {
  const current = $settings.get().lang;
  $settings.setKey('lang', current === 'en' ? 'zh' : 'en');
};

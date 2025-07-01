import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const safeLocale = locale || 'pt-BR';
  try {
    return {
      messages: (await import(`../messages/${safeLocale}.json`)).default,
      locale: safeLocale
    };
  } catch (e) {
    if (safeLocale !== 'pt-BR') {
      return {
        messages: (await import(`../messages/pt-BR.json`)).default,
        locale: 'pt-BR'
      };
    }
    throw new Error(`Could not load messages for locale: ${safeLocale}`);
  }
}); 
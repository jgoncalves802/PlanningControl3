import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Sempre usar pt-BR como fallback
  const defaultLocale = 'pt-BR';
  const currentLocale = locale || defaultLocale;
  
  try {
    // Tentar carregar o arquivo de mensagens
    const messages = await import(`../messages/${currentLocale}.json`);
    return {
      messages: messages.default,
      locale: currentLocale
    };
  } catch (error) {
    console.warn(`Could not load messages for locale: ${currentLocale}, using default`);
    // Sempre usar pt-BR como fallback
    const fallbackMessages = await import(`../messages/${defaultLocale}.json`);
    return {
      messages: fallbackMessages.default,
      locale: defaultLocale
    };
  }
}); 
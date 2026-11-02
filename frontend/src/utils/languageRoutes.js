export const languageBasePath = (language) => language === 'c' ? '' : `/${language}`
export const taskPath = (language, slug) => `${languageBasePath(language)}/tasks/${slug}`
export const topicPath = (language, category) => `${languageBasePath(language)}/topics/${category}`

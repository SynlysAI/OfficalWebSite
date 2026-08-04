import { computed } from 'vue'

import { copy, pageTitles } from '../data/site'
import { language, setLanguage } from './useLanguage'

export function useSiteContent() {
  const content = computed(() => copy[language.value] || copy.zh)
  const titles = computed(() => pageTitles[language.value] || pageTitles.zh)

  return {
    content,
    language,
    setLanguage,
    titles,
  }
}


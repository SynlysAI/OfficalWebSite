import { ref } from 'vue'

const STORAGE_KEY = 'synlysaiofficial-language'

const initialLanguage = () => {
  if (typeof window === 'undefined') {
    return 'zh'
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved === 'en' ? 'en' : 'zh'
  } catch {
    return 'zh'
  }
}

export const language = ref(initialLanguage())

export function setLanguage(nextLanguage) {
  language.value = nextLanguage === 'en' ? 'en' : 'zh'

  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, language.value)
  } catch {
    // Ignore storage errors.
  }
}


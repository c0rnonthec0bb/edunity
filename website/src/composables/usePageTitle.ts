import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const DEFAULT_TITLE = 'Homeroom Hero'
const titleSuffix = ' | Homeroom Hero'
const title = ref(DEFAULT_TITLE)

export function usePageTitle() {
  const route = useRoute()

  function updateTitle(newTitle?: string) {
    if (newTitle) {
      title.value = newTitle + titleSuffix
      return
    }

    const meta = route.meta
    if (meta.preserveParentTitle && route.matched.slice(0, -1).reverse().find(r => r.meta.title || r.name === 'quiz')) {
      return
    }

    const routeTitle = meta.title
    title.value = routeTitle ? routeTitle + titleSuffix : DEFAULT_TITLE
  }

  watch(() => route.fullPath, () => updateTitle(), { immediate: true })

  return {
    title,
    updateTitle
  }
}

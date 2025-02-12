import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const DEFAULT_TITLE = 'Edunity'
const titleSuffix = ' | Edunity'

// Shared state across all instances
const title = ref(DEFAULT_TITLE)

export function usePageTitle() {
  const route = useRoute()

  function updateTitle(newTitle?: string) {
    // If a title is provided, use it
    if (newTitle) {
      title.value = newTitle + titleSuffix
      return
    }

    // Check if we should preserve parent route's title
    const currentMeta = route.meta
    if (currentMeta.preserveParentTitle) {
      // Find the closest parent route that has a title
      const parentWithTitle = route.matched
        .slice(0, -1) // Exclude current route
        .reverse() // Start from closest parent
        .find(r => r.meta.title || r.name === 'quiz')
      
      if (parentWithTitle) {
        // Don't update the title if we're preserving parent's
        return
      }
    }

    // Otherwise, get title from route meta
    const metaTitle = currentMeta.title as string | undefined
    title.value = metaTitle ? metaTitle + titleSuffix : DEFAULT_TITLE
  }

  // Watch for route changes to update title from meta
  watch(
    () => route.fullPath,
    () => updateTitle(),
    { immediate: true },
  )

  return {
    title,
    updateTitle,
  }
}

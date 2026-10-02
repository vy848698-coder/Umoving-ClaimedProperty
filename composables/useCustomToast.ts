interface ToastOptions {
  message: string
  icon?: string
  iconEmoji?: string
  duration?: number
  // 'success' (default, unchanged for every existing caller) shows a
  // checkmark; 'error' shows a cross instead and swaps the toast's colour -
  // added because every call site used to get a checkmark regardless of
  // whether the action actually succeeded (client feedback, 2026-09-30).
  variant?: 'success' | 'error'
}

const toastState = reactive({
  isVisible: false,
  message: '',
  icon: '',
  iconEmoji: '',
  duration: 2000,
  variant: 'success' as 'success' | 'error',
})

export const useAppToast = () => {
  const showToast = (options: ToastOptions) => {
    toastState.message = options.message
    toastState.icon = options.icon || ''
    // No default emoji fallback here anymore - Toast.vue only shows the
    // leading icon circle at all when a caller actually passes one, so
    // omitting both icon and iconEmoji now genuinely hides it instead of
    // silently getting a house emoji nobody asked for.
    toastState.iconEmoji = options.iconEmoji || ''
    toastState.duration = options.duration || 2000
    toastState.variant = options.variant || 'success'
    toastState.isVisible = true

    setTimeout(() => {
      toastState.isVisible = false
    }, toastState.duration)
  }

  const hideToast = () => {
    toastState.isVisible = false
  }

  return {
    toastState: readonly(toastState),
    showToast,
    hideToast,
  }
}



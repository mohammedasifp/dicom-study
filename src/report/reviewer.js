const KEY = 'reviewerName'

export const getReviewer = () => localStorage.getItem(KEY) || undefined

export const setReviewer = (name) => {
  if (name) localStorage.setItem(KEY, name)
}

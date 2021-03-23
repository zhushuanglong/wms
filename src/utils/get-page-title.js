import defaultSettings from '@/settings'

const title = defaultSettings.title || 'FRIDAYIN WMS'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}

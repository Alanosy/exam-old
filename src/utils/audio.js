export function mediaSrc(url) {
  if (!url) {
    return ''
  }
  return String(url).split('#')[0]
}

export function withOriginalName(url, name) {
  if (!url) {
    return ''
  }
  const clean = mediaSrc(url)
  if (!name) {
    return clean
  }
  return clean + '#' + encodeURIComponent(name)
}

export function fileNameFromUrl(url) {
  if (!url) {
    return '附件'
  }
  const str = String(url)
  const hashIndex = str.indexOf('#')
  if (hashIndex !== -1 && hashIndex < str.length - 1) {
    try {
      const named = decodeURIComponent(str.substring(hashIndex + 1))
      if (named) {
        return named
      }
    } catch (e) {
      // fall through
    }
  }
  try {
    const path = mediaSrc(str).split('?')[0]
    const name = path.substring(path.lastIndexOf('/') + 1)
    return decodeURIComponent(name || '附件')
  } catch (e) {
    return '附件'
  }
}

function toStoredUrl(item) {
  if (!item) {
    return ''
  }
  if (typeof item === 'string') {
    return item
  }
  if (typeof item === 'object' && item.url) {
    return withOriginalName(item.url, item.name)
  }
  return ''
}

export function parseAudioList(audio) {
  if (audio == null) {
    return []
  }
  if (Array.isArray(audio)) {
    return audio.map(toStoredUrl).filter(Boolean)
  }
  const value = String(audio).trim()
  if (!value) {
    return []
  }
  if (value.startsWith('[')) {
    try {
      const list = JSON.parse(value)
      if (Array.isArray(list)) {
        return list.map(toStoredUrl).filter(Boolean)
      }
    } catch (e) {
      return [value]
    }
  }
  return [value]
}

export function stringifyAudioList(list) {
  const urls = parseAudioList(list)
  if (!urls.length) {
    return ''
  }
  return JSON.stringify(urls)
}

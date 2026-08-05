'use client'

import { useEffect, useState } from 'react'

export default function ServiceWorkerRegister() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const updateStatus = () => setOffline(!navigator.onLine)
    updateStatus()
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // The website still works online even if registration is unavailable.
      })
    }

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  return offline ? <div className="offlineNotice">أنت تستخدم أثر دون إنترنت</div> : null
}

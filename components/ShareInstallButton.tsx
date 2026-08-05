'use client'

import { useEffect, useState } from 'react'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function ShareInstallButton() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function shareSite() {
    const shareData = {
      title: 'أثر',
      text: 'منصة أثر للقرآن والأدعية والزيارات والتسبيح والمواقيت وورد اليوم.',
      url: window.location.origin,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        setOpen(false)
        return
      }
      await navigator.clipboard.writeText(window.location.origin)
      setMessage('تم نسخ رابط المنصة')
    } catch (error) {
      if ((error as Error)?.name !== 'AbortError') setMessage('تعذرت المشاركة، انسخ الرابط من شريط المتصفح')
    }
  }

  async function installSite() {
    if (installPrompt) {
      await installPrompt.prompt()
      await installPrompt.userChoice
      setInstallPrompt(null)
      setOpen(false)
      return
    }
    setMessage('على iPhone: افتح المنصة في Safari ثم مشاركة ← إضافة إلى الشاشة الرئيسية.')
  }

  return <div className="shareInstallWrap">
    <button type="button" className="shareHeaderButton" onClick={() => { setOpen(value => !value); setMessage('') }} aria-expanded={open} aria-label="مشاركة منصة أثر أو إضافتها إلى الشاشة الرئيسية">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a3 3 0 1 0-2.83-4A3 3 0 0 0 15 5c0 .2.02.4.06.58L8.9 9.08A3 3 0 0 0 7 8.4a3 3 0 1 0 1.9 5.32l6.16 3.5A3 3 0 0 0 15 18a3 3 0 1 0 .83-2.06L9.68 12.5A3 3 0 0 0 10 11c0-.2-.02-.4-.06-.58l6.16-3.5A3 3 0 0 0 18 8Z" fill="currentColor"/></svg>
      <span>مشاركة</span>
    </button>
    {open && <div className="shareInstallPanel" role="dialog" aria-label="مشاركة وتثبيت منصة أثر">
      <strong>منصة أثر</strong>
      <button type="button" onClick={shareSite}>مشاركة المنصة أو نسخ الرابط</button>
      <button type="button" onClick={installSite}>إضافة إلى الشاشة الرئيسية</button>
      <p>{message || 'على iPhone: Safari ← مشاركة ← إضافة إلى الشاشة الرئيسية.'}</p>
    </div>}
  </div>
}

'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import type { Dua } from '../data/duas'

function readFavorites(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem('athar-favorites') || '[]')
    return Array.isArray(value) ? value.filter(item => typeof item === 'string') : []
  } catch {
    localStorage.removeItem('athar-favorites')
    return []
  }
}

export default function DuaReader({ dua }: { dua: Dua }) {
  const router = useRouter()
  const [fontSize, setFontSize] = useState(30)
  const [favorite, setFavorite] = useState(false)
  const [copyMessage, setCopyMessage] = useState('')
  const paragraphs = dua.text.filter(paragraph => paragraph.trim().length > 0)
  const fullText = useMemo(() => paragraphs.join('\n\n'), [paragraphs])

  useEffect(() => {
    setFavorite(readFavorites().includes(dua.id))
    localStorage.setItem('athar-last-dua', dua.id)
  }, [dua.id])

  function goBack() {
    if (window.history.length > 1) router.back()
    else router.push('/duas')
  }

  function toggleFavorite() {
    const saved = readFavorites()
    const next = saved.includes(dua.id) ? saved.filter(id => id !== dua.id) : [...saved, dua.id]
    localStorage.setItem('athar-favorites', JSON.stringify(next))
    setFavorite(next.includes(dua.id))
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(`${dua.title}\n\n${fullText}\n\nالمصدر: ${dua.source} — ${dua.section}`)
      setCopyMessage('تم نسخ النص')
    } catch {
      setCopyMessage('تعذر النسخ تلقائيًا')
    }
    window.setTimeout(() => setCopyMessage(''), 2200)
  }

  return (
    <article className="duaPage card">
      <div className="readerTopRow">
        <button type="button" className="backToSection" onClick={goBack}>← العودة إلى القائمة السابقة</button>
      </div>

      <div className="readerTools" aria-label="أدوات القراءة">
        <button type="button" onClick={() => setFontSize(size => Math.min(size + 2, 44))}>تكبير الخط +</button>
        <button type="button" onClick={() => setFontSize(size => Math.max(size - 2, 22))}>تصغير الخط −</button>
        <button type="button" onClick={toggleFavorite}>{favorite ? '★ محفوظ' : '☆ حفظ'}</button>
        <button type="button" onClick={copyText}>نسخ النص</button>
      </div>
      {copyMessage && <div className="copyMessage" role="status">{copyMessage}</div>}

      <div className="duaMeta">
        <span className="badge">{dua.category}</span>
      </div>
      <h1>{dua.title}</h1>

      <div className="longReader" style={{ fontSize }}>
        {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>

      <div className="sourceBox">
        <strong>المصدر:</strong> {dua.source}<br />
        <strong>الموضع:</strong> {dua.section}
      </div>
    </article>
  )
}

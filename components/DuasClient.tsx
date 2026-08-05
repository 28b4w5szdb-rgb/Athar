'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { duas } from '../data/duas'

const tabs = ['الكل','الأدعية','الزيارات']


const occasions = [
  { name:'الكل', icon:'✦' },
  { name:'شهر رمضان', icon:'☾' },
  { name:'شهر محرم', icon:'◆' },
  { name:'الأعياد', icon:'✧' },
  { name:'أيام الأسبوع', icon:'◷' },
  { name:'الصباح والمساء', icon:'☀' },
  { name:'السفر والحاجة والمرض', icon:'♡' },
  { name:'الإمام المهدي (عج)', icon:'۞' },
  { name:'زيارات الأئمة', icon:'◇' },
  { name:'الصحيفة السجادية', icon:'▤' },
  { name:'التعقيبات', icon:'◉' },
  { name:'الأعمال المشهورة', icon:'❖' },
  { name:'شهر رجب', icon:'☽' },
  { name:'شهر شعبان', icon:'◐' },
  { name:'شهر ذي الحجة', icon:'◈' },
  { name:'يوم الجمعة', icon:'✤' },
]

function groupOf(category: string) {
  if (category.includes('الزيارات') || category.includes('زيارة')) return 'الزيارات'
  if (category.includes('الصحيفة')) return 'الصحيفة السجادية'
  if (category.includes('الأعمال') || category.includes('رمضان') || category.includes('الأيام')) return 'أعمال الأيام والمناسبات'
  if (category.includes('التعقيبات') || category.includes('الأذكار') || category.includes('التسبيح')) return 'التعقيبات والأذكار'
  return 'الأدعية'
}

function occasionOf(title:string, category:string, section:string) {
  const all = `${title} ${category} ${section}`
  // أدعية الأيام السبعة تُعرض مجتمعة داخل أيقونة «أيام الأسبوع».
  if (title.startsWith('دعاء يوم ')) return 'أيام الأسبوع'
  if (all.includes('رمضان') || ['الافتتاح','أبي حمزة','البهاء','الجوشن الكبير'].some(x=>title.includes(x))) return 'شهر رمضان'
  if (all.includes('رجب') || ['أم داود','المجير'].some(x=>title.includes(x))) return 'شهر رجب'
  if (all.includes('شعبان') || title.includes('المناجاة الشعبانية')) return 'شهر شعبان'
  if (all.includes('ذي الحجة') || all.includes('عرفة')) return 'شهر ذي الحجة'
  if (all.includes('الجمعة') || title.includes('الندبة')) return 'يوم الجمعة'
  if (all.includes('محرم') || ['عاشوراء','الأربعين','علقمة','وارث'].some(x=>title.includes(x))) return 'شهر محرم'
  if (all.includes('العيد') || title.includes('الندبة')) return 'الأعياد'
  if (all.includes('أيام الأسبوع') || all.includes('يوم الجمعة')) return 'أيام الأسبوع'
  if (title.includes('الصباح') || title.includes('المساء')) return 'الصباح والمساء'
  if (['السفر','القبور','العديلة','يا مفزعي','يا عدتي'].some(x=>title.includes(x))) return 'السفر والحاجة والمرض'
  if (category.includes('المهدي') || ['الفرج','العهد','الغريق','معرفة الإمام','آل ياسين'].some(x=>title.includes(x))) return 'الإمام المهدي (عج)'
  if (groupOf(category)==='الزيارات') return 'زيارات الأئمة'
  if (category.includes('الصحيفة')) return 'الصحيفة السجادية'
  if (category.includes('تعقيب') || category.includes('الأذكار') || title.includes('الصلاة على') || title.includes('الاستغفار')) return 'التعقيبات'
  if (title.includes('حديث الكساء') || title.includes('الكساء')) return 'الأعمال المشهورة'
  return 'الكل'
}

function DuasContent() {
  const searchParams = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState(requestedTab && tabs.includes(requestedTab) ? requestedTab : 'الكل')
  const [occasion, setOccasion] = useState('الكل')
  const resultsRef = useRef<HTMLDivElement>(null)

  const visibleOccasions = useMemo(() => occasions.filter(item => item.name === 'الكل' || duas.some(d => occasionOf(d.title,d.category,d.section) === item.name)), [])

  useEffect(() => {
    const savedTab = sessionStorage.getItem('athar-duas-tab')
    const savedQuery = sessionStorage.getItem('athar-duas-query')
    const savedOccasion = sessionStorage.getItem('athar-duas-occasion')
    const nextTab = requestedTab && tabs.includes(requestedTab) ? requestedTab : savedTab
    if (nextTab && tabs.includes(nextTab)) setTab(nextTab)
    if (savedQuery) setQuery(savedQuery)
    if (savedOccasion && visibleOccasions.some(x=>x.name===savedOccasion)) setOccasion(savedOccasion)
    const savedScroll = Number(sessionStorage.getItem('athar-duas-scroll') || '0')
    if (savedScroll > 0) requestAnimationFrame(() => window.scrollTo({ top: savedScroll }))
  }, [requestedTab])

  useEffect(() => {
    sessionStorage.setItem('athar-duas-tab', tab)
    sessionStorage.setItem('athar-duas-query', query)
    sessionStorage.setItem('athar-duas-occasion', occasion)
  }, [tab, query, occasion])

  const filtered = useMemo(() => {
    const seen = new Set<string>()
    return duas.filter(d => {
      if (seen.has(d.title)) return false
      seen.add(d.title)
      const matchesSearch = d.title.includes(query) || d.category.includes(query) || d.source.includes(query)
      const group = groupOf(d.category)
      const matchesTab = tab === 'الكل' || (tab === 'الزيارات' ? group === 'الزيارات' : group !== 'الزيارات')
      const itemOccasion = occasionOf(d.title,d.category,d.section)
      const matchesOccasion = occasion === 'الكل' || itemOccasion === occasion
      return matchesSearch && matchesTab && matchesOccasion
    })
  }, [query, tab, occasion])

  function jumpToResults() {
    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  function rememberPosition() {
    sessionStorage.setItem('athar-duas-scroll', String(window.scrollY))
    sessionStorage.setItem('athar-duas-tab', tab)
    sessionStorage.setItem('athar-duas-query', query)
    sessionStorage.setItem('athar-duas-occasion', occasion)
  }

  return <main className="section"><div className="container">
    <h1>الأدعية والزيارات</h1>
    <div className="notice">اختر المناسبة أو القسم للوصول السريع. وُزِّعت الأدعية والزيارات على أقسامها الطبيعية بحسب الشهر أو المناسبة أو نوع المحتوى.</div>

    <h2 className="occasionTitle">التقسيم حسب المناسبة</h2>
    <div className="occasionGrid" aria-label="التقسيم حسب المناسبات">
      {visibleOccasions.map(item => <button key={item.name} className={`occasionCard ${occasion===item.name?'active':''}`} onClick={()=>{
        setOccasion(item.name)
        setQuery('')
        if (item.name === 'الكل') setTab('الكل')
        else if (item.name === 'زيارات الأئمة') setTab('الزيارات')
        else if (item.name === 'شهر محرم') setTab('الكل')
        else setTab('الأدعية')
        jumpToResults()
      }}>
        <span className="occasionIcon">{item.icon}</span><span>{item.name}</span>
      </button>)}
    </div>

    <div className="contentTabs simplifiedTabs" role="tablist" aria-label="نوع المحتوى">
      {tabs.map(item => <button key={item} className={`contentTab ${tab === item ? 'active' : ''}`} onClick={() => { setTab(item); setOccasion('الكل') }}>{item}</button>)}
    </div>
    <input className="search standaloneSearch" placeholder="ابحث باسم الدعاء أو الزيارة أو المصدر" value={query} onChange={e => setQuery(e.target.value)} />
    <div className="resultsCount" ref={resultsRef}>عدد النتائج: {filtered.length}</div>
    <div className="duaGrid">
      {filtered.map(d => {
        const group = groupOf(d.category)
        return <Link className="duaCard card" href={`/duas/${d.id}`} key={d.id} onClick={rememberPosition}>
          <div className="duaMeta"><span className="badge">{d.category}</span></div>
          <h2>{d.title}</h2>
          <p>{d.text[0].slice(0, 105)}{d.text[0].length > 105 ? '…' : ''}</p>
          <div className="sourceLine">المصدر الأساسي: {d.primarySource}<br/>المصادر المقارنة: {d.comparisonSources.join('، ')}<br/>{d.section}</div>
          <strong className="readMore">فتح الصفحة ←</strong>
        </Link>
      })}
    </div>
    {filtered.length === 0 && <div className="empty card">لا توجد نتائج مطابقة.</div>}
  </div></main>
}


export default DuasContent

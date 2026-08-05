'use client'

import {useEffect,useMemo,useState} from 'react'
import {libraryCategories,libraryEntries,LibraryEntry} from '../../data/library'

const FAV_KEY='athar-library-favorites-v40'
const LAST_KEY='athar-library-last-v40'

type Category=(typeof libraryCategories)[number]['id']

export default function Library(){
  const [query,setQuery]=useState('')
  const [category,setCategory]=useState<Category>('all')
  const [selectedId,setSelectedId]=useState(libraryEntries[0]?.id||'')
  const [favorites,setFavorites]=useState<string[]>([])
  const [onlyFavorites,setOnlyFavorites]=useState(false)

  useEffect(()=>{
    try{
      const saved=JSON.parse(localStorage.getItem(FAV_KEY)||'[]')
      if(Array.isArray(saved))setFavorites(saved)
      const last=localStorage.getItem(LAST_KEY)
      if(last&&libraryEntries.some(x=>x.id===last))setSelectedId(last)
    }catch{}
  },[])

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase()
    return libraryEntries.filter(item=>{
      const categoryMatch=category==='all'||item.category===category
      const favoriteMatch=!onlyFavorites||favorites.includes(item.id)
      const queryMatch=!q||[item.title,item.summary,item.source,...item.keywords].join(' ').toLowerCase().includes(q)
      return categoryMatch&&favoriteMatch&&queryMatch
    })
  },[query,category,onlyFavorites,favorites])

  const selected:LibraryEntry|undefined=libraryEntries.find(x=>x.id===selectedId)

  function openEntry(id:string){
    setSelectedId(id)
    try{localStorage.setItem(LAST_KEY,id)}catch{}
    requestAnimationFrame(()=>document.getElementById('library-reader')?.scrollIntoView({behavior:'smooth',block:'start'}))
  }

  function toggleFavorite(id:string){
    setFavorites(current=>{
      const next=current.includes(id)?current.filter(x=>x!==id):[...current,id]
      try{localStorage.setItem(FAV_KEY,JSON.stringify(next))}catch{}
      return next
    })
  }

  return <main className="section libraryPage"><div className="container">
    <section className="libraryHero card">
      <span className="badge">الإصدار الأول</span>
      <h1>مكتبة أثر</h1>
      <p>قراءات تربوية مختارة في الحقوق والحِكم والقصص القرآنية وتهذيب النفس، مع بيان المصدر.</p>
    </section>

    <div className="notice libraryNotice">لا تكرر المكتبة كتب الأدعية والزيارات الموجودة في قسمها الخاص.</div>

    <input className="search librarySearch" value={query} onChange={e=>setQuery(e.target.value)} placeholder="ابحث عن عنوان أو موضوع مثل: الصبر، اللسان، يوسف…" aria-label="البحث في المكتبة"/>

    <div className="libraryTabs" role="tablist" aria-label="أقسام المكتبة">
      {libraryCategories.map(item=><button key={item.id} className={category===item.id?'active':''} onClick={()=>setCategory(item.id)}>{item.label}</button>)}
      <button className={onlyFavorites?'active favoriteTab':'favoriteTab'} onClick={()=>setOnlyFavorites(v=>!v)}>★ المفضلة ({favorites.length})</button>
    </div>

    <div className="libraryLayout">
      <aside className="card libraryIndex">
        <div className="libraryIndexHead"><strong>العناوين</strong><span>{filtered.length}</span></div>
        <div className="libraryIndexScroll">
          {filtered.length?filtered.map(item=><button key={item.id} className={`libraryItem ${selectedId===item.id?'active':''}`} onClick={()=>openEntry(item.id)}>
            <span className="libraryItemTitle">{item.title}</span>
            <span className="libraryItemMeta">{item.categoryLabel}</span>
          </button>):<div className="empty">لا توجد نتائج مطابقة.</div>}
        </div>
      </aside>

      <section id="library-reader" className="card libraryReader">
        {selected?<>
          <div className="libraryReaderHead">
            <div><span className="badge">{selected.categoryLabel}</span><h2>{selected.title}</h2></div>
            <button className={`libraryFavoriteButton ${favorites.includes(selected.id)?'active':''}`} onClick={()=>toggleFavorite(selected.id)} aria-label="إضافة إلى المفضلة">{favorites.includes(selected.id)?'★ محفوظ':'☆ حفظ'}</button>
          </div>
          <p className="librarySummary">{selected.summary}</p>
          <div className="longReader libraryText">{selected.text.map((p,i)=><p key={i}>{p}</p>)}</div>
          <div className="sourceBox librarySource"><strong>المصدر:</strong> {selected.source}</div>
        </>:<div className="empty">اختر عنوانًا للقراءة.</div>}
      </section>
    </div>
  </div></main>
}

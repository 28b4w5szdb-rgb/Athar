'use client'
import { useEffect, useState } from 'react'
export default function ThemeToggle(){
  const [dark,setDark]=useState(false)
  useEffect(()=>{const saved=localStorage.getItem('athar-theme');const value=saved==='dark';setDark(value);document.documentElement.classList.toggle('dark',value)},[])
  const toggle=()=>{const next=!dark;setDark(next);document.documentElement.classList.toggle('dark',next);localStorage.setItem('athar-theme',next?'dark':'light')}
  return <button className="btn secondary" onClick={toggle}>{dark?'الوضع النهاري':'الوضع الليلي'}</button>
}

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type Times = { fajr: string; sunrise: string; dhuhr: string; maghrib: string }
type PrayerData = {
  city: string
  date: string
  calculatedAt: string
  source: string
  times: Times
}

const CACHE_KEY = 'athar-prayer-times-v39-6'
const SETTINGS_KEY = 'athar-prayer-reminders-v44'
const PUSH_API = process.env.NEXT_PUBLIC_ATHAR_PUSH_API || ''

// مدينة الكاظمية في بغداد
const LATITUDE = 33.378
const LONGITUDE = 44.340
const TIME_ZONE = 3

// إعدادات فلكية محلية متغيرة يوميًا وفق المنهج الجعفري
// تمت معايرة زاوية الفجر لإحداثيات الكاظمية بدل إضافة وقت ثابت.
const FAJR_ANGLE = 17.9
const MAGHRIB_ANGLE = 4

const labels: Record<keyof Times, string> = {
  fajr: 'صلاة الصبح',
  sunrise: 'الشروق',
  dhuhr: 'صلاة الظهر',
  maghrib: 'صلاة المغرب',
}

function degToRad(value: number) { return value * Math.PI / 180 }
function radToDeg(value: number) { return value * 180 / Math.PI }

function julianDay(year: number, month: number, day: number) {
  let y = year
  let m = month
  if (m <= 2) { y -= 1; m += 12 }
  const a = Math.floor(y / 100)
  const b = 2 - a + Math.floor(a / 4)
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5
}

function solarCoordinates(jd: number) {
  const t = (jd - 2451545.0) / 36525
  const l0 = (280.46646 + t * (36000.76983 + 0.0003032 * t)) % 360
  const m = 357.52911 + t * (35999.05029 - 0.0001537 * t)
  const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t)
  const c = Math.sin(degToRad(m)) * (1.914602 - t * (0.004817 + 0.000014 * t))
    + Math.sin(degToRad(2 * m)) * (0.019993 - 0.000101 * t)
    + Math.sin(degToRad(3 * m)) * 0.000289
  const trueLong = l0 + c
  const omega = 125.04 - 1934.136 * t
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(degToRad(omega))
  const epsilon0 = 23 + (26 + ((21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60)) / 60
  const epsilon = epsilon0 + 0.00256 * Math.cos(degToRad(omega))
  const declination = radToDeg(Math.asin(Math.sin(degToRad(epsilon)) * Math.sin(degToRad(lambda))))

  const y = Math.tan(degToRad(epsilon / 2)) ** 2
  const eqTime = 4 * radToDeg(
    y * Math.sin(2 * degToRad(l0))
    - 2 * e * Math.sin(degToRad(m))
    + 4 * e * y * Math.sin(degToRad(m)) * Math.cos(2 * degToRad(l0))
    - 0.5 * y * y * Math.sin(4 * degToRad(l0))
    - 1.25 * e * e * Math.sin(2 * degToRad(m))
  )
  return { declination, eqTime }
}

function hourAngle(latitude: number, declination: number, zenith: number) {
  const lat = degToRad(latitude)
  const dec = degToRad(declination)
  const cosH = (Math.cos(degToRad(zenith)) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec))
  const safe = Math.min(1, Math.max(-1, cosH))
  return radToDeg(Math.acos(safe))
}

function formatTime(totalMinutes: number) {
  let minutes = Math.round(totalMinutes)
  minutes = ((minutes % 1440) + 1440) % 1440
  const hour24 = Math.floor(minutes / 60)
  const minute = minutes % 60
  const suffix = hour24 < 12 ? 'ص' : 'م'
  const hour12 = hour24 % 12 || 12
  return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`
}

function baghdadDateParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Baghdad', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now)
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value || 0)
  return { year: value('year'), month: value('month'), day: value('day') }
}

function calculatePrayerTimes(now = new Date()): PrayerData {
  const { year, month, day } = baghdadDateParts(now)
  const jd = julianDay(year, month, day)
  const { declination, eqTime } = solarCoordinates(jd)
  const solarNoon = 720 - 4 * LONGITUDE - eqTime + TIME_ZONE * 60

  const sunriseOffset = hourAngle(LATITUDE, declination, 90.833) * 4
  const fajrOffset = hourAngle(LATITUDE, declination, 90 + FAJR_ANGLE) * 4
  const maghribOffset = hourAngle(LATITUDE, declination, 90 + MAGHRIB_ANGLE) * 4

  const dateText = new Intl.DateTimeFormat('ar-IQ', {
    timeZone: 'Asia/Baghdad', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).format(now)

  return {
    city: 'مدينة الكاظمية — بغداد',
    date: dateText,
    calculatedAt: new Date().toISOString(),
    source: 'حساب فلكي محلي متغير يوميًا بالطريقة الجعفرية، مضبوط لمدينة الكاظمية',
    times: {
      fajr: formatTime(solarNoon - fajrOffset),
      sunrise: formatTime(solarNoon - sunriseOffset),
      dhuhr: formatTime(solarNoon + 1),
      maghrib: formatTime(solarNoon + maghribOffset),
    },
  }
}

function toMinutes(value: string | null) {
  if (!value) return null
  const normalized = value.replace(/\s/g, '')
  const match = normalized.match(/(\d{1,2}):(\d{2})([صم])?/)
  if (!match) return null
  let hour = Number(match[1])
  const minute = Number(match[2])
  const suffix = match[3]
  if (suffix === 'م' && hour !== 12) hour += 12
  if (suffix === 'ص' && hour === 12) hour = 0
  return hour * 60 + minute
}


function base64UrlToUint8Array(value: string) {
  const padding = '='.repeat((4 - value.length % 4) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from(raw, char => char.charCodeAt(0))
}

async function getPushRegistration() {
  if (!('serviceWorker' in navigator)) throw new Error('service-worker-unavailable')
  const registration = await navigator.serviceWorker.ready
  if (!('pushManager' in registration)) throw new Error('push-unavailable')
  return registration
}

export default function PrayerTimesClient() {
  const [data, setData] = useState<PrayerData | null>(null)
  const [status, setStatus] = useState('')
  const [reminders, setReminders] = useState(false)
  const [pushReady, setPushReady] = useState(false)
  const [pushBusy, setPushBusy] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const notifiedRef = useRef<string>('')

  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) setData(JSON.parse(cached))
      setReminders(localStorage.getItem(SETTINGS_KEY) === 'on')
      setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true)
    } catch (_) {}
    refresh()
    ;(async()=>{
      try{
        const registration=await getPushRegistration()
        const subscription=await registration.pushManager.getSubscription()
        setPushReady(Boolean(subscription))
      }catch(_){}
    })()
  }, [])

  function refresh() {
    try {
      const next = calculatePrayerTimes()
      setData(next)
      localStorage.setItem(CACHE_KEY, JSON.stringify(next))
      setStatus('مواقيت محسوبة محليًا لمدينة الكاظمية وتتجدد تلقائيًا كل يوم.')
    } catch (_) {
      setStatus('تعذر حساب المواقيت على هذا الجهاز. أعد فتح الصفحة وحاول مرة أخرى.')
    }
  }

  async function enableReminders() {
    if (!('Notification' in window)) {
      setStatus('هذا المتصفح لا يدعم إشعارات الويب.')
      return
    }
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setStatus('لم يتم السماح بالإشعارات.')
      return
    }
    localStorage.setItem(SETTINGS_KEY, 'on')
    setReminders(true)

    if (!PUSH_API) {
      setStatus('تم تشغيل التنبيه داخل المنصة. إشعارات خارج المنصة تحتاج تفعيل خدمة الإرسال مرة واحدة من إعدادات النشر.')
      return
    }

    setPushBusy(true)
    try {
      const registration = await getPushRegistration()
      const keyResponse = await fetch(`${PUSH_API}/vapid-public-key`)
      if (!keyResponse.ok) throw new Error('key')
      const { publicKey } = await keyResponse.json()
      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64UrlToUint8Array(publicKey),
        })
      }
      const response = await fetch(`${PUSH_API}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription, city: 'الكاظمية', prayers: ['fajr','dhuhr','maghrib'] }),
      })
      if (!response.ok) throw new Error('subscribe')
      setPushReady(true)
      setStatus('تم تشغيل إشعارات الصلاة خارج المنصة بنجاح. ستصل تنبيهات الصبح والظهر والمغرب حتى عند إغلاق المنصة.')
      await registration.showNotification('أثر', { body: 'تم تشغيل إشعارات مواقيت الصلاة.', icon: '/athar-icon-192.png', badge: '/athar-icon-192.png' })
    } catch (_) {
      setStatus('تم السماح بالإشعارات، لكن خدمة الإرسال الخارجية غير مرتبطة بعد. أكمل إعداد Athar Push Worker في Cloudflare.')
    } finally {
      setPushBusy(false)
    }
  }

  async function disableReminders() {
    localStorage.setItem(SETTINGS_KEY, 'off')
    setReminders(false)
    setPushBusy(true)
    try {
      const registration = await getPushRegistration()
      const subscription = await registration.pushManager.getSubscription()
      if (subscription && PUSH_API) {
        await fetch(`${PUSH_API}/unsubscribe`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ endpoint: subscription.endpoint }) })
      }
      if (subscription) await subscription.unsubscribe()
      setPushReady(false)
      setStatus('تم إيقاف التنبيهات.')
    } catch (_) {
      setStatus('تم إيقاف التنبيه داخل المنصة.')
    } finally {
      setPushBusy(false)
    }
  }

  async function testNotification() {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      setStatus('شغّل الإشعارات أولًا، ثم جرّب الاختبار.')
      return
    }
    try {
      const registration = await getPushRegistration()
      await registration.showNotification('أثر — اختبار الإشعارات', {
        body: 'الإشعارات تعمل على هذا الجهاز.',
        icon: '/athar-icon-192.png',
        badge: '/athar-icon-192.png',
        tag: 'athar-test',
        data: { url: '/prayer-times' },
      })
      setStatus('تم إرسال إشعار تجريبي إلى جهازك.')
    } catch (_) {
      new Notification('أثر — اختبار الإشعارات', { body: 'الإشعارات تعمل على هذا الجهاز.' })
    }
  }

  function playShortReminder() {
    try {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance('الله أكبر، الله أكبر')
        utterance.lang = 'ar-IQ'
        utterance.rate = 0.82
        speechSynthesis.speak(utterance)
      }
    } catch (_) {}
  }

  useEffect(() => {
    if (!data || !reminders) return
    const check = () => {
      const now = new Date()
      const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Baghdad', hour: '2-digit', minute: '2-digit', hour12: false })
      const [h, m] = formatter.format(now).split(':').map(Number)
      const current = h * 60 + m
      const dateKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Baghdad' }).format(now)
      ;(['fajr', 'dhuhr', 'maghrib'] as const).forEach(key => {
        const prayerMinute = toMinutes(data.times[key])
        const notificationKey = `${dateKey}-${key}`
        if (prayerMinute === current && notifiedRef.current !== notificationKey) {
          notifiedRef.current = notificationKey
          if (Notification.permission === 'granted') new Notification(`حان وقت ${labels[key]}`, { body: 'تقبّل الله طاعتكم — منصة أثر' })
          playShortReminder()
        }
      })
    }
    check()
    const timer = window.setInterval(check, 20_000)
    return () => window.clearInterval(timer)
  }, [data, reminders])

  const nextPrayer = useMemo(() => {
    if (!data) return null
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Baghdad', hour: '2-digit', minute: '2-digit', hour12: false })
    const [h, m] = formatter.format(now).split(':').map(Number)
    const current = h * 60 + m
    const entries = (['fajr', 'dhuhr', 'maghrib'] as const)
      .map(key => ({ key, minute: toMinutes(data.times[key]) }))
      .filter(item => item.minute !== null) as { key: 'fajr'|'dhuhr'|'maghrib'; minute: number }[]
    return entries.find(item => item.minute > current) || entries[0] || null
  }, [data])

  return <main className="container prayerPage">
    <section className="hero compactHero">
      <div>
        <span className="eyebrow">المواقيت والأذان</span>
        <h1>مواقيت الصلاة</h1>
        <p>حساب فلكي محلي متغير تلقائيًا كل يوم، بالطريقة الجعفرية ومضبوط لمدينة الكاظمية.</p>
      </div>
    </section>

    <section className="prayerPanel">
      <div className="prayerPanelHead">
        <div>
          <h2>{data?.city || 'مدينة الكاظمية — بغداد'}</h2>
          <p>{data?.date || 'جاري حساب مواقيت اليوم...'}</p>
        </div>
        <button className="softButton" onClick={refresh}>إعادة حساب المواقيت</button>
      </div>

      {data && <>
        {nextPrayer && <div className="nextPrayer">الموعد التالي: <strong>{labels[nextPrayer.key]}</strong> — {data.times[nextPrayer.key]}</div>}
        <div className="prayerGrid">
          <article><span>الصبح</span><strong>{data.times.fajr}</strong></article>
          <article><span>الشروق</span><strong>{data.times.sunrise}</strong></article>
          <article><span>الظهر</span><strong>{data.times.dhuhr}</strong></article>
          <article><span>المغرب</span><strong>{data.times.maghrib}</strong></article>
        </div>
      </>}

      <div className="reminderBox">
        <div>
          <h3>إشعارات مواقيت الصلاة</h3>
          <p>{pushReady ? 'مفعلة خارج المنصة للصبح والظهر والمغرب.' : 'اضغط تشغيل الإشعارات ليصلك التنبيه حتى عند إغلاق المنصة.'}</p>
          {!isStandalone && <small className="pushInstallHint">على iPhone: أضف أثر إلى الشاشة الرئيسية وافتحها من الأيقونة قبل التفعيل.</small>}
        </div>
        <div className="pushActions">
          {reminders
            ? <button className="softButton" disabled={pushBusy} onClick={disableReminders}>{pushBusy?'جاري الإيقاف…':'إيقاف الإشعارات'}</button>
            : <button className="primaryButton" disabled={pushBusy} onClick={enableReminders}>{pushBusy?'جاري التفعيل…':'تشغيل الإشعارات'}</button>}
          {reminders && <button className="softButton" type="button" onClick={testNotification}>اختبار الإشعار</button>}
        </div>
      </div>

      {status && <p className="noticeText prayerStatus" role="status">{status}</p>}
      <p className="sourceNote warningNote">تنبيه: قد يختلف الوقت دقيقة أو دقيقتين عن النشرة الرسمية بحسب ضوابط الرؤية والحساب المحلي.</p>
    </section>
  </main>
}

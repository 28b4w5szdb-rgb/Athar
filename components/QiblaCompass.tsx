'use client'

import { useEffect, useRef, useState } from 'react'

type CompassState = {
  latitude: number
  longitude: number
  qibla: number
  heading: number | null
  accuracy: number | null
}

const KAABA_LAT = 21.4225
const KAABA_LON = 39.8262

function toRad(value: number) { return value * Math.PI / 180 }
function toDeg(value: number) { return value * 180 / Math.PI }
function normalize(value: number) { return (value % 360 + 360) % 360 }
function signedDifference(target: number, current: number) {
  return ((target - current + 540) % 360) - 180
}
function qiblaBearing(latitude: number, longitude: number) {
  const lat1 = toRad(latitude)
  const lat2 = toRad(KAABA_LAT)
  const deltaLon = toRad(KAABA_LON - longitude)
  const y = Math.sin(deltaLon)
  const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(deltaLon)
  return normalize(toDeg(Math.atan2(y, x)))
}

export default function QiblaCompass() {
  const [state, setState] = useState<CompassState | null>(null)
  const [status, setStatus] = useState('اضغط تشغيل البوصلة، ثم اسمح بالوصول إلى الموقع والحركة.')
  const [active, setActive] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const wasAligned = useRef(false)
  const smoothedHeading = useRef<number | null>(null)
  const lastEventAt = useRef(0)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => () => cleanupRef.current?.(), [])

  async function requestOrientationPermission() {
    const Orientation = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>
    }
    if (typeof Orientation.requestPermission === 'function') {
      return (await Orientation.requestPermission()) === 'granted'
    }
    return true
  }

  async function startCompass() {
    cleanupRef.current?.()
    smoothedHeading.current = null
    lastEventAt.current = 0

    if (!navigator.geolocation) {
      setStatus('هذا الجهاز لا يدعم تحديد الموقع.')
      return
    }
    try {
      const allowed = await requestOrientationPermission()
      if (!allowed) {
        setStatus('لم يتم منح إذن الحركة والبوصلة.')
        return
      }
    } catch {
      setStatus('تعذر تفعيل إذن البوصلة. افتح المنصة من المتصفح أو من أيقونتها على الشاشة الرئيسية وجرّب مجددًا.')
      return
    }

    setStatus('جارٍ تحديد موقعك…')
    navigator.geolocation.getCurrentPosition(position => {
      const latitude = position.coords.latitude
      const longitude = position.coords.longitude
      const qibla = qiblaBearing(latitude, longitude)
      setState({ latitude, longitude, qibla, heading: null, accuracy: null })
      setActive(true)
      setStatus('ضع الهاتف مستويًا وابتعد عن المعادن. حرّكه على شكل رقم 8 فقط إذا كان السهم غير مستقر.')

      const handleOrientation = (event: DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number }) => {
        const rawHeading = typeof event.webkitCompassHeading === 'number'
          ? event.webkitCompassHeading
          : (typeof event.alpha === 'number' ? normalize(360 - event.alpha) : null)
        if (rawHeading === null) return

        // Keep a very light circular smoothing only to remove sensor jitter.
        // The stronger smoothing used previously made the arrow visibly lag behind the phone.
        const now = Date.now()
        if (now - lastEventAt.current < 35) return
        lastEventAt.current = now

        const previous = smoothedHeading.current
        const next = previous === null
          ? rawHeading
          : normalize(previous + signedDifference(rawHeading, previous) * 0.72)
        smoothedHeading.current = next
        const accuracy = typeof event.webkitCompassAccuracy === 'number' ? event.webkitCompassAccuracy : null
        setState(current => current ? { ...current, heading: next, accuracy } : current)
      }

      const Orientation = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<'granted' | 'denied'>
      }
      const isIOSCompass = typeof Orientation.requestPermission === 'function'

      // iPhone supplies the calibrated north heading through deviceorientation.
      // Other devices prefer the absolute event, with deviceorientation as fallback.
      if (isIOSCompass) {
        window.addEventListener('deviceorientation', handleOrientation as EventListener, true)
      } else {
        window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true)
        window.addEventListener('deviceorientation', handleOrientation as EventListener, true)
      }

      cleanupRef.current = () => {
        window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener, true)
        window.removeEventListener('deviceorientation', handleOrientation as EventListener, true)
      }
    }, error => {
      setStatus(error.code === 1
        ? 'يجب السماح للمنصة باستخدام موقعك لتحديد القبلة.'
        : 'تعذر تحديد الموقع. تأكد من تشغيل خدمات الموقع.')
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 })
  }

  const deviation = state?.heading === null || !state ? null : signedDifference(state.qibla, state.heading)
  const difference = deviation === null ? null : Math.abs(deviation)
  const aligned = difference !== null && difference < 6
  const rotation = deviation ?? 0

  useEffect(() => {
    if (aligned && !wasAligned.current && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([90, 45, 90])
    }
    wasAligned.current = aligned
  }, [aligned])

  const guidance = aligned
    ? 'أنت الآن باتجاه القبلة ✓'
    : active && deviation !== null
      ? deviation > 0
        ? `انحرف يمينًا ${Math.round(Math.abs(deviation)).toLocaleString('ar-IQ')}°`
        : `انحرف يسارًا ${Math.round(Math.abs(deviation)).toLocaleString('ar-IQ')}°`
      : active
        ? 'حرّك الهاتف ببطء حتى يشير السهم إلى رمز الكعبة'
        : 'اضغط تشغيل البوصلة'

  return <section className="qiblaPanel card">
    <div className="qiblaHead">
      <span className="badge">اتجاه مكة المكرمة</span>
      <h1>بوصلة القبلة</h1>
      <p>ضع الهاتف بشكل مستوٍ، ثم اتبع السهم حتى يصل إلى رمز الكعبة أعلى الدائرة.</p>
    </div>

    <div className={`qiblaCompass ${aligned ? 'aligned' : ''}`}>
      <div className="qiblaKaaba" aria-hidden="true"><span>◆</span><small>الكعبة</small></div>
      <div className="qiblaMarks" aria-hidden="true">
        <span className="east">ق</span><span className="south">ج</span><span className="west">غ</span>
      </div>
      <div className="qiblaArrow" style={{ transform: `rotate(${rotation}deg)` }} aria-label="سهم اتجاه القبلة">
        <span>▲</span>
      </div>
      <div className="qiblaCenter">⌖</div>
    </div>

    <div className={`qiblaGuidance ${aligned ? 'aligned' : ''}`}>
      <strong>{guidance}</strong>
    </div>

    <button className="primaryButton qiblaStart" onClick={startCompass}>{active ? 'إعادة المعايرة' : 'تشغيل البوصلة'}</button>
    <div className="noticeText qiblaStatus">{status}</div>

    {state && <button className="qiblaDetailsButton" type="button" onClick={() => setShowDetails(value => !value)}>
      {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
    </button>}
    {showDetails && state && <div className="qiblaInfo qiblaTechnical">
      <span>زاوية القبلة: {Math.round(state.qibla).toLocaleString('ar-IQ')}°</span>
      {state.heading !== null && <span>اتجاه الهاتف: {Math.round(state.heading).toLocaleString('ar-IQ')}°</span>}
      {difference !== null && <span>مقدار الانحراف: {Math.round(difference).toLocaleString('ar-IQ')}°</span>}
      {state.accuracy !== null && <span>دقة المستشعر: ±{Math.round(state.accuracy).toLocaleString('ar-IQ')}°</span>}
    </div>}
    <p className="sourceNote">إذا تحرك السهم بصورة غير طبيعية، أبعد الهاتف عن الغطاء المغناطيسي والمعادن ثم حرّكه مرة واحدة على شكل رقم 8.</p>
  </section>
}

import { useEffect, useMemo, useState } from 'react'

import { api } from '../api/client.js'

// รองรับ: FR-BKG-01, FR-BKG-06
export default function SlotPicker() {
  const [packageCode, setPackageCode] = useState('basic')
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().slice(0, 10))
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [loading, setLoading] = useState(false)

  const packageOptions = useMemo(
    () => [
      { value: 'basic', label: 'แพ็กเกจพื้นฐาน' },
      { value: 'premium', label: 'แพ็กเกจพรีเมียม' },
    ],
    [],
  )

  useEffect(() => {
    let active = true
    const loadSlots = async () => {
      setLoading(true)
      try {
        const data = await api.getSlots({ dateFrom, packageCode })
        if (active) {
          setSlots(data.slots ?? [])
          setSelectedSlot((current) => {
            if (current && (data.slots ?? []).some((slot) => slot.id === current)) {
              return current
            }
            return (data.slots ?? [])[0]?.id ?? ''
          })
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadSlots()
    return () => {
      active = false
    }
  }, [dateFrom, packageCode])

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-800">เลือกแพ็กเกจและช่วงเวลา</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">แพ็กเกจ</span>
          <select
            aria-label="แพ็กเกจ"
            value={packageCode}
            onChange={(event) => setPackageCode(event.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2"
          >
            {packageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">วันที่เริ่มค้นหา</span>
          <input
            aria-label="วันที่เริ่มค้นหา"
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2"
          />
        </label>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">ช่วงเวลา</span>
          {loading && <span className="text-sm text-slate-500">กำลังโหลด...</span>}
        </div>

        <div className="grid gap-2">
          {slots.length === 0 && !loading ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
              ไม่มีช่วงเวลาที่ว่างในช่วงนี้
            </p>
          ) : (
            slots.map((slot) => (
              <label
                key={slot.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 ${
                  selectedSlot === slot.id ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <span>
                  <span className="block font-medium text-slate-800">{slot.slot_date} • {slot.start_time}</span>
                  <span className="text-sm text-slate-500">ที่นั่งคงเหลือ: {slot.remaining}</span>
                </span>
                <input
                  type="radio"
                  name="slot"
                  value={slot.id}
                  checked={selectedSlot === slot.id}
                  onChange={() => setSelectedSlot(slot.id)}
                  aria-label={`เลือก ${slot.slot_date} ${slot.start_time}`}
                />
              </label>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

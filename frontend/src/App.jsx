// เส้นทางหลักของ UC-01: เลือกเวลา (T-10) แล้วยืนยัน (T-11)
import { useState } from 'react'
import { api } from './api/client.js'
import SlotPicker from './pages/SlotPicker.jsx'
import ConfirmBooking from './pages/ConfirmBooking.jsx'

export default function App() {
  const [slot, setSlot] = useState(null)
  const today = new Date().toISOString().slice(0, 10)
  return (
    <main className="mx-auto max-w-2xl p-6">
      <p className="sr-only">ระบบจองคิวตรวจสุขภาพ</p>
      {slot
        ? <ConfirmBooking api={api} slot={slot} onBack={(alt) => setSlot(alt)} />
        : <SlotPicker api={api} dateFrom={today} onNext={(id) => setSlot({ id, slot_date: today, start_time: '09:00' })} />}
    </main>
  )
}

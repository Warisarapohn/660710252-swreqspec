// รองรับ FR-BKG-03, FR-BKG-04 (T-11) แบบหน้าจอ UI-BKG-02
import { useState } from 'react'

export default function ConfirmBooking({ api, slot, onDone, onBack }) {
  const [full, setFull] = useState(null)   // ผลเมื่อช่วงเวลาเต็ม (409)
  const [booking, setBooking] = useState(null)
  const [cancelled, setCancelled] = useState(false)

  async function confirm() {
    const res = await api.createBooking({ slotId: slot.id })
    if (res.status === 409) setFull(res.body)
    else { setBooking(res.body); onDone?.(res.body) }
  }

  // ยกเลิกการจอง เผื่อผู้ใช้กดจองผิด (FR-BKG-04)
  async function cancel() {
    await api.cancelBooking({ bookingId: booking.booking_id })
    setCancelled(true)
  }

  if (booking) {
    return (
      <section className="mx-auto max-w-md p-4">
        <h1 className="text-xl font-bold">จองคิวตรวจสุขภาพ</h1>
        <p className="mt-4 text-lg font-bold text-green-700">{cancelled ? 'ยกเลิกแล้ว' : 'จองสำเร็จ'}</p>
        <p className="mt-2">หมายเลขคิว {booking.queue_no}</p>
        {!cancelled && (
          <button type="button" className="mt-4 w-full rounded-xl border border-red-600 p-3 text-red-600" onClick={cancel}>
            ยกเลิกการจอง
          </button>
        )}
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-bold">จองคิวตรวจสุขภาพ</h1>
      <ol className="mt-2 flex gap-2 text-xs">
        <li className="rounded-full bg-slate-100 px-3 py-1">1 เลือกเวลา</li>
        <li className="rounded-full bg-teal-700 px-3 py-1 text-white">2 ยืนยัน</li>
        <li className="rounded-full bg-slate-100 px-3 py-1">3 ผลการจอง</li>
      </ol>

      {full ? (
        <div role="alert" className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3">
          <p className="font-bold text-red-700">เต็มแล้ว</p>
          <p className="text-sm">ช่วง {slot.start_time} น. มีผู้จองครบแล้ว เลือกช่วงที่ว่างใกล้เคียง</p>
          <ul className="mt-2">
            {(full.alternatives ?? []).slice(0, 2).map((a) => (
              <li key={a.id} className="mt-1 flex justify-between rounded-lg border bg-white p-2 text-sm">
                <span>{a.slot_date} {a.start_time} น.</span>
                <button type="button" className="font-bold text-teal-700" onClick={() => onBack?.(a)}>เลือกช่วงนี้</button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <dl className="mt-4 rounded-xl border p-3 text-sm">
          <div className="flex justify-between"><dt className="text-slate-600">วันที่</dt><dd>{slot.slot_date}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-600">เวลา</dt><dd>{slot.start_time} น.</dd></div>
        </dl>
      )}

      {!full && (
        <button type="button" className="mt-4 w-full rounded-xl bg-teal-700 p-3 font-bold text-white" onClick={confirm}>
          ยืนยันการจอง
        </button>
      )}
      <button type="button" className="mt-2 w-full rounded-xl border border-teal-700 p-3 text-teal-700" onClick={() => onBack?.(null)}>
        กลับไปเลือกเวลา
      </button>
    </section>
  )
}

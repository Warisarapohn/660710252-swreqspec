// test ของ T-11 (AC-BKG-03): ช่วงเวลาเต็มระหว่างยืนยัน ต้องแจ้งและเสนอช่วงใกล้เคียง
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmBooking from '../pages/ConfirmBooking.jsx'

const fullApi = {
  async createBooking() {
    return { status: 409, body: { alternatives: [
      { id: 11, slot_date: '2026-10-09', start_time: '08:00' },
      { id: 12, slot_date: '2026-10-09', start_time: '13:00' },
      { id: 13, slot_date: '2026-10-10', start_time: '09:00' },
    ] } }
  },
}

test('AC-BKG-03 ช่วงเวลาเต็ม แจ้งผู้ใช้และเสนอช่วงใกล้เคียง', async () => {
  render(<ConfirmBooking api={fullApi} slot={{ id: 1, slot_date: '2026-10-09', start_time: '09:00' }} />)
  fireEvent.click(screen.getByText('ยืนยันการจอง'))
  const alert = await screen.findByRole('alert')
  expect(alert.textContent).toContain('เต็ม')
  expect(screen.getAllByText('เลือกช่วงนี้').length).toBeGreaterThan(0)
})

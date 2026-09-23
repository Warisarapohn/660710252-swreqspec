import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import App from '../App.jsx'

// รองรับ: FR-BKG-01, FR-BKG-06

vi.mock('../api/client.js', async () => {
  const mockGetSlots = vi.fn()
    .mockResolvedValueOnce({
      slots: [
        { id: 'slot-1', slot_date: '2026-09-23', start_time: '09:00', remaining: 3 },
        { id: 'slot-2', slot_date: '2026-09-23', start_time: '10:00', remaining: 2 },
      ],
    })
    .mockResolvedValueOnce({
      slots: [
        { id: 'slot-3', slot_date: '2026-09-23', start_time: '11:00', remaining: 1 },
      ],
    })

  return {
    api: { getSlots: mockGetSlots },
  }
})

test('T-10: เปลี่ยนแพ็กเกจแล้วโหลดช่วงว่างใหม่ตาม API', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByText('เลือกแพ็กเกจและช่วงเวลา')).toBeTruthy()
  })

  await waitFor(() => {
    expect(screen.getByLabelText('เลือก 2026-09-23 09:00')).toBeTruthy()
  })

  fireEvent.change(screen.getByLabelText('แพ็กเกจ'), { target: { value: 'premium' } })

  await waitFor(() => {
    expect(screen.getByLabelText('เลือก 2026-09-23 11:00')).toBeTruthy()
  })
})

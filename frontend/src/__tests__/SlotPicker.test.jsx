// test ของ T-10 (FR-BKG-06): เปลี่ยนแพ็กเกจแล้วรายการช่วงเวลาเปลี่ยนตาม
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SlotPicker from '../pages/SlotPicker.jsx'

const fakeApi = {
  async getSlots({ packageCode }) {
    return packageCode === 'GEN'
      ? [{ id: 1, start_time: '09:00', remaining: 1 }]
      : [{ id: 2, start_time: '10:00', remaining: 3 }]
  },
}

test('FR-BKG-06 เปลี่ยนแพ็กเกจแล้วโหลดช่วงเวลาใหม่', async () => {
  render(<SlotPicker api={fakeApi} dateFrom="2026-10-09" onNext={() => {}} />)
  await screen.findByText('09:00 น.')
  fireEvent.change(screen.getByLabelText('แพ็กเกจ'), { target: { value: 'PRE' } })
  await waitFor(() => expect(screen.queryByText('10:00 น.')).toBeTruthy())
})

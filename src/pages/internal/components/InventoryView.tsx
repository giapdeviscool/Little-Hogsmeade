import { Card } from '../../../components/ui/Card'
import { cn } from '../../../utils/cn'

export function InventoryView() {
  return (
    <>
      <div className="flex justify-between">
        <div><p className="text-sm text-muted">Quản trị Nội bộ</p><h1 className="text-[34px] font-bold">Quản lý Tồn kho</h1></div>
        <div className="flex gap-2"><input className="rounded-[14px] border border-line px-4" placeholder="Tìm nguyên liệu..." /><button className="rounded-[14px] bg-coffee px-5 py-2.5 text-sm font-bold text-white">+ Nhập kho mới</button><button className="rounded-[14px] border border-line px-4">Kiểm kê định kỳ</button></div>
      </div>
      <section className="mt-6 grid grid-cols-3 gap-5">{['Tổng giá trị kho ₫428.6M', 'Nguyên liệu sắp hết 12', 'Số phiếu nhập tháng 84'].map((x) => <Card key={x} className="p-5"><span className="text-sm text-muted">{x.split(' ').slice(0, -1).join(' ')}</span><b className="block text-[28px]">{x.split(' ').at(-1)}</b></Card>)}</section>
      <Card className="mt-6 overflow-hidden p-6">
        <table className="w-full text-left text-sm">
          <thead><tr>{['Mã NVL', 'Tên nguyên liệu', 'Danh mục', 'Số lượng', 'Định mức', 'Trạng thái', 'Thao tác'].map((h) => <th key={h} className="border-b border-line px-4 py-3 text-xs uppercase text-muted">{h}</th>)}</tr></thead>
          <tbody>{['Hạt Cafe Arabica', 'Sữa tươi tiệt trùng', 'Rượu Rum', 'Bơ lạt Pháp'].map((x, i) => <tr key={x}><td className="border-b border-line px-4 py-4">NVL-00{i + 1}</td><td className="border-b border-line px-4 py-4 font-semibold">{x}</td><td className="border-b border-line px-4 py-4">Đồ pha chế</td><td className="border-b border-line px-4 py-4">{[42, 16, 9, 31][i]} kg</td><td className="border-b border-line px-4 py-4">12 kg</td><td className="border-b border-line px-4 py-4"><span className={cn('rounded-full px-3 py-1 text-xs font-bold', i === 0 || i === 3 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>{i === 0 || i === 3 ? 'An toàn' : 'Cần nhập gấp'}</span></td><td className="border-b border-line px-4 py-4">✎ ↺</td></tr>)}</tbody>
        </table>
      </Card>
    </>
  )
}

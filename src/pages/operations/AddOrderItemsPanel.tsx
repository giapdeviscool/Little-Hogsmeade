import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Check, ChevronLeft, CirclePlus, Loader2, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { env } from '../../config/env'
import { getAuthToken } from '../../store/auth.store'
import { Button } from '../../components/ui/button'

type MenuItem = { id: string; name: string; basePrice: number; imageUrl?: string | null; category?: { name?: string }; _count?: { menuItemToppingGroups?: number } }
type Topping = { id: string; name: string; extraPrice: number }
type ToppingGroup = { id: string; name: string; minSelect: number; maxSelect: number; isAssigned?: boolean; toppings: Topping[] }
type CartItem = { key: string; id: string; name: string; basePrice: number; quantity: number; toppings: Array<Topping & { quantity: number }> }
type ApiError = { message?: string; errors?: Array<{ message?: string }> }

type AddOrderItemsPanelProps = {
  isOpen: boolean
  orderId: string | number | null | undefined
  tableId?: string | number | null
  onBack: () => void
  onAdded: (createdOrderId?: string) => Promise<void> | void
}

function authHeaders() {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : undefined
}

function unwrapData<T>(payload: T | { data?: T }) {
  return (payload as { data?: T }).data ?? payload as T
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiError>(error)) return error.response?.data?.message || error.response?.data?.errors?.[0]?.message || fallback
  return fallback
}

function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')}₫`
}

export function AddOrderItemsPanel({ isOpen, orderId, tableId, onBack, onAdded }: AddOrderItemsPanelProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [configuringItem, setConfiguringItem] = useState<MenuItem | null>(null)
  const [toppingGroups, setToppingGroups] = useState<ToppingGroup[]>([])
  const [selectedToppingIds, setSelectedToppingIds] = useState<string[]>([])
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [isLoadingMenu, setIsLoadingMenu] = useState(false)
  const [isLoadingToppings, setIsLoadingToppings] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    let isCurrent = true
    const loadMenu = async () => {
      setIsLoadingMenu(true)
      setError('')
      try {
        const response = await axios.get(`${env.apiBaseUrl}/menu-items`, { headers: authHeaders(), params: { status: true, limit: 100 } })
        const payload = unwrapData(response.data) as { items?: MenuItem[] }
        if (isCurrent) setMenuItems(payload.items ?? [])
      } catch (requestError) {
        if (isCurrent) setError(getErrorMessage(requestError, 'Không thể tải thực đơn.'))
      } finally {
        if (isCurrent) setIsLoadingMenu(false)
      }
    }
    void loadMenu()
    return () => { isCurrent = false }
  }, [isOpen])

  const addToCart = (item: MenuItem, toppings: Array<Topping & { quantity: number }> = []) => {
    const key = `${item.id}:${toppings.map((topping) => topping.id).sort().join(',')}`
    setCartItems((current) => {
      const existing = current.find((cartItem) => cartItem.key === key)
      if (!existing) return [...current, { key, id: item.id, name: item.name, basePrice: item.basePrice, quantity: 1, toppings }]
      return current.map((cartItem) => cartItem.key === key ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem)
    })
  }

  const selectMenuItem = async (item: MenuItem) => {
    setError('')
    if (!item._count?.menuItemToppingGroups) {
      addToCart(item)
      return
    }
    setIsLoadingToppings(true)
    try {
      const assignmentResponse = await axios.get(`${env.apiBaseUrl}/menu-items/${item.id}/topping-groups`, { headers: authHeaders() })
      const assignments = unwrapData(assignmentResponse.data) as Array<Omit<ToppingGroup, 'toppings'>>
      const activeAssignments = assignments.filter((group) => group.isAssigned)
      if (activeAssignments.length === 0) {
        addToCart(item)
        return
      }

      const groupsResponse = await axios.get(`${env.apiBaseUrl}/topping-groups`, { headers: authHeaders() })
      const allGroups = unwrapData(groupsResponse.data) as ToppingGroup[]
      const groups = activeAssignments.flatMap((assignment) => {
        const group = allGroups.find((candidate) => candidate.id === assignment.id)
        return group ? [{ ...group, minSelect: assignment.minSelect, maxSelect: assignment.maxSelect, toppings: group.toppings ?? [] }] : []
      })
      setConfiguringItem(item)
      setToppingGroups(groups)
      setSelectedToppingIds([])
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể tải lựa chọn topping cho món này.'))
    } finally {
      setIsLoadingToppings(false)
    }
  }

  const toggleTopping = (toppingId: string, group: ToppingGroup) => {
    setSelectedToppingIds((current) => {
      if (current.includes(toppingId)) return current.filter((id) => id !== toppingId)
      const selectedInGroup = group.toppings.filter((topping) => current.includes(topping.id)).length
      if (selectedInGroup >= group.maxSelect) return current
      return [...current, toppingId]
    })
  }

  const confirmToppings = () => {
    if (!configuringItem) return
    const invalidGroup = toppingGroups.find((group) => {
      const count = group.toppings.filter((topping) => selectedToppingIds.includes(topping.id)).length
      return count < group.minSelect || count > group.maxSelect
    })
    if (invalidGroup) {
      setError(`Nhóm “${invalidGroup.name}” cần chọn từ ${invalidGroup.minSelect} đến ${invalidGroup.maxSelect} lựa chọn.`)
      return
    }
    const selected = toppingGroups.flatMap((group) => group.toppings.filter((topping) => selectedToppingIds.includes(topping.id)).map((topping) => ({ ...topping, quantity: 1 })))
    addToCart(configuringItem, selected)
    setConfiguringItem(null)
    setToppingGroups([])
    setSelectedToppingIds([])
    setError('')
  }

  const updateQuantity = (key: string, increment: number) => {
    setCartItems((current) => current.flatMap((item) => {
      if (item.key !== key) return [item]
      const quantity = item.quantity + increment
      return quantity > 0 ? [{ ...item, quantity }] : []
    }))
  }

  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.basePrice * item.quantity + item.toppings.reduce((toppingSum, topping) => toppingSum + topping.extraPrice * topping.quantity * item.quantity, 0), 0), [cartItems])

  const submit = async () => {
    if (cartItems.length === 0) return setError('Vui lòng chọn ít nhất một món.')
    if (!orderId && !tableId) return setError('Không xác định được bàn để tạo hóa đơn.')
    setError('')
    setIsSubmitting(true)
    try {
      const items = cartItems.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
        unitPrice: item.basePrice,
        subtotal: item.basePrice * item.quantity,
        toppings: item.toppings.map((topping) => ({ toppingId: topping.id, quantity: topping.quantity, extraPrice: topping.extraPrice })),
      }))
      if (orderId) {
        await axios.post(`${env.apiBaseUrl}/orders/${orderId}/items`, { items }, { headers: authHeaders() })
        await onAdded()
      } else {
        const response = await axios.post<{ data?: { order?: { id?: string } } }>(`${env.apiBaseUrl}/orders`, {
          tableId,
          orderType: 'dine-in',
          status: 'pending',
          paymentMethod: 'cash',
          customerPhone: customerPhone ? customerPhone.trim() : undefined,
          customerName: customerName ? customerName.trim() : undefined,
          items,
        }, { headers: authHeaders() })
        await onAdded(response.data.data?.order?.id)
      }
      setCartItems([])
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể thêm món vào hóa đơn.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFirstOrder = !orderId
  return <section className="space-y-4"><div className="flex items-center justify-between"><div><h3 className="text-lg font-bold">{isFirstOrder ? 'Gọi món cho bàn' : 'Gọi thêm món'}</h3><p className="text-sm text-muted">{isFirstOrder ? 'Chọn món đầu tiên để mở hóa đơn phục vụ.' : 'Chọn món để bổ sung vào hóa đơn hiện tại.'}</p></div><Button type="button" variant="ghost" onClick={onBack} className="h-9 rounded-xl text-muted"><ChevronLeft className="size-4" /> Quay lại</Button></div>{error && <p role="alert" className="rounded-xl border border-[#c25a5a]/20 bg-red-50 px-4 py-3 text-sm font-semibold text-[#c25a5a]">{error}</p>}{configuringItem ? <section className="rounded-2xl border border-line bg-cream p-4"><div className="flex items-center justify-between gap-3"><div><h4 className="font-bold">Topping cho {configuringItem.name}</h4><p className="text-sm text-muted">Chọn theo từng nhóm tùy chọn.</p></div><Button type="button" variant="ghost" size="icon" onClick={() => { setConfiguringItem(null); setError('') }}><X className="size-4" /></Button></div><div className="mt-4 space-y-4">{toppingGroups.map((group) => <fieldset key={group.id}><legend className="text-sm font-bold">{group.name} <span className="font-normal text-muted">({group.minSelect}-{group.maxSelect} lựa chọn)</span></legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{group.toppings.map((topping) => <label key={topping.id} className="flex cursor-pointer items-center justify-between rounded-xl border border-line bg-white px-3 py-2 text-sm"><span className="flex items-center gap-2"><input type="checkbox" checked={selectedToppingIds.includes(topping.id)} onChange={() => toggleTopping(topping.id, group)} className="size-4 accent-coffee" />{topping.name}</span><strong className="text-xs text-latte">+{formatCurrency(topping.extraPrice)}</strong></label>)}</div></fieldset>)}</div><Button type="button" onClick={confirmToppings} className="mt-5 h-10 w-full rounded-xl bg-coffee text-white hover:bg-[#3f2d20]"><Check className="size-4" /> Thêm vào giỏ</Button></section> : <><div className="grid max-h-56 grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">{isLoadingMenu ? Array.from({ length: 6 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-xl bg-beige" />) : menuItems.map((item) => <button type="button" key={item.id} disabled={isLoadingToppings} onClick={() => void selectMenuItem(item)} className="rounded-xl border border-line bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-latte disabled:opacity-60"><span className="line-clamp-2 block min-h-10 text-sm font-bold">{item.name}</span><span className="mt-2 block text-sm font-semibold text-latte">{formatCurrency(item.basePrice)}</span>{item.category?.name && <span className="mt-1 block text-xs text-muted">{item.category.name}</span>}</button>)}</div>{!isLoadingMenu && menuItems.length === 0 && <p className="rounded-xl bg-cream px-4 py-5 text-center text-sm text-muted">Chưa có món đang hoạt động.</p>}{isFirstOrder && <div className="rounded-2xl border border-line bg-cream/30 p-3.5 space-y-3"><div className="space-y-1"><label htmlFor="customerPhone" className="block text-xs font-bold text-coffee uppercase tracking-wider">Số điện thoại khách hàng (tùy chọn)</label><input id="customerPhone" type="tel" placeholder="Nhập số điện thoại để tích điểm..." value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full h-10 px-3.5 rounded-xl border border-line bg-white focus:outline-none focus:border-latte text-sm" /></div>{customerPhone.trim() && <div className="space-y-1"><label htmlFor="customerName" className="block text-xs font-bold text-coffee uppercase tracking-wider">Họ và tên khách hàng (tùy chọn)</label><input id="customerName" type="text" placeholder="Nhập tên khách hàng..." value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full h-10 px-3.5 rounded-xl border border-line bg-white focus:outline-none focus:border-latte text-sm" /></div>}</div>}<section className="rounded-2xl border border-line bg-white"><div className="flex items-center justify-between border-b border-line px-4 py-3"><span className="flex items-center gap-2 font-bold"><ShoppingBag className="size-4 text-latte" /> Giỏ gọi thêm</span><span className="text-sm text-muted">{cartItems.length} dòng món</span></div><div className="max-h-40 divide-y divide-line overflow-y-auto">{cartItems.length ? cartItems.map((item) => <div key={item.key} className="flex items-center gap-3 px-4 py-3"><div className="min-w-0 flex-1"><strong className="block truncate text-sm">{item.name}</strong>{item.toppings.length > 0 && <span className="block truncate text-xs text-muted">{item.toppings.map((topping) => topping.name).join(', ')}</span>}<span className="text-xs text-latte">{formatCurrency(item.basePrice)}</span></div><div className="flex items-center gap-1"><button type="button" aria-label="Giảm số lượng" onClick={() => updateQuantity(item.key, -1)} className="grid size-7 place-items-center rounded-lg border border-line"><Minus className="size-3" /></button><span className="w-6 text-center text-sm font-bold">{item.quantity}</span><button type="button" aria-label="Tăng số lượng" onClick={() => updateQuantity(item.key, 1)} className="grid size-7 place-items-center rounded-lg border border-line"><Plus className="size-3" /></button></div><strong className="text-sm">{formatCurrency((item.basePrice + item.toppings.reduce((sum, topping) => sum + topping.extraPrice * topping.quantity, 0)) * item.quantity)}</strong></div>) : <p className="px-4 py-5 text-center text-sm text-muted">Chưa chọn món nào.</p>}</div><div className="flex items-center justify-between bg-cream px-4 py-3"><span className="font-semibold">Tạm tính</span><strong className="text-lg">{formatCurrency(cartTotal)}</strong></div></section><Button type="button" disabled={isSubmitting || cartItems.length === 0} onClick={() => void submit()} className="h-11 w-full rounded-xl bg-coffee text-white hover:bg-[#3f2d20]">{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <CirclePlus className="size-4" />}{isSubmitting ? 'Đang gọi món...' : isFirstOrder ? 'Tạo hóa đơn & gọi món' : 'Xác nhận gọi thêm'}</Button></>}</section>
}

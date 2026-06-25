import defaultHeroImage from '../../assets/image/default.jpg'
import type { ContactBlock, OpeningHoursBlock, FeaturedMenuBlock, BookingDraft } from './landing.types'

export const defaultHero = {
  title: 'Little Hogsmeade',
  subtitle: 'Nơi cà phê, ẩm thực và quầy bar hòa thành một trải nghiệm ấm cúng.',
  image: `${defaultHeroImage}?auto=format&fit=crop&w=1800&q=90`,
}

export const fallbackContact: ContactBlock = {
  phone: '1900 6868',
  email: 'hello@littlehogsmeade.vn',
  address: '12 Đồng Khởi, Quận 1, TP.HCM',
  mapLink: 'https://maps.google.com',
  socials: ['Instagram', 'Facebook', 'TikTok'],
}

export const fallbackHours: OpeningHoursBlock = {
  title: 'Giờ mở cửa',
  description: 'Áp dụng cho toàn hệ thống',
  hours: [
    { day: 'Thứ 2 - Thứ 6', hours: '07:00 - 23:00', isClosed: false },
    { day: 'Thứ 7', hours: '08:00 - 23:30', isClosed: false },
    { day: 'Chủ nhật', hours: '08:00 - 22:00', isClosed: false },
  ],
}

export const fallbackMenu: FeaturedMenuBlock = {
  title: 'Món nổi bật',
  description: 'Món chủ lực xuất hiện ở Landing Page',
  items: [
    {
      name: 'Cappuccino Đặc Biệt',
      description: 'Espresso đậm đà, foam sữa mịn.',
      price: 65000,
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=85',
      badge: 'Best seller',
    },
    {
      name: 'Mì Ý Sốt Truffle',
      description: 'Mì sợi tươi áo sốt nấm truffle đen.',
      price: 185000,
      imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=85',
      badge: 'Featured',
    },
    {
      name: 'Vang Đỏ Old Vine',
      description: 'Hương trái cây chín, hợp bữa tối ấm cúng.',
      price: 220000,
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=85',
      badge: 'Wine',
    },
  ],
}

export const fallbackBooking: BookingDraft = {
  branchId: '',
  name: '',
  phone: '',
  guests: '4',
  datetime: '',
  note: '',
}

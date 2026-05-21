export type AuthUser = {
  id: string
  name: string
  role: 'Chain Owner' | 'Branch Manager' | 'Cashier'
}

export const demoUser: AuthUser = {
  id: 'usr_demo_admin',
  name: 'Anha Nguyễn',
  role: 'Chain Owner',
}

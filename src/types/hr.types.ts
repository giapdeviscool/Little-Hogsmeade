export interface AssignRolePayload {
  roleId: string
}

export interface Shift {
  id: string
  branchId: string
  name: string
  startTime: string
  endTime: string
  status: 'active' | 'inactive'
  branch?: { id: string; name: string }
}

export interface CreateShiftPayload {
  name: string
  branchId: string
  startTime: string
  endTime: string
}

export interface UpdateShiftPayload {
  name?: string
  startTime?: string
  endTime?: string
}

export interface RosterEntry {
  id: string
  branchId: string
  employeeId: string
  shiftId: string
  date: string
  status: 'scheduled' | 'completed' | 'cancelled'
  createdAt: string
  employee?: { id: string; fullName: string; status: string }
  shift?: { id: string; name: string; startTime: string; endTime: string }
  branch?: { id: string; name: string }
}

export interface CreateRosterPayload {
  employeeId: string
  shiftId: string
  date: string
  branchId?: string
}

export interface BulkRosterPayload {
  entries: CreateRosterPayload[]
}

export interface BulkRosterResult {
  created: RosterEntry[]
  errors: Array<{ index: number; entry: CreateRosterPayload; error: string }>
}

export interface AttendanceCheckPayload {
  pin: string
  branchId: string
}

export interface AttendanceResult {
  timesheet: {
    id: string
    employeeId: string
    date: string
    checkIn: string | null
    checkOut: string | null
    employee?: { id: string; fullName: string }
  }
  employeeName: string
  action: 'CHECK_IN' | 'CHECK_OUT'
  timestamp: string
}

export interface TimesheetRecord {
  id: string
  employeeId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  note: string | null
  employee?: { id: string; fullName: string; branchId: string }
  shift?: { id: string; name: string }
}

export interface PayrollSummary {
  employeeId: string
  employeeName: string
  branchId: string
  branchName: string | null
  roleName: string | null
  baseSalary: number
  totalWorkedHours: number
  totalDays: number
  hourlyRate: number
  estimatedSalary: number
  lateArrivals: number
  autoClosedSessions: number
  dailyDetails: Array<{
    date: string
    checkIn: string | null
    checkOut: string | null
    workedHours: number
    shiftName: string | null
    note: string | null
  }>
}

export interface PayrollParams {
  month?: string
  branchId?: string
  employeeId?: string
}

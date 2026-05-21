export type KpiMock = readonly [
  label: string,
  value: string,
  delta: string,
  isPositive: boolean,
]

export type BranchPerformanceMock = readonly [
  branchName: string,
  percent: number,
]

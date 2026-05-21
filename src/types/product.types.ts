export type ProductStatus = 'soldout' | undefined

export type ProductMock = readonly [
  name: string,
  price: string,
  imageUrl: string,
  status?: ProductStatus,
]

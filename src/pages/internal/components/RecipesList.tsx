import { useState, useEffect } from 'react'
import { Card } from '../../../components/ui/Card'
import { getRecipes } from '../../../api/recipe.api'
import type { Recipe } from '../../../types'

export function RecipesList() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchRecipes = async () => {
    try {
      setLoading(true)
      const res = await getRecipes({ search })
      setRecipes(res.data.items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecipes()
  }, [search])

  return (
    <Card className="flex h-full flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">Danh sách công thức (BOM)</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Tìm theo món ăn..."
            className="rounded-lg border border-line px-4 py-2 w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-line text-sm text-muted">
              <th className="pb-3 pr-4 font-medium">Món ăn</th>
              <th className="pb-3 pr-4 font-medium">Biến thể</th>
              <th className="pb-3 pr-4 font-medium">Nguyên liệu</th>
              <th className="pb-3 pr-4 font-medium">Lượng tiêu hao</th>
              <th className="pb-3 pr-4 font-medium">Đơn vị</th>
              <th className="pb-3 pr-4 font-medium text-right">Tồn kho hiện tại</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted">Đang tải...</td>
              </tr>
            ) : recipes.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted">Không tìm thấy công thức nào</td>
              </tr>
            ) : (
              recipes.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-4 pr-4 font-medium">{r.menuItemName}</td>
                  <td className="py-4 pr-4 text-muted">{r.variantName || '-'}</td>
                  <td className="py-4 pr-4">
                    <span className={r.isIngredientActive ? '' : 'text-red-500 line-through'} title={!r.isIngredientActive ? 'Nguyên liệu đã ngưng sử dụng' : ''}>
                      {r.ingredientName}
                    </span>
                  </td>
                  <td className="py-4 pr-4">{r.quantityRequired}</td>
                  <td className="py-4 pr-4">{r.unit}</td>
                  <td className="py-4 pr-4 text-right">
                    {r.currentStock !== undefined ? `${r.currentStock} ${r.unit}` : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

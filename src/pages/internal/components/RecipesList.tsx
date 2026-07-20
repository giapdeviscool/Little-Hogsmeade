import { useState, useEffect, useMemo } from 'react'
import { Card } from '../../../components/ui/Card'
import { getRecipes } from '../../../api/recipe.api'
import type { Recipe, Branch } from '../../../types'
import { X } from 'lucide-react'
import { getAuthSession } from '../../../store/auth.store'
import { getBranches } from '../../../api/employee.api'

interface GroupedRecipe {
  fullName: string
  ingredients: Recipe[]
  isAvailable: boolean
}

function RecipeDetailModal({ data, onClose }: { data: GroupedRecipe | null, onClose: () => void }) {
  if (!data) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-coffee">Chi tiết công thức</h2>
            <p className="text-sm text-muted mt-1">Món ăn: <span className="font-semibold text-foreground">{data.fullName}</span></p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-muted transition hover:bg-beige">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-alt font-medium text-muted text-sm">
              <tr>
                <th className="px-4 py-3">Nguyên liệu</th>
                <th className="px-4 py-3 text-right">Lượng tiêu hao</th>
                <th className="px-4 py-3">Đơn vị</th>
                <th className="px-4 py-3 text-right">Tồn kho hiện tại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              {data.ingredients.map((ing, idx) => {
                const isShort = (ing.currentStock || 0) < ing.quantityRequired
                return (
                  <tr key={idx} className={isShort ? "bg-red-50/50" : ""}>
                    <td className="px-4 py-3 font-medium">
                      <span className={ing.isIngredientActive ? '' : 'text-red-500 line-through'}>
                        {ing.ingredientName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{ing.quantityRequired}</td>
                    <td className="px-4 py-3">{ing.unit}</td>
                    <td className={`px-4 py-3 text-right font-bold ${isShort ? 'text-red-600' : 'text-green-600'}`}>
                      {ing.currentStock !== undefined ? `${ing.currentStock} ${ing.unit}` : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function RecipesList() {
  const authSession = getAuthSession()
  const isChainOwner = authSession?.user?.roleName?.toLowerCase().includes('owner') || authSession?.user?.role?.toLowerCase().includes('owner')
  const userBranchId = authSession?.user?.branchId || ''

  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<GroupedRecipe | null>(null)
  
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState(isChainOwner ? '' : userBranchId)

  useEffect(() => {
    async function loadBranches() {
      try {
        const res = await getBranches()
        const items = Array.isArray(res.data) ? res.data : (res.data as any)?.items || []
        setBranches(items)
      } catch (err) {
        console.error(err)
      }
    }
    loadBranches()
  }, [])

  const fetchRecipes = async () => {
    try {
      setLoading(true)
      const res = await getRecipes({ search, branchId: selectedBranch })
      setRecipes(res.data.items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecipes()
  }, [search, selectedBranch])

  const groupedRecipes = useMemo(() => {
    const map = recipes.reduce((acc, r) => {
      const key = r.variantName ? `${r.menuItemName} (${r.variantName})` : r.menuItemName
      if (!acc[key]) {
        acc[key] = {
          fullName: key,
          ingredients: [],
          isAvailable: true
        }
      }
      acc[key].ingredients.push(r)
      if ((r.currentStock || 0) < r.quantityRequired) {
        acc[key].isAvailable = false
      }
      return acc
    }, {} as Record<string, GroupedRecipe>)
    return Object.values(map)
  }, [recipes])

  return (
    <Card className="flex h-full flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">Danh sách công thức (BOM)</h2>
        <div className="flex gap-4">
          {isChainOwner && (
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="rounded-lg border border-line px-4 bg-white outline-none text-sm font-semibold h-[42px]"
            >
              <option value="">Tất cả chi nhánh</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
          <input
            type="text"
            placeholder="Tìm theo món ăn..."
            className="rounded-lg border border-line px-4 py-2 w-64 h-[42px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-line text-sm text-muted">
              <th className="pb-3 pr-4 font-medium pl-4">Món ăn</th>
              <th className="pb-3 pr-4 font-medium text-center">Số nguyên liệu</th>
              <th className="pb-3 pr-4 font-medium text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-sm">
            {loading ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-muted">Đang tải...</td>
              </tr>
            ) : groupedRecipes.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-muted">Không tìm thấy công thức nào</td>
              </tr>
            ) : (
              groupedRecipes.map((g, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 pr-4 pl-4 font-medium">
                    <button 
                      onClick={() => setSelectedGroup(g)}
                      className="text-coffee hover:underline font-semibold text-left"
                    >
                      {g.fullName}
                    </button>
                  </td>
                  <td className="py-4 pr-4 text-center">{g.ingredients.length}</td>
                  <td className="py-4 pr-4 text-center">
                    {g.isAvailable ? (
                      <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium text-xs">Khả dụng</span>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium text-xs">Thiếu nguyên liệu</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <RecipeDetailModal data={selectedGroup} onClose={() => setSelectedGroup(null)} />
    </Card>
  )
}

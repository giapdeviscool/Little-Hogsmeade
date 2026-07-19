import { useEffect, useState, useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getPublicMenu,
  getPublicBranchMenu,
  getBranchesPublic,
  type PublicCategory,
  type PublicMenuItem,
  type PublicMenuResponse,
} from "../../../api/public-menu.api"
import { MenuCategorySection } from "../../../components/menu/MenuCategorySection"
import type { Branch } from "../../../types"

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; categories: PublicCategory[]; menuItems: PublicMenuItem[] }

export function PublicMenuSection({ topSellingMenu = [] }: { topSellingMenu?: any[] }) {
  const [activeTab, setActiveTab] = useState<"global" | string>("global")
  const [branches, setBranches] = useState<Branch[]>([])
  const [state, setState] = useState<State>({ status: "loading" })

  const topSellingIds = useMemo(() => new Set(topSellingMenu.map((m: any) => m.menuItemId || m.id)), [topSellingMenu])

  useEffect(() => {
    let active = true
    getBranchesPublic()
      .then((res) => {
        if (!active) return
        const body = (res as any).data ?? res
        const items: Branch[] = body?.items ?? []
        setBranches(items)
      })
      .catch(() => {
        // silently fail — branches tabs are a progressive enhancement
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    setState({ status: "loading" })

    if (activeTab === "global") {
      getPublicMenu()
        .then((res) => {
          if (!active) return
          const { categories = [], menuItems = [] } = res.data as PublicMenuResponse
          setState({ status: "loaded", categories, menuItems })
        })
        .catch(() => {
          if (!active) return
          setState({
            status: "error",
            message: "Không thể tải thực đơn lúc này, vui lòng thử lại sau.",
          })
        })
    } else {
      getPublicBranchMenu(activeTab)
        .then((res) => {
          if (!active) return
          const { categories = [], menuItems = [] } = res.data as PublicMenuResponse
          setState({ status: "loaded", categories, menuItems })
        })
        .catch(() => {
          if (!active) return
          setState({
            status: "error",
            message: "Không thể tải thực đơn lúc này, vui lòng thử lại sau.",
          })
        })
    }

    return () => {
      active = false
    }
  }, [activeTab])

  const categoriesWithItems = useMemo(() => {
    if (state.status !== "loaded") return []
    return state.categories
      .map((cat) => ({
        category: cat,
        items: state.menuItems.filter((i) => i.categoryId === cat.id),
      }))
      .filter((group) => group.items.length > 0)
  }, [state])

  const renderContent = () => {
    if (state.status === "loading") {
      return (
        <div className="flex-1 space-y-16 lg:pb-32 w-full">
           <div className="mb-8">
             <Skeleton className="h-8 w-48 bg-beige" />
           </div>
           <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
             {Array.from({ length: 6 }).map((_, i) => (
               <div key={i} className="flex flex-col gap-3">
                 <Skeleton className="aspect-[4/3] w-full rounded-[22px] bg-beige" />
                 <Skeleton className="h-5 w-2/3 bg-beige" />
                 <Skeleton className="h-4 w-1/3 bg-beige" />
               </div>
             ))}
           </div>
        </div>
      )
    }

    if (state.status === "error") {
      return (
        <div className="flex-1">
          <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 py-16 text-center text-red-800">
            <p className="text-base font-semibold">{state.message}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-sm font-medium underline">
              Tải lại
            </button>
          </div>
        </div>
      )
    }

    if (categoriesWithItems.length === 0) {
      return (
        <div className="flex-1">
          <div className="rounded-2xl border border-dashed border-line bg-cream py-16 text-center">
            <p className="text-base font-semibold text-coffee">Thực đơn đang được cập nhật</p>
            <p className="mt-1 text-sm text-muted">Vui lòng quay lại sau.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="flex-1 space-y-16 lg:pb-32">
        {categoriesWithItems.map(({ category, items }) => (
          <MenuCategorySection key={category.id} category={category} items={items} topSellingIds={topSellingIds} />
        ))}
      </div>
    )
  }

  return (
    <section className="py-16 md:py-20" id="full-menu">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-8">
        {/* Top header: Title only */}
        <div className="mb-4 lg:mb-8 border-b border-line pb-6">
          <div className="text-center lg:text-left shrink-0">
            <h1 className="text-3xl md:text-[40px] font-bold tracking-tight text-coffee leading-none">Thực đơn</h1>
            <p className="text-muted mt-3 text-sm md:text-base">Khám phá các món ăn và thức uống tuyệt hảo của chúng tôi.</p>
          </div>
        </div>

        {/* Main layout with two sidebars on desktop */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 relative items-start">
          
          {/* Branch Filter Sidebar (Far Left) */}
          <div className="w-full lg:w-[180px] xl:w-[200px] shrink-0 sticky top-[72px] lg:top-24 z-50 lg:z-40 bg-white/95 backdrop-blur lg:bg-transparent lg:backdrop-blur-none pt-4 lg:pt-0 -mt-4 lg:mt-0">
            <h3 className="hidden lg:block text-lg font-bold text-coffee mb-4">Chi nhánh</h3>
            <div className="flex lg:flex-col gap-2 overflow-x-auto scrollbar-none pb-3 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
              <button
                onClick={() => setActiveTab("global")}
                className={`shrink-0 rounded-full lg:rounded-xl border px-4 py-2 lg:py-2.5 text-sm font-bold transition-all lg:w-full lg:text-left ${
                  activeTab === "global"
                    ? "border-coffee bg-coffee text-white shadow-md lg:shadow-none"
                    : "border-line bg-white text-muted hover:border-coffee hover:text-coffee"
                }`}
              >
                Thực đơn chung
              </button>
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => setActiveTab(branch.id)}
                  className={`shrink-0 rounded-full lg:rounded-xl border px-4 py-2 lg:py-2.5 text-sm font-bold transition-all lg:w-full lg:text-left ${
                    activeTab === branch.id
                      ? "border-coffee bg-coffee text-white shadow-md lg:shadow-none"
                      : "border-line bg-white text-muted hover:border-coffee hover:text-coffee"
                  }`}
                >
                  {branch.name}
                </button>
              ))}
            </div>
          </div>

        {/* Category nav */}
        <div className="sticky top-[136px] z-40 -mx-4 mb-10 overflow-x-auto bg-white/95 px-4 backdrop-blur md:-mx-8 md:px-8 lg:-mx-14 lg:px-14">
          <div className="flex gap-2 border-b border-line py-3">
            {categoriesWithItems.map(({ category }) => (
              <a
                key={category.id}
                href={`#cat-${category.id}`}
                className="shrink-0 rounded-full border border-line px-4 py-1.5 text-sm font-medium text-muted transition-colors hover:border-coffee hover:text-coffee"
              >
                {category.name}
              </a>
            ))}
          </div>
        </div>

          {/* Content */}
          {renderContent()}
        </div>
      </div>
    </section>
  )
}

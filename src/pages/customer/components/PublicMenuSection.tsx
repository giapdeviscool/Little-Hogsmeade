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

export function PublicMenuSection() {
  const [activeTab, setActiveTab] = useState<"global" | string>("global")
  const [branches, setBranches] = useState<Branch[]>([])
  const [state, setState] = useState<State>({ status: "loading" })

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

  if (state.status === "loading") {
    return (
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8 lg:px-14">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 bg-beige" />
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-[22px] border border-line">
                <Skeleton className="aspect-[4/3] w-full bg-beige" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4 bg-beige" />
                  <Skeleton className="h-4 w-1/3 bg-beige" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (state.status === "error") {
    return (
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8 lg:px-14">
          <div className="rounded-2xl border border-dashed border-line bg-cream py-16 text-center">
            <p className="text-base font-semibold text-coffee">{state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex h-10 items-center rounded-lg bg-coffee px-5 text-sm font-semibold text-white transition-colors hover:bg-coffee/90"
            >
              Tải lại
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (categoriesWithItems.length === 0) {
    return (
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8 lg:px-14">
          <div className="rounded-2xl border border-dashed border-line bg-cream py-16 text-center">
            <p className="text-base font-semibold text-coffee">Thực đơn đang được cập nhật</p>
            <p className="mt-1 text-sm text-muted">Vui lòng quay lại sau.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-20" id="full-menu">
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 lg:px-14">
        {/* Branch tabs */}
        <div className="sticky top-20 z-50 -mx-4 mb-6 bg-white/95 px-4 backdrop-blur md:-mx-8 md:px-8 lg:-mx-14 lg:px-14">
          <div className="flex gap-2 border-b border-line py-3 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("global")}
              className={`shrink-0 rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
                activeTab === "global"
                  ? "border-coffee bg-coffee text-white"
                  : "border-line bg-white text-muted hover:border-coffee hover:text-coffee"
              }`}
            >
              Thực đơn chung
            </button>
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => setActiveTab(branch.id)}
                className={`shrink-0 rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
                  activeTab === branch.id
                    ? "border-coffee bg-coffee text-white"
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
                {category.icon && <span className="mr-1">{category.icon}</span>}
                {category.name}
              </a>
            ))}
          </div>
        </div>

        {/* Category sections */}
        <div className="space-y-16">
          {categoriesWithItems.map(({ category, items }) => (
            <MenuCategorySection key={category.id} category={category} items={items} />
          ))}
        </div>
      </div>
    </section>
  )
}

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusBadge } from "./OwnerFields";
import { Eye, MapPin, Phone, Navigation, Pencil, Power, PowerOff, Store } from "lucide-react";
import type { Branch } from "../../../types";

export function BranchCard({
  branch,
  onView,
  onEdit,
  onToggle,
}: {
  branch: Branch;
  onView: () => void;
  onEdit: () => void;
  onToggle: () => void;
}) {
  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-xl border border-line bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-hover"
      onClick={onView}
    >
      {/* Cover Image */}
      <div className="relative h-40 overflow-hidden">
        {branch.imageUrl ? (
          <img
            src={branch.imageUrl}
            alt={branch.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-coffee/80 to-latte/60">
            <Store className="h-10 w-10 text-white/70" />
          </div>
        )}
        {/* Gradient overlay bottom */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Branch name on overlay */}
        <h3 className="absolute bottom-3 left-4 right-14 text-base font-semibold text-white drop-shadow-sm line-clamp-1">
          {branch.name}
        </h3>

        {/* Actions — visible on hover */}
        <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-coffee shadow-sm backdrop-blur-sm transition-colors hover:bg-beige"
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
              >
                <Eye className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Xem chi tiết</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-coffee shadow-sm backdrop-blur-sm transition-colors hover:bg-beige"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Pencil className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chỉnh sửa chi nhánh</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 shadow-sm backdrop-blur-sm transition-colors ${
                  branch.status === "active"
                    ? "text-red-700 hover:bg-red-50"
                    : "text-green-700 hover:bg-green-50"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
              >
                {branch.status === "active" ? (
                  <PowerOff className="h-4 w-4" />
                ) : (
                  <Power className="h-4 w-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {branch.status === "active"
                  ? "Vô hiệu hóa chi nhánh"
                  : "Kích hoạt chi nhánh"}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Info Section */}
      <div className="space-y-2.5 p-4">
        {/* Status row */}
        <div className="flex items-center justify-between">
          <StatusBadge status={branch.status} />
          {branch.email && (
            <span className="truncate text-xs text-muted">{branch.email}</span>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-line/50" />

        {/* Info lines */}
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2 text-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-latte" />
            <span className="line-clamp-2 leading-tight">{branch.address}</span>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <Phone className="h-4 w-4 shrink-0 text-latte" />
            <span>{branch.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <Navigation className="h-4 w-4 shrink-0 text-latte" />
            <span className="text-xs">
              {branch.lat.toFixed(4)}, {branch.lng.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

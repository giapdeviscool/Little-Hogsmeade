import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadowUrl from "leaflet/dist/images/marker-shadow.png";
import { StatusBadge, DetailRow } from "./OwnerFields";
import { isoToTime } from "../../../utils/owner.utils";
import type { Branch } from "../../../types";

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export function BranchDetailDialog({
  isOpen,
  onClose,
  branch,
}: {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
}) {
  if (!branch) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[85vh] max-h-[900px] w-[95vw] max-w-[1100px] flex-col overflow-hidden p-0 sm:max-w-[1100px]">
        <DialogHeader className="shrink-0 border-b border-line px-6 py-4">
          <DialogTitle className="text-lg font-semibold text-coffee">
            {branch.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
          {/* Left column: details */}
          <div className="min-h-0 overflow-y-auto px-6 py-5">
            <div className="space-y-2">
              {branch.imageUrl && (
                <div className="mb-2 overflow-hidden rounded-lg border border-line">
                  <img src={branch.imageUrl} alt={branch.name} className="h-40 w-full object-cover" />
                </div>
              )}
              <DetailRow label="Địa chỉ" value={branch.address} />
              <DetailRow label="Số điện thoại" value={branch.phone} />
              {branch.email ? (
                <DetailRow label="Email" value={branch.email} />
              ) : null}
              <DetailRow
                label="Giờ hoạt động"
                value={`${isoToTime(branch.openTime)} - ${isoToTime(branch.closeTime)}`}
              />
              <DetailRow label="Trạng thái" value={<StatusBadge status={branch.status} />} />
              <DetailRow
                label="Tọa độ"
                value={`${branch.lat.toFixed(4)}, ${branch.lng.toFixed(4)}`}
              />
            </div>
          </div>

          {/* Right column: map, full height */}
          <div className="min-h-0 border-t border-line md:border-l md:border-t-0">
            <div className="h-64 w-full md:h-full">
              <MapContainer
                center={[branch.lat || 10.7769, branch.lng || 106.7009]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
                key={`${branch.lat}-${branch.lng}`}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {branch.lat && branch.lng ? (
                  <Marker position={[branch.lat, branch.lng]} />
                ) : null}
              </MapContainer>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-end border-t border-line px-6 py-4">
          <button
            className="h-9 rounded-lg px-4 text-sm font-semibold text-muted transition-colors hover:bg-beige"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
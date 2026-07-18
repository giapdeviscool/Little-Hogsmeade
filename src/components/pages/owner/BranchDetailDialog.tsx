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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-coffee">
            {branch.name}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-2">
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
            label="Tự sửa giá"
            value={branch.allowLocalPricingOverride ? "Có" : "Không"}
          />
          <DetailRow
            label="Tọa độ"
            value={`${branch.lat.toFixed(4)}, ${branch.lng.toFixed(4)}`}
          />

          <div className="h-48 w-full overflow-hidden rounded-lg border border-line mt-4">
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

          <div className="flex justify-end pt-4">
            <button
              className="h-9 rounded-lg px-4 text-sm font-semibold text-muted transition-colors hover:bg-beige"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

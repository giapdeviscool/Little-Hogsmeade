import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadowUrl from "leaflet/dist/images/marker-shadow.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NumberField, TextField, TimeField } from "./OwnerFields";
import { isoToTime, timeToIso } from "../../../utils/owner.utils";
import type { BranchPayload } from "../../../types";

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationPicker({
  position,
  onChange,
}: {
  position: [number, number];
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return position[0] && position[1] ? <Marker position={position} /> : null;
}

export function BranchDialog({
  isOpen,
  onClose,
  form,
  editingBranchId,
  saving,
  onFormChange,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  form: BranchPayload;
  editingBranchId: string | null;
  saving: boolean;
  onFormChange: (form: BranchPayload) => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-coffee">
            {editingBranchId ? "Sửa chi nhánh" : "Tạo mới chi nhánh"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <TextField
            label="Tên chi nhánh"
            value={form.name}
            onChange={(value) => onFormChange({ ...form, name: value })}
          />
          <TextField
            label="Địa chỉ"
            value={form.address}
            onChange={(value) => onFormChange({ ...form, address: value })}
          />
          <TextField
            label="Số điện thoại"
            value={form.phone}
            onChange={(value) => onFormChange({ ...form, phone: value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Lat"
              value={form.lat}
              onChange={(value) => onFormChange({ ...form, lat: value })}
            />
            <NumberField
              label="Lng"
              value={form.lng}
              onChange={(value) => onFormChange({ ...form, lng: value })}
            />
          </div>

          <div className="h-48 w-full overflow-hidden rounded-lg border border-line">
            <MapContainer
              center={[form.lat || 10.7769, form.lng || 106.7009]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              key={`${form.lat}-${form.lng}`}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker
                position={[form.lat, form.lng]}
                onChange={(lat, lng) => onFormChange({ ...form, lat, lng })}
              />
            </MapContainer>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TimeField
              label="Mở cửa"
              value={isoToTime(form.openTime)}
              onChange={(value) =>
                onFormChange({ ...form, openTime: timeToIso(value) })
              }
            />
            <TimeField
              label="Đóng cửa"
              value={isoToTime(form.closeTime)}
              onChange={(value) =>
                onFormChange({ ...form, closeTime: timeToIso(value) })
              }
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              checked={form.allowLocalPricingOverride}
              type="checkbox"
              onChange={(event) =>
                onFormChange({
                  ...form,
                  allowLocalPricingOverride: event.target.checked,
                })
              }
            />
            Cho phép chi nhánh tự sửa giá
          </label>

          <div className="flex justify-end gap-2 pt-4">
            <button
              className="h-9 rounded-lg px-4 text-sm font-semibold text-muted transition-colors hover:bg-beige"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              className="h-9 rounded-lg bg-coffee px-4 text-sm font-semibold text-white transition-colors hover:bg-coffee/90 disabled:opacity-50"
              disabled={saving}
              onClick={onSave}
            >
              Lưu
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
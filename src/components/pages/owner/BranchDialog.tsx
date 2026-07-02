import { useMemo, useState } from "react";
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
import { geocodeAddress, GeocodeError } from "@/lib/geocoding";

function BranchImageField({
  imageUrl,
  imageFile,
  onChange,
}: {
  imageUrl: string | null;
  imageFile: File | null;
  onChange: (file: File | null) => void;
}) {
  const previewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : imageUrl),
    [imageFile, imageUrl],
  );

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Chỉ chấp nhận ảnh JPEG, PNG, GIF hoặc WEBP.");
      return;
    }
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert("Ảnh không được vượt quá 10MB.");
      return;
    }

    onChange(file);
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-muted">
        Ảnh đại diện chi nhánh
      </label>
      <div className="flex items-center gap-3">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-beige">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted">
              Chưa có ảnh
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="h-9 cursor-pointer rounded-lg border border-line px-4 text-sm font-medium text-coffee transition-colors hover:bg-beige flex items-center justify-center">
            {imageUrl || imageFile ? "Đổi ảnh" : "Chọn ảnh"}
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
          {(imageUrl || imageFile) && (
            <button
              type="button"
              className="h-9 rounded-lg px-4 text-sm font-medium text-red-500 transition-colors hover:bg-beige"
              onClick={() => onChange(null)}
            >
              Xóa ảnh
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  async function handleGeocode() {
    setGeocodeError(null);
    setGeocoding(true);
    try {
      const result = await geocodeAddress(form.address);
      onFormChange({ ...form, lat: result.lat, lng: result.lng });
    } catch (err) {
      setGeocodeError(
        err instanceof GeocodeError ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại."
      );
    } finally {
      setGeocoding(false);
    }
  }

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
          <div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <TextField
                  label="Địa chỉ"
                  value={form.address}
                  onChange={(value) => onFormChange({ ...form, address: value })}
                />
              </div>
              <button
                type="button"
                className="h-9 shrink-0 rounded-lg border border-line px-3 text-sm font-medium text-coffee transition-colors hover:bg-beige disabled:opacity-50"
                disabled={geocoding || !form.address.trim()}
                onClick={handleGeocode}
              >
                {geocoding ? "Đang tìm..." : "Tìm vị trí"}
              </button>
            </div>
            {geocodeError && (
              <p className="mt-1 text-xs text-red-500">{geocodeError}</p>
            )}
          </div>
          <TextField
            label="Số điện thoại"
            value={form.phone}
            onChange={(value) => onFormChange({ ...form, phone: value })}
          />
          <BranchImageField
            imageUrl={form.imageUrl}
            imageFile={form.imageFile}
            onChange={(file) =>
              onFormChange({
                ...form,
                imageFile: file,
                imageUrl: file ? form.imageUrl : null,
              })
            }
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

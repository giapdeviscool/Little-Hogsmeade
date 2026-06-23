import { Card } from "../../../components/ui/Card";
import type { Branch } from "../../../types";
import type { OpeningHoursBlock } from "../landing.types";

export function StoreAndMemberSection({
  openingHoursBlock,
  branches,
  storeQuery,
  setStoreQuery,
  userLocation,
  onDetectLocation,
  locationNotice,
}: {
  openingHoursBlock: OpeningHoursBlock;
  branches: Array<Branch & { distanceKm: number | null }>;
  storeQuery: string;
  setStoreQuery: (value: string) => void;
  userLocation: { lat: number; lng: number } | null;
  onDetectLocation: () => void;
  locationNotice: string | null;
}) {
  return (
    <section id="landing-stores" className="bg-cream py-20 md:py-24">
      <div className="mx-auto grid max-w-[1080px] gap-8 px-4 md:px-8 lg:grid-cols-2 lg:px-8">
        <Card className="rounded-[18px] border border-line bg-white p-7">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">
            Tìm cửa hàng
          </p>
          <h2 className="mt-3 text-[24px] font-bold">Tìm cửa hàng gần nhất</h2>
          <p className="mt-3 text-sm leading-6 text-coffee/80">
            Chọn chi nhánh phù hợp và bắt đầu trải nghiệm ẩm thực, cà phê và dịch vụ của chúng tôi.
          </p>
          <div className="mt-5 flex gap-2 rounded-[14px] border border-line bg-cream p-2">
            <input
              value={storeQuery}
              onChange={(event) => setStoreQuery(event.target.value)}
              className="flex-1 bg-transparent px-2 text-sm outline-none"
              placeholder="Nhập quận / thành phố / từ khóa..."
            />
            <button
              type="button"
              onClick={onDetectLocation}
              className="rounded-[10px] bg-coffee px-4 py-2 text-xs font-bold text-white"
            >
              Dùng vị trí
            </button>
          </div>
          {locationNotice && (
            <div className="mt-3 rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {locationNotice}
            </div>
          )}
          <div className="mt-4 space-y-2">
            {branches.length > 0 ? (
              branches.slice(0, 3).map((branch) => (
                <div
                  key={branch.id}
                  className="rounded-[16px] border border-line bg-white p-4 text-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-coffee">{branch.name}</p>
                      <p className="mt-1 text-muted">{branch.address}</p>
                      <p className="mt-2 text-xs text-muted">
                        {branch.phone}
                        {branch.email ? ` · ${branch.email}` : ""}
                      </p>
                    </div>
                    <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-coffee">
                      {branch.distanceKm == null
                        ? "Xem sau"
                        : `${branch.distanceKm.toFixed(1)} km`}
                    </span>
                  </div>
                  <a
                    className="mt-3 inline-block text-xs font-semibold text-gold"
                    href={`https://www.google.com/maps/search/?api=1&query=${branch.lat},${branch.lng}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Mở bản đồ
                  </a>
                  <a
                    className="ml-4 mt-3 inline-block text-xs font-semibold text-muted"
                    href={`https://www.google.com/maps/search/?api=1&query=${branch.lat},${branch.lng}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Xem tuyến đường
                  </a>
                </div>
              ))
            ) : (
              <div className="rounded-[16px] border border-dashed border-latte bg-cream px-4 py-6 text-center text-sm text-muted">
                Không có chi nhánh phù hợp.
              </div>
            )}
          </div>
        </Card>

        <Card className="rounded-[18px] border border-line bg-white p-7">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">
            Thành viên
          </p>
          <h2 className="mt-3 text-[24px] font-bold">Tra cứu hạng và điểm</h2>
          <p className="mt-3 text-sm leading-6 text-coffee/80">
            Giao diện tra cứu thành viên sẵn khung để nối API khi backend mở
            endpoint membership/loyalty.
          </p>

          <div className="mt-5 rounded-[16px] bg-beige p-4">
            <p className="text-sm font-semibold text-coffee">
              {openingHoursBlock.title}
            </p>
            <div className="mt-3 space-y-2 text-sm text-muted">
              {openingHoursBlock.hours.map((item) => (
                <div
                  key={item.day}
                  className="flex items-center justify-between gap-4"
                >
                  <span>{item.day}</span>
                  <span>{item.isClosed ? "Đóng cửa" : item.hours}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-[16px] border border-line bg-cream p-4">
            <p className="text-sm font-semibold text-coffee">Vị trí hiện tại</p>
            <p className="mt-1 text-sm text-muted">
              {userLocation
                ? `${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`
                : "Chưa bật định vị"}
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}

import { useState, useEffect } from "react";
import { Card } from "../../ui/Card";
import type { ChainConfig, MenuSyncPreview } from "../../../types";
import type { LoyaltyEarnConfig } from "../../../types/loyalty.types";
import { SimpleList } from "./OwnerCharts";
import { formatCurrency } from "../../../utils/owner.utils";
import { TriangleAlert } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";
import { getLoyaltyConfig, saveLoyaltyConfig } from "../../../api/loyalty.api";

function EditableLoyaltyEarnField({ saving }: { saving: boolean }) {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<LoyaltyEarnConfig | null>(null);
  const [localSpend, setLocalSpend] = useState(10000);
  const [localPoints, setLocalPoints] = useState(1);

  useEffect(() => {
    let active = true;
    getLoyaltyConfig()
      .then((loyaltyConfig) => {
        if (!active) return;
        setConfig(loyaltyConfig);
        setLocalSpend(loyaltyConfig.spendAmount);
        setLocalPoints(loyaltyConfig.pointsEarned);
      })
      .catch(() => {
        if (!active) return;
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const dirty =
    config &&
    (localSpend !== config.spendAmount || localPoints !== config.pointsEarned);

  const handleSave = async () => {
    if (!config) return;
    try {
      const updated = await saveLoyaltyConfig({
        ...config,
        spendAmount: localSpend,
        pointsEarned: localPoints,
      });
      setConfig(updated);
      setLocalSpend(updated.spendAmount);
      setLocalPoints(updated.pointsEarned);
    } catch (error) {
      console.error("Failed to save loyalty config:", error);
    }
  };

  const handleReset = () => {
    if (!config) return;
    setLocalSpend(config.spendAmount);
    setLocalPoints(config.pointsEarned);
  };

  if (loading) {
    return (
      <div className="py-4 border-b border-line">
        <p className="text-sm font-medium text-coffee">Tỷ lệ tích điểm</p>
        <p className="mt-0.5 text-xs text-muted">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="py-4 border-b border-line">
      <div className="min-w-0 mb-3">
        <p className="text-sm font-medium text-coffee">Tỷ lệ tích điểm</p>
        <p className="mt-0.5 text-xs text-muted">
          Hệ thống tự động quy đổi giá trị đơn hàng hoàn tất sang điểm thưởng.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-sm text-coffee">
        <span className="font-medium">Khi khách hàng chi tiêu</span>
        <input
          className="h-9 w-28 rounded-lg border border-line bg-background px-3 text-sm text-coffee focus:outline-none focus:ring-2 focus:ring-coffee/20"
          type="number"
          min={1000}
          step={1000}
          value={localSpend}
          onChange={(e) => setLocalSpend(Number(e.target.value))}
        />
        <span className="font-medium">VND, hệ thống sẽ tự động cộng</span>
        <input
          className="h-9 w-20 rounded-lg border border-line bg-background px-3 text-sm text-coffee focus:outline-none focus:ring-2 focus:ring-coffee/20"
          type="number"
          min={1}
          step={1}
          value={localPoints}
          onChange={(e) => setLocalPoints(Number(e.target.value))}
        />
        <span className="font-medium">điểm vào ví tích lũy.</span>
      </div>
      {dirty && (
        <div className="flex gap-2 mt-3">
          <button
            className="h-9 rounded-lg bg-coffee px-4 text-sm font-semibold text-white transition-colors hover:bg-coffee/90 disabled:opacity-50"
            disabled={saving}
            onClick={handleSave}
          >
            Lưu
          </button>
          <button
            className="h-9 rounded-lg px-3 text-sm font-semibold text-muted transition-colors hover:bg-beige"
            disabled={saving}
            onClick={handleReset}
          >
            Hủy
          </button>
        </div>
      )}
      <p className="mt-3 rounded-xl bg-beige px-4 py-2 text-sm font-medium text-coffee">
        Khách hàng chi tiêu {new Intl.NumberFormat("vi-VN").format(localSpend)}{" "}
        VND sẽ nhận được {localPoints} điểm.
      </p>
    </div>
  );
}

export function SyncPanel({
  config,
  preview,
  saving,
  overrideBranchesCount = 0,
  onSaveConfig,
  onSync,
}: {
  config: ChainConfig | null;
  preview: MenuSyncPreview;
  saving: boolean;
  overrideBranchesCount?: number;
  onSaveConfig: (config: Partial<ChainConfig>) => void;
  onSync: () => void;
}) {
  const [confirmGlobalPricing, setConfirmGlobalPricing] = useState(false);
  const isMenuEmpty =
    preview.categories.length === 0 || preview.menuItems.length === 0;

  const globalPricingEnabled = config?.globalPricingEnabled ?? true;

  return (
    <div className="space-y-10">
      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Chính sách
        </p>
        <h2 className="mt-1 text-lg font-semibold text-coffee">
          Cấu hình chuỗi
        </h2>
        <p className="mt-1 text-sm text-muted">
          Mỗi cấu hình được lưu độc lập. Thay đổi có hiệu lực ngay, không ảnh
          hưởng dữ liệu đã ghi nhận trước đó.
        </p>
        <Card className="mt-4 divide-y divide-line px-5">
          <EditableLoyaltyEarnField saving={saving} />
        </Card>
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Giá bán
        </p>
        <h2 className="mt-1 text-lg font-semibold text-coffee">
          Chính sách giá toàn chuỗi
        </h2>
        <p className="mt-1 text-sm text-muted">
          Khi bật, giá từ menu chuẩn sẽ được áp dụng đồng nhất cho toàn bộ chi
          nhánh. Chi nhánh không thể tự đặt giá riêng trừ khi được cấp quyền
          override.
        </p>
        <Card className="mt-4 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-coffee">
                Trạng thái hiện tại:{" "}
                <span
                  className={
                    globalPricingEnabled ? "text-green-600" : "text-muted"
                  }
                >
                  {globalPricingEnabled ? "Đang bật" : "Đang tắt"}
                </span>
              </p>
              {globalPricingEnabled ? (
                <p className="text-xs text-muted">
                  Giá chuẩn đang được áp dụng cho toàn chuỗi.
                </p>
              ) : (
                <p className="text-xs text-muted">
                  Các chi nhánh đang dùng giá riêng của mình.
                </p>
              )}
            </div>
            <button
              className={`h-9 rounded-lg px-4 text-sm font-semibold transition-colors disabled:opacity-50 ${
                globalPricingEnabled
                  ? "border border-line text-muted hover:bg-beige"
                  : "bg-coffee text-white hover:bg-coffee/90"
              }`}
              disabled={saving}
              onClick={() => setConfirmGlobalPricing(true)}
            >
              {globalPricingEnabled
                ? "Tắt chính sách giá toàn chuỗi"
                : "Bật chính sách giá toàn chuỗi"}
            </button>
          </div>

          {globalPricingEnabled && overrideBranchesCount > 0 && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                {overrideBranchesCount} chi nhánh đang được phép tự set giá
                riêng — chính sách giá toàn chuỗi không áp dụng cho các chi
                nhánh này.
              </p>
            </div>
          )}
        </Card>

        <ConfirmDialog
          isOpen={confirmGlobalPricing}
          title={
            globalPricingEnabled
              ? "Tắt chính sách giá toàn chuỗi?"
              : "Bật chính sách giá toàn chuỗi?"
          }
          description={
            globalPricingEnabled
              ? "Sau khi tắt, mỗi chi nhánh sẽ dùng giá riêng của mình. Giá trên menu chuẩn sẽ không còn được áp dụng tự động."
              : `Sau khi bật, giá từ menu chuẩn sẽ được áp dụng cho toàn bộ chi nhánh. Giá hiện tại tại các chi nhánh có thể bị ghi đè.${overrideBranchesCount > 0 ? ` (${overrideBranchesCount} chi nhánh đang có quyền override sẽ không bị ảnh hưởng.)` : ""}`
          }
          onConfirm={() => {
            onSaveConfig({ globalPricingEnabled: !globalPricingEnabled });
            setConfirmGlobalPricing(false);
          }}
          onClose={() => setConfirmGlobalPricing(false)}
          loading={saving}
        />
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Đồng bộ dữ liệu
        </p>
        <h2 className="mt-1 text-lg font-semibold text-coffee">Menu chuẩn</h2>
        <p className="mt-1 text-sm text-muted">
          Đẩy danh mục và món chuẩn xuống tất cả chi nhánh đang hoạt động. Hành
          động này sẽ ghi đè dữ liệu hiện tại.
        </p>
        <Card className="mt-4 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3 flex-1 max-w-[600px]">
              <p className="font-medium text-coffee">
                {preview.categories.length} danh mục chuẩn ·{" "}
                {preview.menuItems.length} món chuẩn
              </p>
              {overrideBranchesCount > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    {overrideBranchesCount} chi nhánh đang tự set giá riêng.
                    Đồng bộ có thể ảnh hưởng đến giá hiện tại của các chi nhánh
                    này.
                  </p>
                </div>
              )}
            </div>
            <button
              className="h-9 whitespace-nowrap rounded-lg bg-coffee px-4 text-sm font-semibold text-white disabled:opacity-50"
              disabled={saving || isMenuEmpty}
              onClick={onSync}
            >
              Đồng bộ menu
            </button>
          </div>

          {isMenuEmpty ? (
            <div className="mt-5 rounded-lg border border-dashed border-line py-10 text-center text-sm text-muted">
              Chưa có menu chuẩn nào được thiết lập. Vào module Quản lý Món ăn
              để thêm danh mục và món trước khi đồng bộ.
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SimpleList
                title="Danh mục chuẩn"
                items={preview.categories.map((c) => c.name)}
              />
              <SimpleList
                title="Món chuẩn"
                items={preview.menuItems.map(
                  (i) => `${i.name} · ${formatCurrency(i.basePrice)}`,
                )}
              />
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

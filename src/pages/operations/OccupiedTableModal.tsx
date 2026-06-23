import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowRightLeft,
  ChefHat,
  Loader2,
  Receipt,
  ShoppingBag,
} from "lucide-react";
import { env } from "../../config/env";
import { getAuthToken } from "../../store/auth.store";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Skeleton } from "../../components/ui/skeleton";
import { AddOrderItemsPanel } from "./AddOrderItemsPanel";

type AvailableTable = {
  id: number | string;
  name: string;
  status?: string;
};

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  lineTotal: number;
};

type CurrentOrder = {
  id: number | string;
  tableName: string;
  items: OrderItem[];
  totalAmount: number;
};

type OccupiedTableModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | string | null;
  tableName?: string;
  orderId?: number | string | null;
  branchId: string | null;
  onSuccess: () => void;
};

type ApiError = { message?: string; errors?: Array<{ message?: string }> };

function apiHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiError>(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      fallback
    );
  }
  return fallback;
}

function unwrapData<T>(payload: T | { data?: T }) {
  return (payload as { data?: T }).data ?? (payload as T);
}

function toNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")}₫`;
}

function toCurrentOrder(
  payload: Record<string, unknown>,
  fallbackTableId: number | string,
): CurrentOrder {
  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  const items = rawItems.map((item, index) => {
    const itemData = item as Record<string, unknown>;
    const quantity = toNumber(itemData.quantity ?? itemData.qty) || 1;
    const price = toNumber(
      itemData.price ?? itemData.unit_price ?? itemData.unitPrice,
    );
    return {
      id: String(itemData.id ?? itemData.item_id ?? index),
      name: String(
        itemData.name ??
          itemData.product_name ??
          (itemData.product as { name?: string } | undefined)?.name ??
          "Món chưa đặt tên",
      ),
      quantity,
      lineTotal:
        toNumber(itemData.total ?? itemData.subtotal ?? itemData.line_total) ||
        price * quantity,
    };
  });
  const table = payload.table as { name?: string } | undefined;

  return {
    id: (payload.id ?? payload.order_id ?? "") as number | string,
    tableName: String(
      payload.table_name ??
        payload.tableName ??
        table?.name ??
        `Bàn #${fallbackTableId}`,
    ),
    items,
    totalAmount:
      toNumber(payload.total_amount ?? payload.totalAmount ?? payload.total) ||
      items.reduce((sum, item) => sum + item.lineTotal, 0),
  };
}

function OrderSkeleton() {
  return (
    <div className="space-y-4 py-2">
      <Skeleton className="h-20 rounded-2xl bg-beige" />
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40 bg-beige" />
            <Skeleton className="h-3 w-20 bg-beige" />
          </div>
          <Skeleton className="h-4 w-16 bg-beige" />
        </div>
      ))}
      <Skeleton className="mt-5 h-16 rounded-xl bg-beige" />
    </div>
  );
}

export function OccupiedTableModal({
  isOpen,
  onClose,
  tableId,
  tableName,
  orderId,
  branchId,
  onSuccess,
}: OccupiedTableModalProps) {
  const [order, setOrder] = useState<CurrentOrder | null>(null);
  const [availableTables, setAvailableTables] = useState<AvailableTable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showAddItems, setShowAddItems] = useState(false);
  const [needsFirstOrder, setNeedsFirstOrder] = useState(false);
  const [targetTableId, setTargetTableId] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!isOpen || tableId === null) return;
    let isCurrent = true;
    const loadOrder = async () => {
      setIsLoading(true);
      setOrder(null);
      setError("");
      setToast("");
      setShowTransferForm(false);
      setShowAddItems(false);
      setNeedsFirstOrder(false);
      setTargetTableId("");
      try {
        const response = await axios.get(
          `${env.apiBaseUrl}/tables/${tableId}/current-order`,
          { headers: apiHeaders() },
        );
        if (isCurrent)
          setOrder(
            toCurrentOrder(
              unwrapData(response.data) as Record<string, unknown>,
              tableId,
            ),
          );
      } catch (requestError) {
        if (!isCurrent) return;
        if (axios.isAxiosError(requestError) && requestError.response?.status === 404) {
          setNeedsFirstOrder(true);
          return;
        }
        setError(
          getErrorMessage(
            requestError,
            "Không thể tải hóa đơn hiện tại của bàn.",
          ),
        );
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };
    void loadOrder();

    return () => {
      isCurrent = false;
    };
  }, [isOpen, tableId]);

  useEffect(() => {
    if (!isOpen || !showTransferForm || !branchId) return;
    let isCurrent = true;
    const loadAvailableTables = async () => {
      setIsLoadingTables(true);
      setAvailableTables([]);
      try {
        const response = await axios.get(
          `${env.apiBaseUrl}/branches/${branchId}/tables`,
          {
            headers: apiHeaders(),
            params: { status: "available" },
          },
        );
        const data = unwrapData(response.data) as {
          areas?: Array<{ tables?: AvailableTable[] }>;
        };
        const tables = data.areas?.flatMap((area) => area.tables ?? []) ?? [];
        if (isCurrent) setAvailableTables(tables);
      } catch (requestError) {
        if (isCurrent)
          setError(
            getErrorMessage(requestError, "Không thể tải danh sách bàn trống."),
          );
      } finally {
        if (isCurrent) setIsLoadingTables(false);
      }
    };
    void loadAvailableTables();
    return () => {
      isCurrent = false;
    };
  }, [branchId, isOpen, showTransferForm]);

  const changeTable = async () => {
    const activeOrderId = order?.id || orderId;
    if (!activeOrderId)
      return setError("Không tìm thấy hóa đơn đang phục vụ để chuyển bàn.");
    if (!targetTableId) return setError("Vui lòng chọn bàn mới.");

    setError("");
    setIsTransferring(true);
    try {
      await axios.post(
        `${env.apiBaseUrl}/orders/${activeOrderId}/change-table`,
        { targetTableId },
        { headers: apiHeaders() },
      );
      setToast("Chuyển bàn thành công");
      onSuccess();
      window.setTimeout(onClose, 900);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Không thể chuyển bàn. Vui lòng thử lại.",
        ),
      );
    } finally {
      setIsTransferring(false);
    }
  };

  const selectableTables = availableTables.filter(
    (table) =>
      (table.status === undefined || table.status === "available") &&
      String(table.id) !== String(tableId),
  );

  const activeOrderId = order?.id || orderId;

  const refreshOrderAfterAdding = async () => {
    if (tableId === null) return;
    try {
      const response = await axios.get(
        `${env.apiBaseUrl}/tables/${tableId}/current-order`,
        { headers: apiHeaders() },
      );
      setOrder(
        toCurrentOrder(
          unwrapData(response.data) as Record<string, unknown>,
          tableId,
        ),
      );
      setError("");
      setShowAddItems(false);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Đã thêm món nhưng không thể tải lại hóa đơn.",
        ),
      );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isTransferring) onClose();
      }}
    >
      <DialogContent
        showCloseButton={!isTransferring}
        className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border-[rgba(74,53,37,0.12)] bg-white p-0 text-coffee sm:max-w-[580px]"
      >
        <DialogHeader className="border-b border-[rgba(74,53,37,0.08)] bg-[#fffaf4] px-6 py-5">
          <div className="flex items-center gap-3 pr-8">
            <span className="grid size-10 place-items-center rounded-xl bg-[#c2a68c]/25 text-[#8a5a32]">
              <Receipt className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-xl font-bold">
                {order?.tableName ?? tableName ?? `Bàn #${tableId}`}
              </DialogTitle>
              <span className="mt-1 inline-flex rounded-full bg-[#c8874b]/15 px-2.5 py-1 text-xs font-bold text-[#965a27]">
                Đang phục vụ
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5">
          {toast && (
            <p
              role="status"
              className="mb-4 rounded-xl border border-[#5fa876]/25 bg-[#f0f8f1] px-4 py-3 text-sm font-semibold text-[#3d8053]"
            >
              {toast}
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-[#c25a5a]/20 bg-red-50 px-4 py-3 text-sm font-semibold text-[#c25a5a]"
            >
              {error}
            </p>
          )}
          {isLoading ? (
            <OrderSkeleton />
          ) : showAddItems ? (
            <AddOrderItemsPanel
              isOpen={showAddItems}
              orderId={activeOrderId}
              tableId={tableId}
              onBack={() => {
                setShowAddItems(false);
                setError("");
              }}
              onAdded={refreshOrderAfterAdding}
            />
          ) : showTransferForm ? (
            <section className="space-y-4">
              <div className="rounded-2xl bg-cream p-4">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="size-4 text-latte" />
                  <h3 className="font-bold">Chuyển hóa đơn sang bàn khác</h3>
                </div>
                <p className="mt-1 text-sm text-muted">
                  Bàn hiện tại sẽ được trả về trạng thái trống sau khi xác nhận.
                </p>
              </div>
              <label className="block text-sm font-semibold">
                Bàn mới
                <select
                  value={targetTableId}
                  onChange={(event) => setTargetTableId(event.target.value)}
                  disabled={isLoadingTables || isTransferring}
                  className="mt-2 h-11 w-full rounded-xl border border-[rgba(74,53,37,0.12)] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-latte/40"
                >
                  <option value="">
                    {isLoadingTables
                      ? "Đang tải bàn trống..."
                      : "Chọn bàn cần chuyển đến"}
                  </option>
                  {selectableTables.map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.name}
                    </option>
                  ))}
                </select>
              </label>
              {!isLoadingTables && selectableTables.length === 0 && (
                <p className="text-sm text-muted">
                  Hiện không có bàn trống để chuyển đến.
                </p>
              )}
            </section>
          ) : needsFirstOrder ? (
            <section className="rounded-2xl border border-gold/25 bg-[#fffaf0] p-5">
              <h3 className="font-bold">Khách đã nhận bàn, chưa gọi món</h3>
              <p className="mt-1 text-sm leading-6 text-muted">
                Hãy bắt đầu gọi món để tạo hóa đơn pending cho bàn này.
              </p>
            </section>
          ) : (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold">Món đã gọi</h3>
                  <p className="mt-0.5 text-sm text-muted">
                    {order?.items.length ?? 0} món trong hóa đơn
                  </p>
                </div>
                <ShoppingBag className="size-5 text-latte" />
              </div>
              <div className="divide-y divide-[rgba(74,53,37,0.08)]">
                {order?.items.length ? (
                  order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="mt-0.5 text-sm text-muted">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold">
                        {formatCurrency(item.lineTotal)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl bg-cream px-4 py-5 text-center text-sm text-muted">
                    Hóa đơn chưa có món nào.
                  </p>
                )}
              </div>
              <div className="mt-5 flex items-end justify-between rounded-xl bg-cream px-4 py-4">
                <span className="text-sm font-semibold text-muted">
                  Tổng cộng
                </span>
                <strong className="text-2xl tracking-[-0.04em] text-coffee">
                  {formatCurrency(order?.totalAmount ?? 0)}
                </strong>
              </div>
            </section>
          )}
        </div>

        {!showAddItems && <DialogFooter className="m-0 rounded-none border-t border-[rgba(74,53,37,0.08)] bg-white px-6 py-4 sm:justify-between">
          {showTransferForm ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isTransferring}
                onClick={() => {
                  setShowTransferForm(false);
                  setError("");
                }}
                className="h-10 rounded-xl border-[rgba(74,53,37,0.16)]"
              >
                Quay lại
              </Button>
              <Button
                type="button"
                disabled={
                  isLoadingTables ||
                  isTransferring ||
                  selectableTables.length === 0
                }
                onClick={changeTable}
                className="h-10 rounded-xl bg-coffee px-5 text-white hover:bg-[#3f2d20]"
              >
                {isTransferring && <Loader2 className="size-4 animate-spin" />}
                {isTransferring ? "Đang chuyển..." : "Xác nhận chuyển"}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setError("");
                  setShowTransferForm(true);
                }}
                disabled={isLoading || !activeOrderId}
                className="h-10 rounded-xl border-[rgba(74,53,37,0.16)]"
              >
                <ArrowRightLeft className="size-4" /> Chuyển bàn
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setError("");
                    setShowAddItems(true);
                  }}
                  disabled={isLoading}
                  className="h-10 rounded-xl border-[rgba(74,53,37,0.16)]"
                >
                  <ChefHat className="size-4" /> {needsFirstOrder ? 'Bắt đầu gọi món' : 'Gọi thêm món'}
                </Button>
                <Button
                  type="button"
                  onClick={() => console.log("Chuyển sang trang thanh toán")}
                  disabled={isLoading || !activeOrderId}
                  className="h-10 rounded-xl bg-coffee px-4 text-white hover:bg-[#3f2d20]"
                >
                  Thanh toán
                </Button>
              </div>
            </>
          )}
        </DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import * as chainApi from "../../api/chain.api";
import { BranchesPanel } from "../../components/pages/owner/BranchesPanel";
import { DashboardPanel } from "../../components/pages/owner/DashboardPanel";
import {
  OwnerAlert,
  OwnerHeader,
  OwnerLoading,
  OwnerTabs,
} from "../../components/pages/owner/OwnerShell";
import { PricingPanel } from "../../components/pages/owner/PricingPanel";
import { PromotionsPanel } from "../../components/pages/owner/PromotionsPanel";
import { SyncPanel } from "../../components/pages/owner/SyncPanel";
import {
  addDays,
  dateToInput,
  getErrorMessage,
  timeToIso,
} from "../../utils/owner.utils";
import type {
  Branch,
  BranchPayload,
  ChainConfig,
  ChainDashboard,
  MenuSyncPreview,
  OwnerActiveTab,
  Promotion,
  PromotionPayload,
} from "../../types";

const emptyBranchForm: BranchPayload = {
  name: "",
  address: "",
  phone: "",
  email: "",
  lat: 10.7769,
  lng: 106.7009,
  openTime: timeToIso("07:00"),
  closeTime: timeToIso("22:00"),
  status: "active",
  allowLocalPricingOverride: false,
};

const emptyPromotionForm: PromotionPayload = {
  name: "",
  description: "",
  startDate: dateToInput(new Date()),
  endDate: dateToInput(addDays(new Date(), 7)),
  discountValue: 10,
  discountType: "percent",
  scope: "global",
  appliedBranches: [],
};

export function OwnerPage() {
  const [activeTab, setActiveTab] = useState<OwnerActiveTab>("dashboard");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [dashboard, setDashboard] = useState<ChainDashboard | null>(null);
  const [config, setConfig] = useState<ChainConfig | null>(null);
  const [menuPreview, setMenuPreview] = useState<MenuSyncPreview>({
    categories: [],
    menuItems: [],
  });
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [startDate, setStartDate] = useState(
    dateToInput(addDays(new Date(), -30)),
  );
  const [endDate, setEndDate] = useState(dateToInput(new Date()));
  const [branchForm, setBranchForm] = useState<BranchPayload>(emptyBranchForm);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [promotionForm, setPromotionForm] =
    useState<PromotionPayload>(emptyPromotionForm);
  const [pricingItemId, setPricingItemId] = useState("");
  const [pricingBranchId, setPricingBranchId] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const activeBranches = branches.filter(
    (branch) => branch.status === "active",
  );

  useEffect(() => {
    void loadModule();
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [selectedBranchId, startDate, endDate]);

  async function loadModule() {
    try {
      setLoading(true);
      setError("");
      const [
        branchResponse,
        configResponse,
        previewResponse,
        promotionsResponse,
      ] = await Promise.all([
        chainApi.getBranches(),
        chainApi.getChainConfig(),
        chainApi.getMenuSyncPreview(),
        chainApi.getPromotions(),
      ]);

      setBranches(branchResponse.data.items);
      setConfig(configResponse.data);
      setMenuPreview(previewResponse.data);
      setPromotions(promotionsResponse.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboard() {
    try {
      const response = await chainApi.getChainDashboard({
        branchId: selectedBranchId || undefined,
        startDate,
        endDate,
      });
      setDashboard(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function saveBranch() {
    try {
      setSaving(true);
      setError("");
      if (editingBranchId) {
        await chainApi.updateBranch(editingBranchId, branchForm);
        setNotice("Đã cập nhật chi nhánh.");
      } else {
        await chainApi.createBranch(branchForm);
        setNotice("Đã tạo chi nhánh mới.");
      }
      setBranchForm(emptyBranchForm);
      setEditingBranchId(null);
      await loadModule();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function deactivateBranch(id: string) {
    try {
      setSaving(true);
      setError("");
      await chainApi.deactivateBranch(id);
      setNotice("Đã vô hiệu hóa chi nhánh.");
      await loadModule();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function saveConfig(nextConfig: Partial<ChainConfig>) {
    try {
      setSaving(true);
      setError("");
      const response = await chainApi.updateChainConfig(nextConfig);
      setConfig(response.data);
      setNotice("Đã lưu cấu hình chuỗi.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function syncMenu() {
    try {
      setSaving(true);
      setError("");
      const response = await chainApi.syncMenu();
      setNotice(
        `Đã đồng bộ ${response.data.syncedBranches} chi nhánh đang hoạt động.`,
      );
      await loadModule();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function savePricing() {
    if (!pricingItemId) {
      setError("Vui lòng chọn món cần cập nhật giá.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const branchIds = pricingBranchId
        ? [pricingBranchId]
        : activeBranches.map((branch) => branch.id);
      const response = await chainApi.updatePricing({
        menuItemId: pricingItemId,
        basePrice: newPrice,
        branchIds,
      });
      setNotice(
        `Đã cập nhật ${response.data.updatedBranchItems} giá bán tại chi nhánh.`,
      );
      await loadModule();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function savePromotion() {
    if (new Date(promotionForm.endDate) <= new Date(promotionForm.startDate)) {
      setError("Ngày kết thúc phải lớn hơn ngày bắt đầu.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await chainApi.createPromotion(promotionForm);
      setPromotionForm(emptyPromotionForm);
      setNotice("Đã tạo khuyến mãi mới.");
      const response = await chainApi.getPromotions();
      setPromotions(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function editBranch(branch: Branch) {
    setEditingBranchId(branch.id);
    setBranchForm({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      email: branch.email ?? "",
      lat: branch.lat,
      lng: branch.lng,
      openTime: branch.openTime,
      closeTime: branch.closeTime,
      status: branch.status,
      allowLocalPricingOverride: branch.allowLocalPricingOverride,
    });
  }

  function cancelBranchEdit() {
    setEditingBranchId(null);
    setBranchForm(emptyBranchForm);
  }

  return (
    <div className="space-y-6">
      <OwnerHeader onRefresh={() => void loadModule()} />
      <OwnerAlert error={error} notice={notice} />
      <OwnerTabs activeTab={activeTab} onChange={setActiveTab} />

      {loading ? <OwnerLoading /> : null}
      {!loading && activeTab === "dashboard" ? (
        <DashboardPanel
          dashboard={dashboard}
          branches={branches}
          selectedBranchId={selectedBranchId}
          startDate={startDate}
          endDate={endDate}
          onBranchChange={setSelectedBranchId}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      ) : null}
      {!loading && activeTab === "branches" ? (
        <BranchesPanel
          branches={branches}
          form={branchForm}
          editingBranchId={editingBranchId}
          saving={saving}
          onFormChange={setBranchForm}
          onSave={() => void saveBranch()}
          onEdit={editBranch}
          onCancel={cancelBranchEdit}
          onDeactivate={(id) => void deactivateBranch(id)}
        />
      ) : null}
      {!loading && activeTab === "sync" ? (
        <SyncPanel
          config={config}
          preview={menuPreview}
          saving={saving}
          onSaveConfig={(nextConfig) => void saveConfig(nextConfig)}
          onSync={() => void syncMenu()}
        />
      ) : null}
      {!loading && activeTab === "pricing" ? (
        <PricingPanel
          branches={activeBranches}
          preview={menuPreview}
          pricingItemId={pricingItemId}
          pricingBranchId={pricingBranchId}
          newPrice={newPrice}
          saving={saving}
          onItemChange={setPricingItemId}
          onBranchChange={setPricingBranchId}
          onPriceChange={setNewPrice}
          onSave={() => void savePricing()}
        />
      ) : null}
      {!loading && activeTab === "promotions" ? (
        <PromotionsPanel
          branches={activeBranches}
          promotions={promotions}
          form={promotionForm}
          saving={saving}
          onFormChange={setPromotionForm}
          onSave={() => void savePromotion()}
        />
      ) : null}
    </div>
  );
}

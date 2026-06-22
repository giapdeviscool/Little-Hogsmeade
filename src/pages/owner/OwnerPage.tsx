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
import { ConfirmDialog } from "../../components/pages/owner/ConfirmDialog";
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
  lat: 21.0278,
  lng: 105.8536,
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
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [promotionDialogMode, setPromotionDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);
  const [confirmTogglePromotionId, setConfirmTogglePromotionId] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [startDate, setStartDate] = useState(
    dateToInput(addDays(new Date(), -30)),
  );
  const [endDate, setEndDate] = useState(dateToInput(new Date()));
  const [branchForm, setBranchForm] = useState<BranchPayload>(emptyBranchForm);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [confirmSyncOpen, setConfirmSyncOpen] = useState(false);
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
  const overrideBranches = activeBranches.filter(
    (branch) => branch.allowLocalPricingOverride,
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

      setBranches(branchResponse.data?.items || []);
      setConfig(configResponse.data || null);
      setMenuPreview(previewResponse.data || { categories: [], menuItems: [] });
      setPromotions(promotionsResponse.data?.items || []);
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
      setDashboard(response.data || null);
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
      setIsBranchModalOpen(false);
      await loadModule();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleBranchStatus(id: string) {
    try {
      setSaving(true);
      setError("");
      await chainApi.toggleBranchStatus(id);
      setNotice("Đã cập nhật trạng thái chi nhánh.");
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
      setConfig(response.data || null);
      setNotice("Đã lưu cấu hình chuỗi.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function runSyncMenu() {
    try {
      setSaving(true);
      setError("");
      const response = await chainApi.syncMenu();
      setNotice(
        `Đã đồng bộ ${response.data?.syncedBranches} chi nhánh đang hoạt động.`,
      );
      setConfirmSyncOpen(false);
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
        `Đã cập nhật ${response.data?.updatedBranchItems} giá bán tại chi nhánh.`,
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

      if (promotionDialogMode === "edit" && selectedPromotionId) {
        await chainApi.updatePromotion(selectedPromotionId, promotionForm);
        setNotice("Đã cập nhật khuyến mãi.");
      } else {
        await chainApi.createPromotion(promotionForm);
        setNotice("Đã tạo khuyến mãi mới.");
      }

      setPromotionForm(emptyPromotionForm);
      setIsPromotionModalOpen(false);
      setSelectedPromotionId(null);
      const response = await chainApi.getPromotions();
      setPromotions(response.data?.items || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function openCreatePromotionModal() {
    setPromotionDialogMode("create");
    setSelectedPromotionId(null);
    setPromotionForm(emptyPromotionForm);
    setIsPromotionModalOpen(true);
  }

  function editPromotion(promotion: Promotion) {
    setPromotionDialogMode("edit");
    setSelectedPromotionId(promotion.id);
    setPromotionForm({
      name: promotion.name,
      description: promotion.description || "",
      startDate: dateToInput(new Date(promotion.startDate)),
      endDate: dateToInput(new Date(promotion.endDate)),
      discountValue: promotion.discountValue,
      discountType: promotion.discountType,
      scope: promotion.scope,
      appliedBranches: promotion.appliedBranches || [],
    });
    setIsPromotionModalOpen(true);
  }

  function viewPromotion(promotion: Promotion) {
    setPromotionDialogMode("view");
    setSelectedPromotionId(promotion.id);
    setIsPromotionModalOpen(true);
  }

  function closePromotionModal() {
    setIsPromotionModalOpen(false);
    setSelectedPromotionId(null);
    setPromotionForm(emptyPromotionForm);
  }

  async function togglePromotionStatusHandler(id: string) {
    try {
      setSaving(true);
      setError("");
      await chainApi.togglePromotionStatus(id);
      setNotice("Đã cập nhật trạng thái khuyến mãi.");
      setConfirmTogglePromotionId(null);
      const response = await chainApi.getPromotions();
      setPromotions(response.data?.items || []);
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
    setIsBranchModalOpen(true);
  }

  function openCreateBranchModal() {
    setEditingBranchId(null);
    setBranchForm(emptyBranchForm);
    setIsBranchModalOpen(true);
  }

  function closeBranchModal() {
    setIsBranchModalOpen(false);
    setEditingBranchId(null);
    setBranchForm(emptyBranchForm);
  }

  return (
    <div className="space-y-6">
      <OwnerHeader onRefresh={() => void loadModule()} />
      <OwnerAlert
        error={error}
        notice={notice}
        onClose={() => {
          setError("");
          setNotice("");
        }}
      />
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
          isModalOpen={isBranchModalOpen}
          onOpenModal={openCreateBranchModal}
          onCloseModal={closeBranchModal}
          onFormChange={setBranchForm}
          onSave={() => void saveBranch()}
          onEdit={editBranch}
          onToggleStatus={(id) => void toggleBranchStatus(id)}
        />
      ) : null}
      {!loading && activeTab === "sync" ? (
        <>
          <SyncPanel
            config={config}
            preview={menuPreview}
            saving={saving}
            overrideBranchesCount={overrideBranches.length}
            onSaveConfig={(nextConfig) => void saveConfig(nextConfig)}
            onSync={() => setConfirmSyncOpen(true)}
          />
          <ConfirmDialog
            isOpen={confirmSyncOpen}
            title="Đồng bộ menu chuẩn xuống chi nhánh?"
            description={`Hành động này sẽ áp dụng ${menuPreview.categories.length} danh mục và ${menuPreview.menuItems.length} món chuẩn xuống ${activeBranches.length} chi nhánh đang hoạt động. Dữ liệu menu hiện tại tại các chi nhánh này sẽ bị ghi đè.${overrideBranches.length > 0 ? `\n\n⚠ ${overrideBranches.length} chi nhánh đang được phép tự set giá riêng. Đồng bộ sẽ GHI ĐÈ GIÁ hiện tại của các chi nhánh này thành giá chuẩn. (TODO: Confirm BE behavior)` : ''}`}
            onConfirm={() => void runSyncMenu()}
            onClose={() => setConfirmSyncOpen(false)}
            loading={saving}
          />
        </>
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
          isModalOpen={isPromotionModalOpen}
          dialogMode={promotionDialogMode}
          selectedPromotionId={selectedPromotionId}
          onOpenModal={openCreatePromotionModal}
          onCloseModal={closePromotionModal}
          onEdit={editPromotion}
          onView={viewPromotion}
          confirmTogglePromotionId={confirmTogglePromotionId}
          setConfirmTogglePromotionId={setConfirmTogglePromotionId}
          onTogglePromotionStatus={(id) => void togglePromotionStatusHandler(id)}
        />
      ) : null}
    </div>
  );
}

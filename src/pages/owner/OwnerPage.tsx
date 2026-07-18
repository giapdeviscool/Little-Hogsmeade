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
  imageUrl: null,
  imageFile: null,
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
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [startDate, setStartDate] = useState(
    dateToInput(addDays(new Date(), -30)),
  );
  const [endDate, setEndDate] = useState(dateToInput(new Date()));
  const [branchForm, setBranchForm] = useState<BranchPayload>(emptyBranchForm);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
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
      ] = await Promise.all([
        chainApi.getBranches(),
        chainApi.getChainConfig(),
        chainApi.getMenuSyncPreview(),
      ]);

      setBranches(branchResponse.data?.items || []);
      setConfig(configResponse.data || null);
      setMenuPreview(previewResponse.data || { categories: [], menuItems: [] });
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

      let imageUrl = branchForm.imageUrl;

      // Upload ảnh trước nếu có file mới
      if (branchForm.imageFile) {
        const { uploadImage } = await import("../../api/cms.api");
        const uploadRes = await uploadImage(
          branchForm.imageFile,
          "bistro-cafe/branches",
        );
        imageUrl = uploadRes.data.secure_url;
      }

      // Build payload gửi BE — loại bỏ imageFile vì chỉ tồn tại ở client
      const payload = {
        name: branchForm.name,
        address: branchForm.address,
        phone: branchForm.phone,
        email: branchForm.email,
        lat: branchForm.lat,
        lng: branchForm.lng,
        openTime: branchForm.openTime,
        closeTime: branchForm.closeTime,
        status: branchForm.status,
        allowLocalPricingOverride: branchForm.allowLocalPricingOverride,
        imageUrl,
      };

      if (editingBranchId) {
        await chainApi.updateBranch(editingBranchId, payload);
        setNotice("Đã cập nhật chi nhánh.");
      } else {
        await chainApi.createBranch(payload);
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
        `Đã đồng bộ ${response.data?.syncedBranches ?? response.data?.activeBranches ?? 0} chi nhánh đang hoạt động.`,
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
        `Đã cập nhật ${response.data?.updatedBranchItems} giá bán tại chi nhánh.`,
      );
      await loadModule();
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
      imageUrl: branch.imageUrl ?? null,
      imageFile: null,
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
        <SyncPanel
          config={config}
          saving={saving}
          overrideBranchesCount={overrideBranches.length}
          onSaveConfig={(nextConfig) => void saveConfig(nextConfig)}
          onSync={() => void runSyncMenu()}
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
    </div>
  );
}

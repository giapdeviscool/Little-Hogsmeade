import { useState, useEffect } from "react";
import { VouchersPanel } from "../../../components/pages/owner/VouchersPanel";
import * as chainApi from "../../../api/chain.api";
import { getErrorMessage } from "../../../utils/owner.utils";
import type { Voucher, VoucherPayload, Branch } from "../../../types";
import toast from 'react-hot-toast';

const emptyVoucherForm: VoucherPayload = {
  name: "",
  description: "",
  code: "",
  requiresCode: true,
  startDate: new Date().toISOString().split("T")[0],
  expireDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  discountValue: 0,
  discountType: "percent",
  minOrderValue: 0,
  maxUses: 100,
  scope: "global",
  appliedBranches: [],
};

function dateToInput(date: Date) {
  return date.toISOString().split("T")[0];
}

export function VouchersTab() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [activeBranches, setActiveBranches] = useState<Branch[]>([]);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherDialogMode, setVoucherDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);
  const [confirmToggleVoucherId, setConfirmToggleVoucherId] = useState<string | null>(null);
  const [voucherForm, setVoucherForm] = useState<VoucherPayload>(emptyVoucherForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [branchRes, vouchersRes] = await Promise.all([
        chainApi.getBranches(),
        chainApi.getVouchers(),
      ]);
      const branches = branchRes.data?.items || [];
      setActiveBranches(branches.filter(b => b.status === "active"));
      setVouchers(vouchersRes.data?.items || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  async function saveVoucher() {
    if (new Date(voucherForm.expireDate) <= new Date(voucherForm.startDate)) {
      toast.error("Ngày kết thúc phải lớn hơn ngày bắt đầu.");
      return;
    }
    try {
      setSaving(true);
      if (voucherDialogMode === "edit" && selectedVoucherId) {
        await chainApi.updateVoucher(selectedVoucherId, voucherForm);
        toast.success("Đã cập nhật ưu đãi.");
      } else {
        await chainApi.createVoucher(voucherForm);
        toast.success("Đã tạo ưu đãi mới.");
      }
      setVoucherForm(emptyVoucherForm);
      setIsVoucherModalOpen(false);
      setSelectedVoucherId(null);
      const response = await chainApi.getVouchers();
      setVouchers(response.data?.items || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function openCreateVoucherModal() {
    setVoucherDialogMode("create");
    setSelectedVoucherId(null);
    setVoucherForm(emptyVoucherForm);
    setIsVoucherModalOpen(true);
  }

  function editVoucher(voucher: Voucher) {
    setVoucherDialogMode("edit");
    setSelectedVoucherId(voucher.id);
    setVoucherForm({
      name: voucher.name,
      description: voucher.description || "",
      code: voucher.code || "",
      requiresCode: voucher.requiresCode ?? true,
      startDate: dateToInput(new Date(voucher.startDate)),
      expireDate: dateToInput(new Date(voucher.expireDate)),
      discountValue: voucher.discountValue,
      discountType: voucher.discountType,
      minOrderValue: voucher.minOrderValue || 0,
      maxUses: voucher.maxUses || 100,
      scope: voucher.scope,
      appliedBranches: voucher.appliedBranches || [],
    });
    setIsVoucherModalOpen(true);
  }

  function viewVoucher(voucher: Voucher) {
    setVoucherDialogMode("view");
    setSelectedVoucherId(voucher.id);
    setIsVoucherModalOpen(true);
  }

  function closeVoucherModal() {
    setIsVoucherModalOpen(false);
    setSelectedVoucherId(null);
    setVoucherForm(emptyVoucherForm);
  }

  async function toggleVoucherStatusHandler(id: string) {
    try {
      setSaving(true);
      await chainApi.toggleVoucherStatus(id);
      toast.success("Đã cập nhật trạng thái.");
      setConfirmToggleVoucherId(null);
      const response = await chainApi.getVouchers();
      setVouchers(response.data?.items || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted">Đang tải...</div>;
  }

  return (
    <div className="space-y-4">
      <VouchersPanel
        branches={activeBranches}
        Vouchers={vouchers}
        form={voucherForm}
        saving={saving}
        onFormChange={setVoucherForm}
        onSave={() => void saveVoucher()}
        isModalOpen={isVoucherModalOpen}
        dialogMode={voucherDialogMode}
        selectedVoucherId={selectedVoucherId}
        onOpenModal={openCreateVoucherModal}
        onCloseModal={closeVoucherModal}
        onEdit={editVoucher}
        onView={viewVoucher}
        confirmToggleVoucherId={confirmToggleVoucherId}
        setConfirmToggleVoucherId={setConfirmToggleVoucherId}
        onToggleVoucherStatus={(id) => void toggleVoucherStatusHandler(id)}
      />
    </div>
  );
}

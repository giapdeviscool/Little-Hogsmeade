import { useState, useEffect } from 'react';
import { getMenuItemToppingGroups } from '@/api/menu-item.api';
import { X, Plus, Minus, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ToppingType {
  id: string;
  toppingGroupId: string;
  name: string;
  extraPrice: number;
  isActive: boolean;
}

export interface ToppingGroupWithToppings {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  toppingsCount: number;
  isAssigned: boolean;
  toppings: ToppingType[];
}

export interface SelectedTopping {
  toppingId: string;
  name: string;
  quantity: number;
  extraPrice: number;
}

interface ToppingSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItemId: string;
  menuItemName: string;
  initialToppings?: SelectedTopping[];
  onConfirm: (toppings: SelectedTopping[]) => void;
}

export function ToppingSelectionModal({
  isOpen,
  onClose,
  menuItemId,
  menuItemName,
  initialToppings = [],
  onConfirm,
}: ToppingSelectionModalProps) {
  const [groups, setGroups] = useState<ToppingGroupWithToppings[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [selectedToppings, setSelectedToppings] = useState<Record<string, SelectedTopping>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && menuItemId) {
      setLoading(true);
      setError('');
      getMenuItemToppingGroups(menuItemId)
        .then((res) => {
          console.log('Topping groups API response:', res.data);
          // Filter groups that are assigned to this menu item
          const assignedGroups = (res.data || []).filter(
            (g: ToppingGroupWithToppings) => g.isAssigned && g.toppings && g.toppings.length > 0
          );
          setGroups(assignedGroups);
          if (assignedGroups.length > 0) {
            setActiveTabId(assignedGroups[0].id);
          }
        })
        .catch((err) => {
          setError(err.message || 'Không thể tải nhóm topping.');
        })
        .finally(() => {
          setLoading(false);
        });

      // Map initial selected toppings
      const initialMap: Record<string, SelectedTopping> = {};
      initialToppings.forEach((t) => {
        initialMap[t.toppingId] = { ...t };
      });
      setSelectedToppings(initialMap);
    }
  }, [isOpen, menuItemId, initialToppings]);

  if (!isOpen) return null;

  const handleToggleTopping = (topping: ToppingType) => {
    setSelectedToppings((prev) => {
      const existing = prev[topping.id];
      const next = { ...prev };
      if (existing) {
        delete next[topping.id];
      } else {
        if (activeGroup?.maxSelect === 1) {
          activeGroup.toppings.forEach(t => {
            if (next[t.id]) {
              delete next[t.id];
            }
          });
        } else if (activeGroup && activeGroup.maxSelect > 0) {
          const currentGroupSelectedCount = activeGroup.toppings.reduce((total, t) => total + (prev[t.id]?.quantity || 0), 0);
          if (currentGroupSelectedCount >= activeGroup.maxSelect) {
            return prev;
          }
        }
        
        next[topping.id] = {
          toppingId: topping.id,
          name: topping.name,
          quantity: 1,
          extraPrice: topping.extraPrice,
        };
      }
      return next;
    });
  };

  const handleUpdateQuantity = (toppingId: string, delta: number) => {
    setSelectedToppings((prev) => {
      const existing = prev[toppingId];
      if (!existing) return prev;
      
      if (delta > 0 && activeGroup && activeGroup.maxSelect > 0) {
        const currentGroupSelectedCount = activeGroup.toppings.reduce((total, t) => total + (prev[t.id]?.quantity || 0), 0);
        if (currentGroupSelectedCount >= activeGroup.maxSelect) {
          return prev;
        }
      }

      const newQty = Math.max(1, existing.quantity + delta);
      return {
        ...prev,
        [toppingId]: {
          ...existing,
          quantity: newQty,
        },
      };
    });
  };

  const handleSave = () => {
    onConfirm(Object.values(selectedToppings));
    onClose();
  };

  const activeGroup = groups.find((g) => g.id === activeTabId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-[rgba(74,53,37,0.12)] p-6 shadow-xl max-h-[90vh] flex flex-col font-sans">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-[rgba(74,53,37,0.08)]">
          <div>
            <h3 className="text-lg font-bold text-coffee">Tùy chỉnh món ăn</h3>
            <p className="text-xs text-muted mt-0.5">{menuItemName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-muted hover:text-coffee hover:bg-beige rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 min-h-[300px]">
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted">
              Đang tải tùy chỉnh...
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center text-sm text-red-600">
              {error}
            </div>
          ) : groups.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted">
              Món ăn này không có tùy chọn topping.
            </div>
          ) : (
            <>
              {/* Category Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[rgba(74,53,37,0.08)]">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setActiveTabId(group.id)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-bold rounded-full transition-all whitespace-nowrap border',
                      activeTabId === group.id
                        ? 'bg-coffee border-coffee text-white'
                        : 'bg-cream border-[rgba(74,53,37,0.08)] text-muted hover:text-coffee hover:bg-beige'
                    )}
                  >
                    {group.name}
                  </button>
                ))}
              </div>

              {/* Toppings list for active group */}
              <div className="flex-1 flex flex-col gap-2">
                {(() => {
                  const currentGroupSelectedCount = activeGroup?.toppings.reduce((total, t) => total + (selectedToppings[t.id]?.quantity || 0), 0) || 0;
                  const isMaxReached = activeGroup && activeGroup.maxSelect > 0 ? currentGroupSelectedCount >= activeGroup.maxSelect : false;

                  return activeGroup?.toppings.map((topping) => {
                    const isSelected = !!selectedToppings[topping.id];
                    const currentQty = selectedToppings[topping.id]?.quantity || 0;
                    const disabled = !isSelected && activeGroup?.maxSelect !== 1 && isMaxReached;

                    return (
                      <div
                        key={topping.id}
                        onClick={() => !disabled && handleToggleTopping(topping)}
                        className={cn(
                          'flex justify-between items-center p-3 rounded-xl border transition-all select-none',
                          isSelected
                            ? 'bg-cream border-latte shadow-sm cursor-pointer'
                            : disabled
                              ? 'bg-gray-50 border-[rgba(74,53,37,0.04)] opacity-60 cursor-not-allowed'
                              : 'bg-white border-[rgba(74,53,37,0.08)] hover:bg-beige/30 cursor-pointer'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-5 h-5 rounded flex items-center justify-center border transition-all',
                              isSelected
                                ? 'bg-coffee border-coffee text-white'
                                : 'border-[rgba(74,53,37,0.2)] bg-white'
                            )}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-coffee">{topping.name}</span>
                            <span className="text-xs text-muted ml-2">
                              +{topping.extraPrice.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </div>

                        {/* Quantity Controls (Only shown if selected and maxSelect > 1) */}
                        {isSelected && activeGroup?.maxSelect !== 1 && (
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()} // Prevent toggling selection
                          >
                            <button
                              onClick={() => handleUpdateQuantity(topping.id, -1)}
                              className="w-6 h-6 rounded-md border border-line flex items-center justify-center text-coffee hover:bg-white active:scale-95 transition-all"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-xs w-4 text-center text-coffee">
                              {currentQty}
                            </span>
                            <button
                              onClick={() => !isMaxReached && handleUpdateQuantity(topping.id, 1)}
                              disabled={isMaxReached}
                              className={cn(
                                "w-6 h-6 rounded-md border flex items-center justify-center transition-all",
                                isMaxReached 
                                  ? "border-transparent text-muted/50 cursor-not-allowed bg-transparent"
                                  : "border-line text-coffee hover:bg-white active:scale-95"
                              )}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[rgba(74,53,37,0.08)] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 border border-[rgba(74,53,37,0.12)] hover:bg-beige text-coffee font-bold text-sm rounded-xl transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="flex-1 h-10 bg-gold hover:opacity-90 text-coffee font-bold text-sm rounded-xl transition-all shadow-sm"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import { Card } from "../../ui/Card";

interface DataTableProps<T> {
  data: T[];
  renderHeader: () => ReactNode;
  renderRow: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  colSpan?: number;
}

export function DataTable<T>({
  data,
  renderHeader,
  renderRow,
  emptyMessage = "Không có dữ liệu",
  colSpan = 1,
}: DataTableProps<T>) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-scroll">
        <table className="w-full border-collapse text-sm overflow-x-scroll">
          <thead className="bg-beige text-left text-sm font-semibold text-muted">
            {renderHeader()}
          </thead>
          <tbody>
            {data.map((item, index) => renderRow(item, index))}
            {data.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-10 text-center text-muted"
                  colSpan={colSpan}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import classNames from "classnames";
import { Loader } from "lucide-react";

export type GenericRow<T> = {
  [P in keyof T]: T[P];
};

type GenericColumn<T> = ColumnDef<GenericRow<T>>;

interface CustomTableProps<T> {
  rows: GenericRow<T>[];
  columns: GenericColumn<T>[];
  containerClassName?: string;
  title?: string;
  loading?: boolean;
}

export default function CustomTable<T>({
  rows,
  columns,
  containerClassName,
  title,
  loading
}: CustomTableProps<T>) {
  const table = useReactTable({
    defaultColumn: {
      enableResizing: false,
      size: 200
    },
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel()
  });

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader size={20} />
      </div>
    );
  }
  return (
    <div
      className={classNames(
        "relative h-full overflow-hidden overflow-x-auto rounded-xl bg-white p-2 shadow-lg sm:p-4",
        containerClassName
      )}
    >
      {title && (
        <div className="mb-1">
          <h2 className="text-xs font-bold text-gray-800 sm:text-lg">
            {title}
          </h2>
        </div>
      )}

      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-auto pb-5">
          <table className="min-w-full text-xs text-gray-800 sm:text-sm">
            <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-100 to-purple-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, idx) => (
                    <th
                      key={header.id}
                      className={classNames(
                        "border-b border-gray-200 px-2 font-semibold uppercase tracking-wide sm:px-6 sm:py-3",
                        "text-xs sm:text-xs",
                        idx === 0 ? "text-left" : "text-right",
                        "text-gray-700"
                      )}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors duration-150 even:bg-gray-50 hover:bg-blue-50"
                >
                  {row.getVisibleCells().map((cell, idx) => (
                    <td
                      key={cell.id}
                      className={classNames(
                        "border-b border-gray-100 px-2 py-1 sm:px-6 sm:py-5",
                        "text-xs sm:text-sm",
                        idx === 0 ? "text-left" : "text-right"
                      )}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

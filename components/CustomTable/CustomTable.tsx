import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";

export type GenericRow<T> = {
  [P in keyof T]: T[P];
};

type GenericColumn<T> = ColumnDef<GenericRow<T>>;

interface CustomTableProps<T> {
  rows: GenericRow<T>[];
  columns: GenericColumn<T>[];
  className?: string;
  title?: string;
}

export default function CustomTable<T>({
  rows,
  columns,
  className,
  title,
}: CustomTableProps<T>) {
  const table = useReactTable({
    defaultColumn: {
      enableResizing: false,
      size: 200,
    },
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div
      className={classNames(
        "relative overflow-x-auto rounded-xl shadow-lg bg-white p-2 sm:p-4 h-full",
        className
      )}
    >
      {title && (
        <div className="mb-1 ">
          <h2 className="text-xs sm:text-lg font-bold text-gray-800">
            {title}
          </h2>
        </div>
      )}

      <table className="min-w-full text-xs sm:text-sm text-gray-800">
        <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-100 to-purple-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, idx) => (
                <th
                  key={header.id}
                  className={classNames(
                    "px-2 sm:px-6 sm:py-3 font-semibold tracking-wide uppercase border-b border-gray-200",
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
      </table>
      <div className="max-h-[10vh] overflow-y-auto sm:max-h-none sm:overflow-visible">
        <table className="min-w-full text-xs sm:text-sm text-gray-800">
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="transition-colors duration-150 hover:bg-blue-50 even:bg-gray-50"
              >
                {row.getVisibleCells().map((cell, idx) => (
                  <td
                    key={cell.id}
                    className={classNames(
                      "px-2 py-1 sm:px-6 sm:py-3 border-b border-gray-100",
                      "text-xs sm:text-sm",
                      idx === 0 ? "text-left" : "text-right"
                    )}
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

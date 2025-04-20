import { cn } from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export type GenericRow<T> = {
  [P in keyof T]: T[P];
};

type GenericColumn<T> = ColumnDef<GenericRow<T>>;

interface CustomTableProps<T> {
  rows: GenericRow<T>[];
  columns: GenericColumn<T>[];
  className?: string;
}

export default function CustomTable<T>({
  rows,
  columns,
  className,
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
    <div className="static">
      <table
        className={cn(
          "w-full overflow-x-auto divide-y-2 divide-black bg-gray-200 border-2 border-black rounded-lg text-sm",
          className
        )}
      >
        <thead className="ltr:text-left rtl:text-right">
          {table.getHeaderGroups().map((header) => (
            <tr key={header.id} style={{ width: table.getCenterTotalSize() }}>
              {header.headers.map((header) => (
                <th
                  key={header.id}
                  className={`whitespace-nowrap px-4 py-2 font-medium text-gray-900`}
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
            <tr key={row.id} className="hover:bg-slate-100">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={`whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-center`}
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
  );
}

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface TableProps {
  children?: React.ReactNode;
  headers?: React.ReactNode[];
  rows?: React.ReactNode[][];
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, headers, rows, className = "" }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm scrollbar-thin">
      <table className={`w-full text-left text-xs border-collapse ${className}`}>
        {children ? (
          children
        ) : (
          <>
            {headers && (
              <TableHeader>
                <TableRow>
                  {headers.map((h, i) => (
                    <TableHead key={i}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
            )}
            {rows && (
              <tbody>
                {rows.map((row, rIdx) => (
                  <TableRow key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <TableCell key={cIdx}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </tbody>
            )}
          </>
        )}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider font-mono border-b border-slate-200 dark:border-slate-800">
      {children}
    </thead>
  );
};

export const TableRow: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string }> = ({
  children,
  onClick,
  className = "" }) => {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-slate-100 dark:border-slate-800/60 transition-colors ${
        onClick ? "hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
      } ${className}`}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "" }) => {
  return <th className={`p-3.5 font-semibold text-slate-700 dark:text-slate-300 ${className}`}>{children}</th>;
};

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "" }) => {
  return <td className={`p-3.5 text-slate-800 dark:text-slate-200 align-middle ${className}`}>{children}</td>;
};

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalRecords?: number;
  limit?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalRecords,
  limit = 10 }) => {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * limit + 1;
  const end = totalRecords ? Math.min(currentPage * limit, totalRecords) : currentPage * limit;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-900/60 border border-t-0 border-slate-200 dark:border-slate-800 rounded-b-xl text-xs text-slate-500 dark:text-slate-400">
      <div>
        {totalRecords !== undefined ? (
          <span>
            Showing <strong className="text-slate-900 dark:text-slate-100">{start}</strong> to{" "}
            <strong className="text-slate-900 dark:text-slate-100">{end}</strong> of{" "}
            <strong className="text-slate-900 dark:text-slate-100">{totalRecords}</strong> results
          </span>
        ) : (
          <span>
            Page <strong className="text-slate-900 dark:text-slate-100">{currentPage}</strong> of{" "}
            <strong className="text-slate-900 dark:text-slate-100">{totalPages}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white font-medium font-mono">
          {currentPage}
        </span>

        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

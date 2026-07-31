import React, { ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No data found.",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          paddingTop: "4rem",
          paddingBottom: "4rem",
          textAlign: "center",
          backgroundColor: "#ffffff",
          borderRadius: "0.5rem",
          border: "1px solid #e5e7eb",
        }}
      >
        <p
          style={{
            color: "#6b7280",
            fontSize: "1.125rem",
            lineHeight: "1.75rem",
          }}
        >
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "2rem",
        flex: 1,
        boxShadow:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        borderBottom: "1px solid #e5e7eb",
        borderRadius: "0.5rem",
        backgroundColor: "#ffffff",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            minWidth: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead style={{ backgroundColor: "#f9fafb" }}>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  scope="col"
                  className={col.className}
                  style={{
                    paddingLeft: "1.5rem",
                    paddingRight: "1.5rem",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                    fontSize: "0.75rem",
                    lineHeight: "1rem",
                    fontWeight: 500,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    textAlign: col.className ? undefined : "left",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ backgroundColor: "#ffffff" }}>
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                style={{
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                {columns.map((col, colIndex) => {
                  const content =
                    typeof col.accessor === "function"
                      ? col.accessor(item)
                      : (item[col.accessor] as ReactNode);

                  return (
                    <td
                      key={colIndex}
                      className={col.className}
                      style={{
                        paddingLeft: "1.5rem",
                        paddingRight: "1.5rem",
                        paddingTop: "1rem",
                        paddingBottom: "1rem",
                        whiteSpace: "nowrap",
                        fontSize: "0.875rem",
                        lineHeight: "1.25rem",
                        color: "#111827",
                        textAlign: col.className ? undefined : "left",
                      }}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
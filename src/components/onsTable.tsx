import React, { type ReactElement, type ReactNode } from "react";

export interface TableColumns {
  title: string;
}

interface TableProps {
  columns: TableColumns[];
  children: ReactNode;
  tableID?: string;
  tableCaption?: string;
}

const Table = ({ columns, children, tableCaption, tableID }: TableProps): ReactElement => {
  return (
    <>
      <table
        className="ons-table"
        id={tableID}
      >
        {tableCaption && <caption className="ons-table__caption">{tableCaption}</caption>}
        <thead className="ons-table__head">
          <tr className="ons-table__row">
            {columns.map(({ title }: TableColumns) => (
              <th
                scope="col"
                className="ons-table__header"
                key={title}
              >
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="ons-table__body">{children}</tbody>
      </table>
    </>
  );
};

export default Table;

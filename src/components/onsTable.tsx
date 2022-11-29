import React, { ReactElement } from "react";

export interface TableColumns {
    title: string,
}

interface ONSTable {
    columns: TableColumns[]
    children: ReactElement
    tableID?: string
    tableCaption?: string
}

export const ONSTable = ({ columns, children, tableCaption, tableID }: ONSTable): ReactElement => {
    return (
        <>
            <table
                className="ons-table"
                id={tableID}>
                {tableCaption && <caption className="ons-table__caption">{tableCaption}</caption>}
                <thead className="ons-table__head">
                    <tr className="ons-table__row">
                        {
                            columns.map(({ title }: TableColumns, index: number) => (
                                <th scope="col" className="ons-table__header" key={index}>{title}</th>
                            ))
                        }
                    </tr>
                </thead>
                <tbody className="ons-table__body">
                    {children}
                </tbody>
            </table>
        </>
    );
};

export default ONSTable;

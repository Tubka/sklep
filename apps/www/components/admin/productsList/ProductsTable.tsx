import type { DataTableCustomRenderProps, DenormalizedRow } from 'carbon-components-react';
import {
  Table,
  TableHead,
  TableRow,
  TableSelectAll,
  TableHeader,
  TableBody,
  TableSelectRow,
  TableCell,
  OverflowMenu,
  OverflowMenuItem,
} from 'carbon-components-react';
import React from 'react';

import { ProductsListCells } from './productsListCells/ProductsListCells';

export const ProductsTable = React.memo<
  DataTableCustomRenderProps & {
    readonly onDelete: (row: DenormalizedRow) => void;
  }
>(({ rows, headers, getHeaderProps, getTableProps, getRowProps, getSelectionProps, onDelete }) => {
  return (
    <Table {...getTableProps()} useZebraStyles={true}>
      <TableHead>
        <TableRow>
          <TableSelectAll {...getSelectionProps()} />
          {headers.map((header) => {
            return <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>;
          })}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => {
          return (
            <TableRow {...getRowProps({ row })}>
              <TableSelectRow {...getSelectionProps({ row })} />
              <ProductsListCells key={row.id} row={row} />
              <TableCell key="actions">
                <OverflowMenu>
                  <OverflowMenuItem itemText="Edit" />
                  <OverflowMenuItem
                    isDelete
                    itemText="Delete"
                    hasDivider
                    onClick={() => onDelete(row)}
                  />
                </OverflowMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
});
ProductsTable.displayName = 'ProductsTable';

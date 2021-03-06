import type { DenormalizedRow } from 'carbon-components-react';

export const getCellValue = <T extends string>({
  row,
  name,
}: {
  readonly row: DenormalizedRow;
  readonly name: T;
}) => {
  const cell = row.cells.find((c) => c.info.header === name);
  switch (typeof cell?.value) {
    case 'boolean':
      return cell?.value ? 'Yes' : 'No';
    case 'number':
    case 'string':
      return cell?.value;
    default:
      return '-';
  }
};

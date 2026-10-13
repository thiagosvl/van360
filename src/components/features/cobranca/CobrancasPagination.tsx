import { TablePagination, TablePaginationProps } from "@/components/ui/TablePagination";
import { memo } from "react";

export type CobrancasPaginationProps = TablePaginationProps;

export const CobrancasPagination = memo(function CobrancasPagination(props: CobrancasPaginationProps) {
  return <TablePagination options={[20, 50, 100, 250, 500]} {...props} />;
});

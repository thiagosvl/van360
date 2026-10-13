import { TablePagination, TablePaginationProps } from "@/components/ui/TablePagination";
import { memo } from "react";

export type ContratosPaginationProps = TablePaginationProps;

export const ContratosPagination = memo(function ContratosPagination(props: ContratosPaginationProps) {
  return <TablePagination options={[20, 50, 100]} {...props} />;
});

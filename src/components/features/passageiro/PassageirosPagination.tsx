import { TablePagination, TablePaginationProps } from "@/components/ui/TablePagination";
import { memo } from "react";

export type PassageirosPaginationProps = TablePaginationProps;

export const PassageirosPagination = memo(function PassageirosPagination(props: PassageirosPaginationProps) {
  return <TablePagination options={[50, 100, 250, 500]} {...props} />;
});

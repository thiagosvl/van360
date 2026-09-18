import type { AdminEstadoDemographics } from "@/services/api/admin/admin-financial.api";
import { useAdminGeographicDemographics } from "@/hooks/business/admin/useAdminGeographicDemographics";
import { AdminBrazilMapChart } from "./AdminBrazilMapChart";
import { AdminRegionDemographicsChart } from "./AdminRegionDemographicsChart";
import { AdminStateDemographicsChart } from "./AdminStateDemographicsChart";

interface AdminGeographicSectionProps {
  data: AdminEstadoDemographics[];
}

export function AdminGeographicSection({ data }: AdminGeographicSectionProps) {
  const { regioes, estadosMap, maxQuantidade, totalMotoristas } =
    useAdminGeographicDemographics(data);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
      <div className="lg:col-span-7 w-full min-w-0 flex flex-col">
        <AdminBrazilMapChart
          estadosMap={estadosMap}
          maxQuantidade={maxQuantidade}
          totalMotoristas={totalMotoristas}
        />
      </div>

      <div className="lg:col-span-5 w-full min-w-0 flex flex-col gap-6">
        <AdminRegionDemographicsChart
          regioes={regioes}
          totalMotoristas={totalMotoristas}
        />

        <AdminStateDemographicsChart data={data} />
      </div>
    </div>
  );
}

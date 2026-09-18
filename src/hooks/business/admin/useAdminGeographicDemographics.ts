import { useMemo } from "react";
import type { AdminEstadoDemographics } from "@/services/api/admin/admin-financial.api";
import { BRAZIL_STATES_DATA, type RegiaoBrasil } from "@/constants/brazilMapData";

export interface RegiaoDemographicsItem {
  regiao: RegiaoBrasil;
  quantidade: number;
  porcentagem: number;
  corBarra: string;
  badgeClass: string;
  estadosComMotoristas: number;
}

export interface EstadoDensidadeItem {
  uf: string;
  nome: string;
  regiao: RegiaoBrasil;
  quantidade: number;
  porcentagem: number;
  intensidade: number;
}

export interface GeographicDemographicsResult {
  totalMotoristas: number;
  maxQuantidade: number;
  regioes: RegiaoDemographicsItem[];
  estadosMap: Map<string, EstadoDensidadeItem>;
}

const REGIAO_COLORS: Record<RegiaoBrasil, string> = {
  Sudeste: "bg-blue-500",
  Sul: "bg-emerald-500",
  Nordeste: "bg-amber-500",
  "Centro-Oeste": "bg-purple-500",
  Norte: "bg-teal-500",
};

const REGIAO_BADGES: Record<RegiaoBrasil, string> = {
  Sudeste: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Sul: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Nordeste: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Centro-Oeste": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Norte: "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

const TODAS_REGIOES: RegiaoBrasil[] = [
  "Sudeste",
  "Nordeste",
  "Sul",
  "Centro-Oeste",
  "Norte",
];

export function useAdminGeographicDemographics(
  data: AdminEstadoDemographics[]
): GeographicDemographicsResult {
  return useMemo(() => {
    const rawMap = new Map<string, AdminEstadoDemographics>();
    let totalMotoristas = 0;
    let maxQuantidade = 0;

    for (const item of data) {
      rawMap.set(item.uf.toUpperCase(), item);
      totalMotoristas += item.quantidade;
      if (item.quantidade > maxQuantidade) {
        maxQuantidade = item.quantidade;
      }
    }

    const regioesContagem: Record<
      RegiaoBrasil,
      { quantidade: number; estadosComMotoristas: number }
    > = {
      Sudeste: { quantidade: 0, estadosComMotoristas: 0 },
      Nordeste: { quantidade: 0, estadosComMotoristas: 0 },
      Sul: { quantidade: 0, estadosComMotoristas: 0 },
      "Centro-Oeste": { quantidade: 0, estadosComMotoristas: 0 },
      Norte: { quantidade: 0, estadosComMotoristas: 0 },
    };

    const estadosMap = new Map<string, EstadoDensidadeItem>();

    for (const stateDef of BRAZIL_STATES_DATA) {
      const uf = stateDef.uf.toUpperCase();
      const raw = rawMap.get(uf);
      const quantidade = raw ? raw.quantidade : 0;
      const porcentagem =
        totalMotoristas > 0
          ? Math.round((quantidade / totalMotoristas) * 1000) / 10
          : 0;
      const intensidade =
        maxQuantidade > 0 ? quantidade / maxQuantidade : 0;

      estadosMap.set(uf, {
        uf,
        nome: stateDef.nome,
        regiao: stateDef.regiao,
        quantidade,
        porcentagem,
        intensidade,
      });

      regioesContagem[stateDef.regiao].quantidade += quantidade;
      if (quantidade > 0) {
        regioesContagem[stateDef.regiao].estadosComMotoristas += 1;
      }
    }

    const regioes: RegiaoDemographicsItem[] = TODAS_REGIOES.map((regiao) => {
      const cont = regioesContagem[regiao];
      const porcentagem =
        totalMotoristas > 0
          ? Math.round((cont.quantidade / totalMotoristas) * 1000) / 10
          : 0;

      return {
        regiao,
        quantidade: cont.quantidade,
        porcentagem,
        corBarra: REGIAO_COLORS[regiao],
        badgeClass: REGIAO_BADGES[regiao],
        estadosComMotoristas: cont.estadosComMotoristas,
      };
    }).sort((a, b) => b.quantidade - a.quantidade);

    return {
      totalMotoristas,
      maxQuantidade,
      regioes,
      estadosMap,
    };
  }, [data]);
}

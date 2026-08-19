import { supabase } from "@/integrations/supabase/client";

let activeSimulationInterval: any = null;

export const SANTA_MARIA_ROUTE_WAYPOINTS: [number, number][] = [
  [-47.98502, -16.01251], // Jardim de Infância 116 (Escola)
  [-47.9831, -16.0135],   // 1. Heitor Cândido
  [-47.9852, -16.0271],   // 2. Pedro Henrique
  [-47.9871, -16.0236],   // 3. Anthony Gabriel
  [-47.9862, -16.0191],   // 4. Arthur
  [-47.9812, -16.0146],   // 5. Ariane Rebeca
  [-47.9815, -16.0148],   // 6. Isadora Maria
  [-47.9834, -16.0138],   // 7. Eduardo Martins
  [-47.9752, -16.0176],   // 8. Maria Júlia
  [-47.9755, -16.0178],   // 9. Miguel Lopes
  [-47.9758, -16.0179],   // 10. Ana Karolyne
  [-47.9750, -16.0174],   // 11. Bernardo
  [-47.9751, -16.0175],   // 12. Carlos Eduardo
  [-47.9771, -16.0166],   // 13. Davi Lucas
  [-47.9774, -16.0168],   // 14. Emanuely
  [-47.9773, -16.0167],   // 15. Enzo Gabriel
  [-47.9854, -16.0128],   // 16. Gabriel Henrique
  [-47.98421, -16.01183], // Escola Classe 116
  [-47.9818, -16.0151],   // 17. Guilherme
  [-47.9819, -16.0152],   // 18. Helena
  [-47.9816, -16.0150],   // 19. Isaac
  [-47.9754, -16.0177],   // 20. João Miguel
  [-47.9752, -16.0176],   // 21. Júlia
  [-47.9758, -16.0179],   // 22. Lara
  [-47.9961, -16.0221],   // 23. Leonardo
  [-47.9965, -16.0224],   // 24. Lorenzo
  [-47.9968, -16.0227],   // 25. Lucas
  [-47.9966, -16.0225],   // 26. Luiza
  [-47.9967, -16.0226],   // 27. Manuela
  [-47.9972, -16.0228],   // 28. Maria Alice
  [-47.9970, -16.0227],   // 29. Maria Clara
  [-47.9975, -16.0232],   // 30. Maria Eduarda
  [-47.9963, -16.0223],   // 31. Maria Luiza
  [-47.99812, -16.02298], // CEF Santos Dumont (Escola)
  [-47.9968, -16.0227],   // 32. Matheus
  [-47.9792, -16.0156],   // 33. Melissa
  [-47.9758, -16.0179],   // 34. Nicolas
  [-47.9751, -16.0175],   // 35. Pedro Lucas
  [-47.9749, -16.0173],   // 36. Rafael
  [-47.9773, -16.0167],   // 37. Rebeca
  [-47.9856, -16.0129],   // 38. Samuel
  [-47.98502, -16.01251], // Retorno Jardim 116
  [-47.9848, -16.0124],   // 39. Sophia
  [-47.9854, -16.0128],   // 40. Theo
  [-47.9817, -16.0149],   // 41. Valentina
  [-47.9813, -16.0147],   // 42. Victor
  [-47.9815, -16.0148],   // 43. Vinicius
  [-47.9860, -16.0190],   // 44. Yasmin
  [-47.9866, -16.0195],   // 45. Alice
  [-47.9871, -16.0236],   // 46. Benício
  [-47.9868, -16.0234],   // 47. Cecília
  [-47.9852, -16.0271],   // 48. Daniel
  [-47.9832, -16.0246],   // 49. Gabriela
  [-47.9822, -16.0211],   // 50. Gael
  [-47.9842, -16.0201]    // 51. Joaquim
];

function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function resampleCoordinates(
  rawPoints: [number, number][],
  stepMeters = 8
): [number, number][] {
  if (rawPoints.length < 2) return rawPoints;

  const result: [number, number][] = [rawPoints[0]];

  for (let i = 0; i < rawPoints.length - 1; i++) {
    const [lng1, lat1] = rawPoints[i];
    const [lng2, lat2] = rawPoints[i + 1];
    const dist = calculateDistanceMeters(lat1, lng1, lat2, lng2);
    const steps = Math.max(1, Math.round(dist / stepMeters));

    for (let s = 1; s <= steps; s++) {
      const factor = s / steps;
      result.push([
        Number((lng1 + (lng2 - lng1) * factor).toFixed(6)),
        Number((lat1 + (lat2 - lat1) * factor).toFixed(6))
      ]);
    }
  }

  return result;
}

async function fetchLegRoadGeometry(
  start: [number, number],
  end: [number, number]
): Promise<[number, number][]> {
  const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM status ${res.status}`);
    const data = await res.json();
    const coords: [number, number][] = data.routes?.[0]?.geometry?.coordinates;
    if (Array.isArray(coords) && coords.length > 0) {
      return coords;
    }
  } catch {}
  return [start, end];
}

export function stopSimulation() {
  if (typeof window !== "undefined") {
    (window as any).__VAN360_DEV_SIMULATING__ = false;
  }
  if (activeSimulationInterval) {
    clearInterval(activeSimulationInterval);
    activeSimulationInterval = null;
    console.log("🛑 Simulação de GPS parada com sucesso!");
  }
}

export async function simulateRealRoadTrip(execucaoId?: string) {
  stopSimulation();
  if (typeof window !== "undefined") {
    (window as any).__VAN360_DEV_SIMULATING__ = true;
  }

  let targetId = execucaoId;
  if (!targetId && typeof window !== "undefined") {
    const pathParts = window.location.pathname.split("/");
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && lastPart.length > 10 && lastPart !== "carteirinha") {
      targetId = lastPart;
    }
  }

  if (!targetId) {
    const { data: activeExec } = await supabase
      .from("execucoes_rota")
      .select("id")
      .eq("status", "iniciada")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeExec?.id) {
      targetId = activeExec.id;
    }
  }

  if (!targetId) {
    console.error("Nenhuma execução ativa encontrada no momento.");
    return;
  }

  console.log(`📡 Conectando simulação à execução ativa: ${targetId}`);

  try {
    const rawWaypoints: [number, number][] = SANTA_MARIA_ROUTE_WAYPOINTS;

    // Deduplicate consecutive identical waypoints
    const waypoints: [number, number][] = [];
    for (const w of rawWaypoints) {
      if (waypoints.length === 0) {
        waypoints.push(w);
      } else {
        const prev = waypoints[waypoints.length - 1];
        if (Math.abs(prev[0] - w[0]) > 0.00005 || Math.abs(prev[1] - w[1]) > 0.00005) {
          waypoints.push(w);
        }
      }
    }

    console.log(`🗺️ Traçando malha viária real (curva por curva) para as ${waypoints.length} paradas de Santa Maria...`);

    // Fetch exact road geometries leg by leg (start -> end)
    const roadPoints: [number, number][] = [];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const legPoints = await fetchLegRoadGeometry(waypoints[i], waypoints[i + 1]);
      if (roadPoints.length > 0) {
        roadPoints.push(...legPoints.slice(1));
      } else {
        roadPoints.push(...legPoints);
      }
    }

    // Resample along streets every 6 meters for smooth driving (~35 km/h at 400ms tick)
    const allCoords = resampleCoordinates(roadPoints, 6);

    console.log(`🚀 Iniciando condução viária fluida com ${allCoords.length} nós de asfalto por Santa Maria...`);

    let index = 0;
    const channel = supabase.channel(`trip-tracking:${targetId}`, {
      config: {
        broadcast: { ack: false }
      }
    });

    const sendPing = (idx: number) => {
      const [lng, lat] = allCoords[idx];
      const nextCoord = allCoords[idx + 1] || allCoords[0];

      let heading: number | null = null;
      if (nextCoord) {
        const dLng = nextCoord[0] - lng;
        const dLat = nextCoord[1] - lat;
        heading = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI);
        if (heading < 0) heading += 360;
      }

      const pingPayload = {
        latitude: lat,
        longitude: lng,
        heading,
        speed: 35,
        accuracy: 5,
        timestamp: Date.now()
      };

      console.info(`[Simulator] 🚐 Posição #${idx + 1}/${allCoords.length} viária: [${lng}, ${lat}] (heading: ${heading}°)`);

      try {
        channel.send({
          type: "broadcast",
          event: "gps_ping",
          payload: pingPayload
        });
      } catch {}

      if (typeof window !== "undefined" && typeof (window as any).__VAN360_DISPATCH_MOCK_GPS_PING__ === "function") {
        (window as any).__VAN360_DISPATCH_MOCK_GPS_PING__(pingPayload);
      }
    };

    sendPing(0);
    index = 1;

    activeSimulationInterval = setInterval(() => {
      if (index >= allCoords.length) {
        console.log("🔄 Rota concluída. Reiniciando ciclo pelas 57 paradas de Santa Maria...");
        index = 0;
      }

      sendPing(index);
      index++;
    }, 400);
  } catch (err) {
    console.error("Falha ao processar paradas no simulador:", err);
  }
}

if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as any).__VAN360_SIMULATE_TRIP__ = simulateRealRoadTrip;
  (window as any).__VAN360_STOP_SIMULATION__ = stopSimulation;
}

interface CustomLegendProps {
  payload?: Array<{
    color: string;
    value: string;
    payload: {
      count: number;
      value: number;
    };
  }>;
}

export function CustomLegend({ payload = [] }: CustomLegendProps) {
  return (
    <ul className="flex flex-col gap-2 text-sm w-full max-w-[200px]">
      {payload.map((entry, index) => {
        const { color, value, payload: itemPayload } = entry;
        return (
          <li
            key={`item-${index}`}
            className="flex justify-between items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="">{value}</span>
              <span className="text-muted-foreground text-xs">
                ({itemPayload.count})
              </span>
            </div>
            <span className="font-semibold whitespace-nowrap">
              {itemPayload.value.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </li>
        );
      })}
    </ul>
  );
}


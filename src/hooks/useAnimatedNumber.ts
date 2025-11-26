import { useEffect, useState } from "react";

/**
 * Hook que anima um número de 0 até o valor final em 1 segundo
 * @param targetValue - Valor final a ser animado
 * @param duration - Duração da animação em milissegundos (padrão: 1000ms)
 * @returns Valor animado atual
 */
export function useAnimatedNumber(
  targetValue: number,
  duration: number = 1000
): number {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    // Se o valor for 0 ou negativo, não anima
    if (targetValue <= 0) {
      setAnimatedValue(0);
      return;
    }

    // Reseta para 0 quando o valor alvo muda
    setAnimatedValue(0);

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValue + (targetValue - startValue) * easeOut;
      setAnimatedValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Garante que o valor final seja exatamente o target
        setAnimatedValue(targetValue);
      }
    };

    const animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [targetValue, duration]);

  return animatedValue;
}


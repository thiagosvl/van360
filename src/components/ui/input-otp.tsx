"use client"

import * as React from "react"
import { Dot } from "lucide-react"
import { cn } from "@/lib/utils"

interface OTPContextValue {
  value: string
  onChange: (value: string) => void
  maxLength: number
  focusIndex: number
  setFocusIndex: (index: number) => void
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
}

const OTPContext = React.createContext<OTPContextValue | null>(null)

function useOTPContext() {
  const context = React.useContext(OTPContext)
  if (!context) throw new Error("OTP components must be used within InputOTP")
  return context
}

const InputOTP = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"div"> & {
    value?: string
    onChange?: (value: string) => void
    maxLength?: number
    disabled?: boolean
    containerClassName?: string
  }
>(({ value = "", onChange, maxLength = 6, className, containerClassName, children, disabled, ...props }, ref) => {
  const [focusIndex, setFocusIndex] = React.useState(-1)
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    if (disabled) return
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, maxLength)
    if (pastedData) {
      onChange?.(pastedData)
      const nextIndex = Math.min(pastedData.length, maxLength - 1)
      inputRefs.current[nextIndex]?.focus()
    }
  }

  // Compatibilidade com react-hook-form
  React.useImperativeHandle(ref, () => inputRefs.current[0] as HTMLInputElement)

  return (
    <OTPContext.Provider value={{ value, onChange: (v) => onChange?.(v), maxLength, focusIndex, setFocusIndex, inputRefs }}>
      <div 
        className={cn("flex items-center gap-2", containerClassName, className)}
        onPaste={handlePaste}
        {...props}
      >
        {children}
      </div>
    </OTPContext.Provider>
  )
})
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center gap-1 sm:gap-2 w-full justify-between sm:justify-center", className)} {...props} />
))
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"input"> & { index: number }
>(({ index, className, onFocus, onBlur, onKeyDown, disabled, ...props }, ref) => {
  const { value, focusIndex, setFocusIndex, inputRefs, onChange, maxLength } = useOTPContext()
  const char = (value || "")[index] || ""
  const isActive = focusIndex === index
  const hasFakeCaret = isActive && !char

  const handleInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    const rawValue = e.target.value.replace(/\D/g, "")
    
    // Se for preenchimento de código completo (comum em SMS auto-fill/one-time-code)
    if (rawValue.length > 1) {
      const fullValue = rawValue.slice(0, maxLength)
      onChange(fullValue)
      
      if (fullValue.length >= maxLength) {
        // Se preencheu tudo, remove o foco para sinalizar término e fechar teclado mobile
        inputRefs.current[index]?.blur()
      } else {
        // Se colou parcial, pula para o próximo slot
        inputRefs.current[fullValue.length]?.focus()
      }
      return
    }

    const inputVal = rawValue.slice(-1)
    const currentChars = (value || "      ").split("")
    const chars = Array.from({ length: maxLength }, (_, i) => currentChars[i] || " ")
    chars[index] = inputVal
    const finalValue = chars.join("")
    
    onChange(finalValue)

    // Pulo Inteligente Aprimorado
    if (inputVal) {
      // 1. Procura o primeiro slot vazio À FRENTE do atual
      let targetIdx = -1
      for (let i = index + 1; i < maxLength; i++) {
        if (!chars[i] || chars[i] === " ") {
          targetIdx = i
          break
        }
      }
      
      // 2. Se não achou à frente, procura o primeiro vazio QUALQUER desde o início
      if (targetIdx === -1) {
        for (let i = 0; i < maxLength; i++) {
          if (!chars[i] || chars[i] === " ") {
            targetIdx = i
            break
          }
        }
      }
      
      // 3. Só muda o foco se de fato encontrou um campo VAZIO.
      // Se todos estiverem preenchidos (targetIdx === -1), mantemos o foco onde está (ou blur se preferir).
      if (targetIdx !== -1 && targetIdx !== index) {
        inputRefs.current[targetIdx]?.focus()
      } else if (targetIdx === -1) {
        // Opcional: blur se completar o último vazio manualmente
        inputRefs.current[index]?.blur()
      }
    }
  }

  const handleInternalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return
    if (e.key === "Backspace") {
      if ((!char || char === " ") && index > 0) {
        inputRefs.current[index - 1]?.focus()
        setTimeout(() => inputRefs.current[index - 1]?.select(), 0)
      } else {
        const currentChars = (value || "      ").split("")
        const chars = Array.from({ length: maxLength }, (_, i) => currentChars[i] || " ")
        chars[index] = " "
        onChange(chars.join(""))
      }
    }
    onKeyDown?.(e)
  }

  return (
    <div className="relative">
      <input
        ref={(el) => {
          inputRefs.current[index] = el
          if (typeof ref === "function") ref(el)
          else if (ref) (ref as any).current = el
        }}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={index === 0 ? 6 : 1}
        value={char === " " ? "" : char}
        autoComplete="one-time-code"
        spellCheck={false}
        onChange={handleInternalChange}
        onKeyDown={handleInternalKeyDown}
        onClick={(e) => {
          if (disabled) return
          e.currentTarget.focus()
          e.currentTarget.select()
        }}
        onFocus={(e) => {
          if (disabled) return
          setFocusIndex(index)
          onFocus?.(e)
          e.currentTarget.select()
        }}
        onBlur={(e) => {
          setFocusIndex(-1)
          onBlur?.(e)
        }}
        onContextMenu={(e) => e.preventDefault()}
        disabled={disabled}
        className={cn(
          "flex h-12 w-9 sm:h-16 sm:w-14 items-center justify-center border border-input text-lg transition-all rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-[#1a3a5c] focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          "caret-transparent",
          isActive && "z-10 ring-2 ring-[#1a3a5c] ring-offset-background border-[#1a3a5c]",
          className
        )}
        style={{
          WebkitTouchCallout: "none",
        } as React.CSSProperties}
        {...props}
      />
      {hasFakeCaret && !disabled && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-[#1a3a5c] duration-1000" />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Dot />
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }

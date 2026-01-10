import { Form, FormField } from "@/components/ui/form";
import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { MoneyInput } from "../MoneyInput";

// Mock do componente Form para poder testar o MoneyInput dentro do contexto
const TestWrapper = ({ 
  children
}: { 
  children: (field: any) => React.ReactNode
}) => {
  const form = useForm({
    defaultValues: {
      valor: ""
    }
  });

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="valor"
        render={({ field }) => (
          <>
            {children(field)}
          </>
        )}
      />
    </Form>
  );
};

describe("MoneyInput Component", () => {
  it("should render with the correct label", () => {
    render(
      <TestWrapper>
        {(field) => <MoneyInput field={field} label="Valor Mensalidade" />}
      </TestWrapper>
    );
    
    expect(screen.getByText("Valor Mensalidade")).toBeInTheDocument();
  });

  it("should show dollar sign (or default mask) placeholder if defined", () => {
    render(
      <TestWrapper>
        {(field) => <MoneyInput field={field} label="Valor" />}
      </TestWrapper>
    );
    
    const input = screen.getByPlaceholderText("R$ 0,00");
    expect(input).toBeInTheDocument();
  });
});

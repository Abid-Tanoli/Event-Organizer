import * as React from "react";
import { FormProvider, type UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

const Form = FormProvider;

function FormField<T extends Record<string, any>>({ form, name, children }: { form: UseFormReturn<T>; name: keyof T & string; children: React.ReactNode }) {
  return <div data-field={name}>{children}</div>;
}

const FormItem = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-2", className)} {...props} />
);

const FormMessage = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm font-medium text-destructive", className)} {...props}>{children}</p>
);

export { Form, FormField, FormItem, FormMessage };
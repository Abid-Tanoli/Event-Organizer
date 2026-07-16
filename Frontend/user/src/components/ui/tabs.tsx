import * as React from "react";
import { cn } from "@/lib/utils";

const Tabs = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("space-y-4", className)} {...props} />;
const TabsList = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1", className)} {...props} />;
const TabsTrigger = ({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-colors hover:bg-background", className)} {...props} />;
const TabsContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("mt-2", className)} {...props} />;

export { Tabs, TabsList, TabsTrigger, TabsContent };
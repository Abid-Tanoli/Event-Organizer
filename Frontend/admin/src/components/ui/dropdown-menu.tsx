import * as React from "react";
import { cn } from "@/lib/utils";

const DropdownMenu = ({ children }: { children: React.ReactNode }) => <div className="relative inline-block">{children}</div>;
const DropdownMenuTrigger = ({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button className={cn(className)} {...props} />;
const DropdownMenuContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("absolute right-0 z-50 mt-2 min-w-40 rounded-md border bg-popover p-1 text-popover-foreground shadow-md", className)} {...props} />;
const DropdownMenuItem = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("cursor-pointer rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent", className)} {...props} />;

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };
import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const Sheet = Dialog;
const SheetContent = ({ className, ...props }: React.ComponentProps<typeof DialogContent>) => (
  <DialogContent className={cn("left-auto right-0 top-0 h-full max-w-sm translate-x-0 translate-y-0 rounded-none", className)} {...props} />
);
const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("space-y-2 text-left", className)} {...props} />;
const SheetTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className={cn("text-lg font-semibold", className)} {...props} />;

export { Sheet, SheetContent, SheetHeader, SheetTitle };
import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react";
import { cn } from "@/shared/lib/utils";

export const BottomSheetRoot = BaseDialog.Root;
export const BottomSheetTrigger = BaseDialog.Trigger;

export const BottomSheetContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseDialog.Popup> & { children: React.ReactNode }
>(({ className, children, ...props }, ref) => (
  <BaseDialog.Portal>
    <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[starting-style]:opacity-0 transition-opacity duration-300" />
    <BaseDialog.Popup
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-xl border bg-background",
        "data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full transition-transform duration-300 ease-out",
        className
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </BaseDialog.Popup>
  </BaseDialog.Portal>
));
BottomSheetContent.displayName = "BottomSheetContent";

export const BottomSheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left px-6 py-4", className)}
    {...props}
  />
);

export const BottomSheetTitle = React.forwardRef<
  HTMLHeadingElement,
  BaseDialog.TitleProps
>(({ className, ...props }, ref) => (
  <BaseDialog.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
BottomSheetTitle.displayName = "BottomSheetTitle";

export const BottomSheetClose = BaseDialog.Close;

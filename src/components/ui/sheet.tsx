
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 mobile-safe-bottom",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom rounded-t-[20px]",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
  VariantProps<typeof sheetVariants> { }

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => {
  const [dragStartY, setDragStartY] = React.useState<number | null>(null);
  const [dragCurrentY, setDragCurrentY] = React.useState<number | null>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  
  // Allow touch gestures to close bottom sheets
  React.useEffect(() => {
    const content = contentRef.current;
    if (!content || side !== "bottom") return;
    
    const handleTouchStart = (e: TouchEvent) => {
      setDragStartY(e.touches[0].clientY);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (dragStartY === null) return;
      setDragCurrentY(e.touches[0].clientY);
      
      // Only allow dragging down
      const dragDistance = e.touches[0].clientY - dragStartY;
      if (dragDistance > 0) {
        content.style.transform = `translateY(${dragDistance}px)`;
        content.style.transition = 'none';
      }
    };
    
    const handleTouchEnd = () => {
      if (dragStartY === null || dragCurrentY === null) return;
      
      const dragDistance = dragCurrentY - dragStartY;
      content.style.transition = 'all 0.3s ease';
      
      // If dragged more than 100px or 40% of height, close the sheet
      if (dragDistance > 100 || dragDistance > content.clientHeight * 0.4) {
        props.onPointerDownOutside?.(new Event('pointerdown') as any);
      } else {
        content.style.transform = '';
      }
      
      setDragStartY(null);
      setDragCurrentY(null);
    };
    
    content.addEventListener('touchstart', handleTouchStart);
    content.addEventListener('touchmove', handleTouchMove);
    content.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      content.removeEventListener('touchstart', handleTouchStart);
      content.removeEventListener('touchmove', handleTouchMove);
      content.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragStartY, dragCurrentY, side, props]);
  
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={(el) => {
          // Forward the ref
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
          contentRef.current = el;
        }}
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {side === "bottom" && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-muted rounded-full opacity-50" />
        )}
        {children}
        <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
})
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet, SheetClose,
  SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger
}


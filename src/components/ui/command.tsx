import * as React from "react"
import { cn } from "@/lib/utils"

interface CommandProps {
  children: React.ReactNode;
  className?: string;
}

export function Command({ children, className }: CommandProps) {
  return (
    <div className={cn("relative rounded-md", className)}>
      {children}
    </div>
  )
}

interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  onValueChange?: (value: string) => void;
}

export function CommandInput({ className, error, onValueChange, ...props }: CommandInputProps) {
  return (
    <div className="flex items-center px-3">
      <input
        {...props}
        onChange={(e) => onValueChange?.(e.target.value)}
        className={cn(
          "flex h-10 w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 border border-gray-200",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "placeholder:text-gray-500",
          error && "ring-2 ring-red-500 border-transparent",
          className
        )}
      />
    </div>
  )
}

interface CommandListProps {
  children: React.ReactNode;
  className?: string;
}

export function CommandList({ children, className }: CommandListProps) {
  return (
    <div className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden py-2", className)}>
      {children}
    </div>
  )
}

interface CommandEmptyProps {
  children: React.ReactNode;
}

export function CommandEmpty({ children }: CommandEmptyProps) {
  return (
    <div className="py-6 text-center text-sm text-gray-500">
      {children}
    </div>
  )
}

interface CommandGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function CommandGroup({ children, className }: CommandGroupProps) {
  return (
    <div className={cn("overflow-hidden px-2", className)}>
      {children}
    </div>
  )
}

interface CommandItemProps {
  children: React.ReactNode;
  className?: string;
  onSelect?: () => void;
}

export function CommandItem({ children, className, onSelect }: CommandItemProps) {
  return (
    <div
      role="button"
      onClick={onSelect}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100",
        className
      )}
    >
      {children}
    </div>
  )
}

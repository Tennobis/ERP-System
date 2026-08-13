import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface SelectWithOtherOption {
  value: string
  label: string
}

export interface SelectWithOtherProps {
  value?: string
  onValueChange?: (value: string) => void
  options: SelectWithOtherOption[]
  otherValue?: string
  onOtherValueChange?: (value: string) => void
  placeholder?: string
  otherPlaceholder?: string
  otherLabel?: string
  className?: string
  selectClassName?: string
  inputClassName?: string
  label?: string
  required?: boolean
  disabled?: boolean
  otherOptionValue?: string // The value used for "Other" option (default: "other")
  otherOptionLabel?: string // The label shown for "Other" option (default: "Other")
}

/**
 * A Select component that shows an input field when "Other" is selected.
 * Can be used standalone or with React Hook Form.
 */
export const SelectWithOther = React.forwardRef<HTMLDivElement, SelectWithOtherProps>(
  (
    {
      value = "",
      onValueChange,
      options,
      otherValue = "",
      onOtherValueChange,
      placeholder = "Select an option...",
      otherPlaceholder = "Enter custom value...",
      otherLabel = "Custom Value",
      className,
      selectClassName,
      inputClassName,
      label,
      required = false,
      disabled = false,
      otherOptionValue = "other",
      otherOptionLabel = "Other",
    },
    ref
  ) => {
    const isOtherSelected = value === otherOptionValue
    const [isOpen, setIsOpen] = React.useState(false)

    const handleSelectChange = (newValue: string) => {
      if (onValueChange) {
        onValueChange(newValue)
      }
      // Clear other value when switching away from "Other"
      if (newValue !== otherOptionValue && onOtherValueChange) {
        onOtherValueChange("")
      }
      setIsOpen(false)
    }

    const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onOtherValueChange) {
        onOtherValueChange(e.target.value)
      }
    }

    const handleBackToSelect = () => {
      if (onValueChange) {
        onValueChange("")
      }
      if (onOtherValueChange) {
        onOtherValueChange("")
      }
    }

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        handleBackToSelect()
      }
    }

    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {label && (
          <Label className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
            {label}
          </Label>
        )}
        {isOtherSelected ? (
          <div className="relative">
            <Input
              value={otherValue}
              onChange={handleOtherInputChange}
              onKeyDown={handleInputKeyDown}
              placeholder={otherPlaceholder}
              className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                inputClassName || selectClassName
              )}
              disabled={disabled}
              required={required}
              autoFocus
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={handleBackToSelect}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Select
            value={value}
            onValueChange={handleSelectChange}
            open={isOpen}
            onOpenChange={setIsOpen}
            disabled={disabled}
          >
            <SelectTrigger className={selectClassName}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
              <SelectItem value={otherOptionValue}>{otherOptionLabel}</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    )
  }
)
SelectWithOther.displayName = "SelectWithOther"

/**
 * React Hook Form compatible version using FormField
 */
export interface SelectWithOtherFormFieldProps extends Omit<SelectWithOtherProps, "value" | "onValueChange" | "otherValue" | "onOtherValueChange"> {
  name: string
  otherName?: string // Separate field name for the "other" value. If not provided, uses `${name}Other`
  control?: any // From react-hook-form
}

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"

export const SelectWithOtherFormField = React.forwardRef<
  HTMLDivElement,
  SelectWithOtherFormFieldProps
>(
  (
    {
      name,
      otherName,
      control,
      options,
      placeholder = "Select an option...",
      otherPlaceholder = "Enter custom value...",
      otherLabel = "Custom Value",
      className,
      selectClassName,
      inputClassName,
      label,
      required = false,
      disabled = false,
      otherOptionValue = "other",
      otherOptionLabel = "Other",
      ...rest
    },
    ref
  ) => {
    const otherFieldName = otherName || `${name}Other`

    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => {
          const isOtherSelected = field.value === otherOptionValue
          const [isOpen, setIsOpen] = React.useState(false)

          return (
            <FormItem ref={ref} className={cn("space-y-2", className)}>
              {label && (
                <FormLabel>
                  {label}
                  {required && <span className="text-destructive ml-0.5">*</span>}
                </FormLabel>
              )}
              <FormControl>
                {isOtherSelected ? (
                  <FormField
                    control={control}
                    name={otherFieldName}
                    render={({ field: otherField }) => (
                      <div className="relative">
                        <Input
                          value={otherField.value || ""}
                          onChange={otherField.onChange}
                          placeholder={otherPlaceholder}
                          className={cn(
                            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                            inputClassName || selectClassName
                          )}
                          disabled={disabled}
                          required={required}
                          autoFocus
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                          onClick={() => {
                            field.onChange("")
                            otherField.onChange("")
                          }}
                          disabled={disabled}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  />
                ) : (
                  <Select
                    value={field.value || ""}
                    onValueChange={(newValue) => {
                      field.onChange(newValue)
                    }}
                    open={isOpen}
                    onOpenChange={setIsOpen}
                    disabled={disabled}
                  >
                    <SelectTrigger className={selectClassName}>
                      <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                      <SelectItem value={otherOptionValue}>{otherOptionLabel}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }}
      />
    )
  }
)
SelectWithOtherFormField.displayName = "SelectWithOtherFormField"


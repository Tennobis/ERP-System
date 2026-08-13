/**
 * Example usage of SelectWithOther component
 * 
 * This file demonstrates two ways to use the SelectWithOther component:
 * 1. Standalone usage (without React Hook Form)
 * 2. With React Hook Form (using FormField)
 */

import { useState } from "react"
import { useForm } from "react-hook-form"
import { SelectWithOther, SelectWithOtherFormField } from "./select-with-other"
import { Button } from "./button"
import { Form } from "./form"

// ============================================
// Example 1: Standalone Usage
// ============================================
export function StandaloneExample() {
  const [department, setDepartment] = useState("")
  const [departmentOther, setDepartmentOther] = useState("")

  const departmentOptions = [
    { value: "construction", label: "Construction" },
    { value: "design", label: "Design" },
    { value: "management", label: "Management" },
    { value: "admin", label: "Admin" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalValue = department === "other" ? departmentOther : department
    console.log("Selected department:", finalValue)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SelectWithOther
        label="Department"
        value={department}
        onValueChange={setDepartment}
        otherValue={departmentOther}
        onOtherValueChange={setDepartmentOther}
        options={departmentOptions}
        placeholder="Select department"
        otherPlaceholder="Enter department name"
        required
      />
      <Button type="submit">Submit</Button>
    </form>
  )
}

// ============================================
// Example 2: With React Hook Form
// ============================================
interface FormData {
  department: string
  departmentOther?: string
  status: string
  statusOther?: string
}

export function ReactHookFormExample() {
  const form = useForm<FormData>({
    defaultValues: {
      department: "",
      status: "",
    },
  })

  const departmentOptions = [
    { value: "construction", label: "Construction" },
    { value: "design", label: "Design" },
    { value: "management", label: "Management" },
    { value: "admin", label: "Admin" },
  ]

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "on-leave", label: "On Leave" },
  ]

  const onSubmit = (data: FormData) => {
    // Get the final value (either selected option or custom value)
    const department = data.department === "other" ? data.departmentOther : data.department
    const status = data.status === "other" ? data.statusOther : data.status
    
    console.log("Form data:", { department, status })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <SelectWithOtherFormField
          name="department"
          control={form.control}
          label="Department"
          options={departmentOptions}
          placeholder="Select department"
          otherPlaceholder="Enter department name"
          required
        />

        <SelectWithOtherFormField
          name="status"
          control={form.control}
          label="Status"
          options={statusOptions}
          placeholder="Select status"
          otherPlaceholder="Enter status"
          otherLabel="Custom Status"
          required
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

// ============================================
// Example 3: Custom "Other" option value and label
// ============================================
export function CustomOtherOptionExample() {
  const [category, setCategory] = useState("")
  const [categoryOther, setCategoryOther] = useState("")

  const categoryOptions = [
    { value: "material", label: "Material" },
    { value: "equipment", label: "Equipment" },
    { value: "service", label: "Service" },
  ]

  return (
    <SelectWithOther
      label="Category"
      value={category}
      onValueChange={setCategory}
      otherValue={categoryOther}
      onOtherValueChange={setCategoryOther}
      options={categoryOptions}
      placeholder="Select category"
      otherPlaceholder="Specify category"
      otherOptionValue="custom" // Custom value for "Other" option
      otherOptionLabel="Specify Custom" // Custom label for "Other" option
      required
    />
  )
}


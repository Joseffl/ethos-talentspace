"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { X, Plus } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RequiredLabelIcon } from "@/components/RequiredLabelIcon"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { productSchema } from "../schema/products"
import { ProductStatus, productStatuses } from "@/drizzle/schema"
import { createProduct, updateProduct } from "../actions/products"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/custom/multi-select"
import { toast } from "sonner"

export function ProductForm({
  product,
  courses,
  categories,
}: {
  product?: {
    id: string
    name: string
    description: string
    priceInDollars: number
    imageUrl: string
    status: ProductStatus
    courseIds: string[]
    categoryId?: string | null
    prerequisites?: string[]
    learningOutcomes?: string[]
  }
  courses: {
    id: string
    name: string
  }[]
  categories: {
    id: string
    name: string
  }[]
}) {
  const [prerequisiteInput, setPrerequisiteInput] = useState("")
  const [outcomeInput, setOutcomeInput] = useState("")

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: product ?? {
      name: "",
      description: "",
      courseIds: [],
      imageUrl: "",
      priceInDollars: 0,
      status: "private",
      categoryId: null,
      prerequisites: [],
      learningOutcomes: [],
    },
  })

  const prerequisites = form.watch("prerequisites")
  const learningOutcomes = form.watch("learningOutcomes")

  const addPrerequisite = () => {
    if (prerequisiteInput.trim()) {
      form.setValue("prerequisites", [...prerequisites, prerequisiteInput.trim()])
      setPrerequisiteInput("")
    }
  }

  const removePrerequisite = (index: number) => {
    form.setValue("prerequisites", prerequisites.filter((_, i) => i !== index))
  }

  const addOutcome = () => {
    if (outcomeInput.trim()) {
      form.setValue("learningOutcomes", [...learningOutcomes, outcomeInput.trim()])
      setOutcomeInput("")
    }
  }

  const removeOutcome = (index: number) => {
    form.setValue("learningOutcomes", learningOutcomes.filter((_, i) => i !== index))
  }

 const onSubmit = async (values: z.infer<typeof productSchema>) => {
  const action =
    product == null ? createProduct : updateProduct.bind(null, product.id)
  const data = await action(values)
  if (data?.error) {
    toast.error(data.message || "Something went wrong!")
  } else {
    toast.success(data.message || "Course created successfully!")
    form.reset()
  }
}

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-6 flex-col"
      >
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 items-start">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <RequiredLabelIcon />
                  Name
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priceInDollars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <RequiredLabelIcon />
                  Price
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    step={1}
                    min={0}
                    onChange={e =>
                      field.onChange(
                        isNaN(e.target.valueAsNumber)
                          ? ""
                          : e.target.valueAsNumber
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <RequiredLabelIcon />
                  Image Url
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {productStatuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <RequiredLabelIcon />
                  Category
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="courseIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Included Courses</FormLabel>
              <FormControl>
                <MultiSelect
                  selectPlaceholder="Select courses"
                  searchPlaceholder="Search courses"
                  options={courses}
                  getLabel={c => c.name}
                  getValue={c => c.id}
                  selectedValues={field.value}
                  onSelectedValuesChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <RequiredLabelIcon />
                Description
              </FormLabel>
              <FormControl>
                <Textarea className="min-h-20 resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prerequisites"
          render={() => (
            <FormItem>
              <FormLabel>Prerequisites</FormLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={prerequisiteInput}
                    onChange={(e) => setPrerequisiteInput(e.target.value)}
                    placeholder="Add a prerequisite..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addPrerequisite()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addPrerequisite}
                    size="icon"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {prerequisites.map((prereq, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span className="text-sm">{prereq}</span>
                      <Button
                        type="button"
                        onClick={() => removePrerequisite(index)}
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="learningOutcomes"
          render={() => (
            <FormItem>
              <FormLabel>Learning Outcomes</FormLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={outcomeInput}
                    onChange={(e) => setOutcomeInput(e.target.value)}
                    placeholder="Add a learning outcome..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addOutcome()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addOutcome}
                    size="icon"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {learningOutcomes.map((outcome, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span className="text-sm">{outcome}</span>
                      <Button
                        type="button"
                        onClick={() => removeOutcome(index)}
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="self-end">
          <Button disabled={form.formState.isSubmitting} type="submit">
            Save
          </Button>
        </div>
      </form>
    </Form>
  )
}
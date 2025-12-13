import { z } from 'zod';

// Core Category Schema
export const CategorySchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, 'Kategorinavn er påkrevd')
    .max(50, 'Kategorinavn kan ikke være lengre enn 50 tegn'),
  description: z.string().max(200, 'Beskrivelse kan ikke være lengre enn 200 tegn').optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Ugyldig hex-farge')
    .default('#3B82F6'),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
});

// Category Form Data Schema (for forms)
export const CategoryFormDataSchema = z.object({
  name: z
    .string()
    .min(1, 'Kategorinavn er påkrevd')
    .max(50, 'Kategorinavn kan ikke være lengre enn 50 tegn'),
  description: z.string().max(200, 'Beskrivelse kan ikke være lengre enn 200 tegn').default(''),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Ugyldig hex-farge')
    .default('#3B82F6'),
});

// Category Creation Data Schema
export const CategoryCreationDataSchema = z.object({
  name: z
    .string()
    .min(1, 'Kategorinavn er påkrevd')
    .max(50, 'Kategorinavn kan ikke være lengre enn 50 tegn'),
  description: z.string().max(200, 'Beskrivelse kan ikke være lengre enn 200 tegn').optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Ugyldig hex-farge')
    .default('#3B82F6'),
  isActive: z.boolean().default(true),
});

// Category Update Schema
export const CategoryUpdateSchema = CategorySchema.partial().omit({
  id: true,
  createdAt: true,
});

// Category with Usage Schema
export const CategoryWithUsageSchema = CategorySchema.extend({
  usageCount: z.number().min(0).default(0),
  lastUsed: z.date().optional(),
});

// Category Filter Schema
export const CategoryFilterSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});

// Predefined colors schema
export const PredefinedColorsSchema = z.array(z.string().regex(/^#[0-9A-F]{6}$/i)).default([
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
]);

// Export types
export type Category = z.infer<typeof CategorySchema>;
export type CategoryFormData = z.infer<typeof CategoryFormDataSchema>;
export type CategoryCreationData = z.infer<typeof CategoryCreationDataSchema>;
export type CategoryUpdate = z.infer<typeof CategoryUpdateSchema>;
export type CategoryWithUsage = z.infer<typeof CategoryWithUsageSchema>;
export type CategoryFilter = z.infer<typeof CategoryFilterSchema>;
export type PredefinedColors = z.infer<typeof PredefinedColorsSchema>;

// Validation functions
export const validateCategory = (data: unknown): Category => {
  return CategorySchema.parse(data);
};

export const validateCategoryFormData = (data: unknown): CategoryFormData => {
  return CategoryFormDataSchema.parse(data);
};

export const validateCategoryCreationData = (data: unknown): CategoryCreationData => {
  return CategoryCreationDataSchema.parse(data);
};

export const validateCategoryUpdate = (data: unknown): CategoryUpdate => {
  return CategoryUpdateSchema.parse(data);
};

// Safe parsing functions
export const safeParsCategory = (data: unknown) => {
  return CategorySchema.safeParse(data);
};

export const safeParseCategoryFormData = (data: unknown) => {
  return CategoryFormDataSchema.safeParse(data);
};

export const safeParseCategoryCreationData = (data: unknown) => {
  return CategoryCreationDataSchema.safeParse(data);
};

// Utility functions
export const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

export const getPredefinedColors = (): string[] => {
  return PredefinedColorsSchema.parse([]);
};

// Category name validation (for checking duplicates)
export const validateCategoryName = (
  name: string,
  existingCategories: Category[],
  excludeId?: string
): boolean => {
  const trimmedName = name.trim().toLowerCase();
  return !existingCategories.some(
    (cat) => cat.name.toLowerCase() === trimmedName && cat.id !== excludeId && cat.isActive
  );
};

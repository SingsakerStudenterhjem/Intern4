import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, User } from 'lucide-react';
import {
  TaskCreationModalProps,
  FormErrors,
  TaskFormData,
  validateTaskFormData,
  safeParseTaskFormData,
  TaskCreationData,
  validateTaskCreationData,
} from '../../../../shared/types/regi/tasks';

const TaskCreationModal: React.FC<TaskCreationModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  categories,
  currentUser,
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    taskName: '',
    category: '',
    description: '',
    deadline: '',
    hourEstimate: '',
    maxParticipants: '1', // Default to 1 participant required
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        taskName: '',
        category: categories.length > 0 ? categories[0].name : '',
        description: '',
        deadline: '',
        hourEstimate: '',
        maxParticipants: '1', // Default to 1 participant required
      });
      setErrors({});
    }
  }, [isOpen, categories]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    // First validate with Zod schema
    const result = safeParseTaskFormData(formData);

    if (!result.success) {
      const zodErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        zodErrors[field] = issue.message;
      });
      setErrors(zodErrors);
      return false;
    }

    // Additional custom validation
    const newErrors: FormErrors = {};

    if (!formData.taskName.trim()) {
      newErrors.taskName = 'Oppgavenavn er påkrevd';
    }

    if (!formData.category) {
      newErrors.category = 'Kategori er påkrevd';
    }

    if (formData.hourEstimate) {
      const hours = Number(formData.hourEstimate);
      if (isNaN(hours) || hours <= 0) {
        newErrors.hourEstimate = 'Timeestimat må være et positivt tall';
      }
    }

    // Max participants is now required and must be at least 1
    if (!formData.maxParticipants) {
      newErrors.maxParticipants = 'Maksimalt antall deltakere er påkrevd';
    } else {
      const maxParticipants = Number(formData.maxParticipants);
      if (isNaN(maxParticipants) || maxParticipants < 1) {
        newErrors.maxParticipants = 'Maksimalt antall deltakere må være minst 1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const transformFormDataToCreationData = (formData: TaskFormData): TaskCreationData => {
    return {
      taskName: formData.taskName.trim(),
      category: formData.category,
      description: formData.description.trim() || undefined,
      contactPerson: currentUser?.name || 'Ukjent',
      contactPersonId: currentUser?.id || '',
      deadline: formData.deadline ? new Date(formData.deadline) : undefined,
      hourEstimate: formData.hourEstimate ? Number(formData.hourEstimate) : undefined,
      maxParticipants: Number(formData.maxParticipants), // Always a number now, never undefined
      participants: [],
      completed: false,
      isApproved: false,
      createdBy: currentUser?.id || '',
      isActive: true,
    };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const taskCreationData = transformFormDataToCreationData(formData);

      // Validate the creation data with Zod
      const validatedData = validateTaskCreationData(taskCreationData);

      await onCreateTask(validatedData);
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      if (error instanceof Error) {
        setErrors({ submit: `Kunne ikke opprette oppgave: ${error.message}` });
      } else {
        setErrors({ submit: 'Kunne ikke opprette oppgave. Prøv igjen.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof TaskFormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Opprett ny oppgave</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Lukk modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md" role="alert">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Task Name */}
          <div>
            <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 mb-2">
              Oppgavenavn *
            </label>
            <input
              type="text"
              id="taskName"
              value={formData.taskName}
              onChange={(e) => handleInputChange('taskName', e.target.value)}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.taskName
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Begå lovbrudd"
              aria-invalid={!!errors.taskName}
              aria-describedby={errors.taskName ? 'taskName-error' : undefined}
            />
            {errors.taskName && (
              <p id="taskName-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.taskName}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Kategori *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? 'category-error' : undefined}
            >
              <option value="">Velg kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p id="category-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.category}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Beskrivelse
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Beskriv oppgaven i detalj..."
            />
          </div>

          {/* Two column layout for smaller fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Frist
              </label>
              <input
                type="datetime-local"
                id="deadline"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Hour Estimate */}
            <div>
              <label
                htmlFor="hourEstimate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Clock className="w-4 h-4 inline mr-1" />
                Timeestimat
              </label>
              <input
                type="number"
                id="hourEstimate"
                value={formData.hourEstimate}
                onChange={(e) => handleInputChange('hourEstimate', e.target.value)}
                min="0"
                step="0.5"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.hourEstimate
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="F.eks. 2.5"
                aria-invalid={!!errors.hourEstimate}
                aria-describedby={errors.hourEstimate ? 'hourEstimate-error' : undefined}
              />
              {errors.hourEstimate && (
                <p id="hourEstimate-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.hourEstimate}
                </p>
              )}
            </div>
          </div>

          {/* Max Participants - Now Required */}
          <div>
            <label
              htmlFor="maxParticipants"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <Users className="w-4 h-4 inline mr-1" />
              Maksimalt antall deltakere *
            </label>
            <input
              type="number"
              id="maxParticipants"
              value={formData.maxParticipants}
              onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
              min="1"
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.maxParticipants
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="F.eks. 3"
              aria-invalid={!!errors.maxParticipants}
              aria-describedby="maxParticipants-help"
            />
            <p id="maxParticipants-help" className="mt-1 text-sm text-gray-500">
              Angi hvor mange personer som kan melde seg på denne oppgaven (minst 1)
            </p>
            {errors.maxParticipants && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.maxParticipants}
              </p>
            )}
          </div>

          {/* Contact Person Info */}
          <div className="bg-gray-50 rounded-md p-4">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <User className="w-4 h-4" />
              <span className="font-medium">Kontaktperson:</span>
              <span>{currentUser?.name || 'Ukjent'}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Du vil bli registrert som kontaktperson for denne oppgaven
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Oppretter...' : 'Opprett oppgave'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreationModal;

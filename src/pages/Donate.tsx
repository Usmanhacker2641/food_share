import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Camera, Clock, MapPin, Plus, Loader2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { createDonation, DonationFormData } from '../lib/api';

const Donate: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<DonationFormData>();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      addNotification({
        type: 'error',
        title: 'Login Required',
        message: 'Please log in to donate food.',
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate, addNotification]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setSelectedFiles(files);
    
    // Clear previous previews
    setPreviewImages([]);
    
    // Create preview URLs for each file
    const newPreviewImages: string[] = [];
    const fileArray = Array.from(files);
    
    fileArray.forEach((file, index) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        addNotification({
          type: 'error',
          title: 'Invalid File',
          message: `${file.name} is not a valid image file.`,
        });
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        addNotification({
          type: 'error',
          title: 'File Too Large',
          message: `${file.name} is larger than 10MB.`,
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviewImages[index] = e.target.result as string;
          
          // Update state when all files are processed
          if (newPreviewImages.filter(Boolean).length === fileArray.length) {
            setPreviewImages(newPreviewImages.filter(Boolean));
          }
        }
      };
      reader.onerror = () => {
        addNotification({
          type: 'error',
          title: 'Error Reading File',
          message: `Failed to read ${file.name}`,
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    
    // If we have selected files, create a new FileList without the removed file
    if (selectedFiles) {
      const dt = new DataTransfer();
      Array.from(selectedFiles).forEach((file, i) => {
        if (i !== index) {
          dt.items.add(file);
        }
      });
      setSelectedFiles(dt.files);
      
      // Update the form input
      const fileInput = document.getElementById('images') as HTMLInputElement;
      if (fileInput) {
        fileInput.files = dt.files;
      }
    }
  };

  const onSubmit = async (data: DonationFormData) => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'You must be logged in to donate.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create form data with selected files
      const formDataWithImages = {
        ...data,
        images: selectedFiles || undefined,
      };

      await createDonation(formDataWithImages, user.id);

      addNotification({
        type: 'success',
        title: 'Donation Posted Successfully!',
        message: 'Your food donation is now available for the community.',
      });

      // Reset form and clear images
      reset();
      setPreviewImages([]);
      setSelectedFiles(null);
      
      // Clear file input
      const fileInput = document.getElementById('images') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      navigate('/browse');
    } catch (error) {
      console.error('Error creating donation:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to post donation. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-neutral-900">Donate Food</h1>
            <p className="mt-2 text-lg text-neutral-600">
              Share your surplus food with those in need and help reduce waste
            </p>
          </div>

          {/* Form */}
          <div className="rounded-lg bg-white p-8 shadow-card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
                  Donation Title *
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-colors"
                  placeholder="e.g., Fresh Vegetables from Local Market"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-error-500">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  {...register('description', { required: 'Description is required' })}
                  rows={4}
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-colors"
                  placeholder="Describe the food items, their condition, dietary information, and any special notes"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-error-500">{errors.description.message}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-neutral-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="text"
                  id="quantity"
                  {...register('quantity', { required: 'Quantity is required' })}
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-colors"
                  placeholder="e.g., 5 kg, 10 servings, 20 items"
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-error-500">{errors.quantity.message}</p>
                )}
              </div>

              {/* Expiry Date */}
              <div>
                <label htmlFor="expiry_date" className="block text-sm font-medium text-neutral-700 mb-2">
                  Best Before Date *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="datetime-local"
                    id="expiry_date"
                    {...register('expiry_date', { required: 'Best before date is required' })}
                    className="w-full rounded-lg border border-neutral-300 pl-10 pr-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-colors"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                {errors.expiry_date && (
                  <p className="mt-1 text-sm text-error-500">{errors.expiry_date.message}</p>
                )}
              </div>

              {/* Pickup Address */}
              <div>
                <label htmlFor="pickup_address" className="block text-sm font-medium text-neutral-700 mb-2">
                  Pickup Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    id="pickup_address"
                    {...register('pickup_address', { required: 'Pickup address is required' })}
                    className="w-full rounded-lg border border-neutral-300 pl-10 pr-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-colors"
                    placeholder="Enter the pickup location"
                    defaultValue={user?.location?.address}
                  />
                </div>
                {errors.pickup_address && (
                  <p className="mt-1 text-sm text-error-500">{errors.pickup_address.message}</p>
                )}
              </div>

              {/* Pickup Instructions */}
              <div>
                <label htmlFor="pickup_instructions" className="block text-sm font-medium text-neutral-700 mb-2">
                  Pickup Instructions (Optional)
                </label>
                <textarea
                  id="pickup_instructions"
                  {...register('pickup_instructions')}
                  rows={3}
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-colors"
                  placeholder="Any specific instructions for pickup (e.g., 'Ring doorbell', 'Call upon arrival', 'Use side entrance')"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Food Images (Optional)
                </label>
                <div className="rounded-lg border-2 border-dashed border-neutral-300 p-6 text-center hover:border-primary-400 transition-colors">
                  <Camera className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                  <div className="space-y-2">
                    <label
                      htmlFor="images"
                      className="inline-flex cursor-pointer items-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Upload Images
                      <input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="text-sm text-neutral-500">
                      PNG, JPG up to 10MB each. Multiple images allowed.
                    </p>
                  </div>
                </div>

                {/* Image Previews */}
                {previewImages.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-neutral-700 mb-3">
                      Selected Images ({previewImages.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {previewImages.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                              onError={(e) => {
                                console.error('Error loading preview image:', e);
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA5VjEzTTEyIDE3SDE2TTE2IDlIMTJNMTIgOUg4TTggOVY5TTggMTNWMTNNOCAxN0g4IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-error-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error-600"
                            title="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-8 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Posting Donation...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-5 w-5" />
                      Post Donation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
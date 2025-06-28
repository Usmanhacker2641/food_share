import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Camera, Clock, MapPin, Plus, Loader2, X, Upload, Sparkles, Heart, Package, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { createDonation, DonationFormData } from '../lib/api';
import { motion } from 'framer-motion';

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

      await createDonation(formDataWithImages);

      addNotification({
        type: 'success',
        title: 'Donation Posted Successfully! 🎉',
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <motion.div 
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 px-4 py-2 mb-4">
              <Heart className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">Make a Difference</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Donate Food
              </span>
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Share your surplus food with those in need and help reduce waste in your community
            </p>
          </motion.div>

          {/* Form */}
          <motion.div 
            className="rounded-3xl bg-white/80 backdrop-blur-lg p-8 shadow-2xl border border-white/20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-neutral-700 mb-3">
                  Donation Title *
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full rounded-2xl border border-neutral-200 bg-white/50 px-6 py-4 text-neutral-900 placeholder-neutral-400 backdrop-blur-sm transition-all duration-300 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                  placeholder="e.g., Fresh Vegetables from Local Market"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-neutral-700 mb-3">
                  Description *
                </label>
                <textarea
                  id="description"
                  {...register('description', { required: 'Description is required' })}
                  rows={4}
                  className="w-full rounded-2xl border border-neutral-200 bg-white/50 px-6 py-4 text-neutral-900 placeholder-neutral-400 backdrop-blur-sm transition-all duration-300 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20 resize-none"
                  placeholder="Describe the food items, their condition, dietary information, and any special notes"
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Quantity and Expiry Date */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-semibold text-neutral-700 mb-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary-600" />
                      Quantity *
                    </div>
                  </label>
                  <input
                    type="text"
                    id="quantity"
                    {...register('quantity', { required: 'Quantity is required' })}
                    className="w-full rounded-2xl border border-neutral-200 bg-white/50 px-6 py-4 text-neutral-900 placeholder-neutral-400 backdrop-blur-sm transition-all duration-300 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                    placeholder="e.g., 5 kg, 10 servings, 20 items"
                  />
                  {errors.quantity && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                      <X className="h-4 w-4" />
                      {errors.quantity.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="expiry_date" className="block text-sm font-semibold text-neutral-700 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-accent-600" />
                      Best Before Date *
                    </div>
                  </label>
                  <input
                    type="datetime-local"
                    id="expiry_date"
                    {...register('expiry_date', { required: 'Best before date is required' })}
                    className="w-full rounded-2xl border border-neutral-200 bg-white/50 px-6 py-4 text-neutral-900 backdrop-blur-sm transition-all duration-300 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  {errors.expiry_date && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                      <X className="h-4 w-4" />
                      {errors.expiry_date.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Pickup Address */}
              <div>
                <label htmlFor="pickup_address" className="block text-sm font-semibold text-neutral-700 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-secondary-600" />
                    Pickup Address *
                  </div>
                </label>
                <input
                  type="text"
                  id="pickup_address"
                  {...register('pickup_address', { required: 'Pickup address is required' })}
                  className="w-full rounded-2xl border border-neutral-200 bg-white/50 px-6 py-4 text-neutral-900 placeholder-neutral-400 backdrop-blur-sm transition-all duration-300 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                  placeholder="Enter the pickup location"
                  defaultValue={user?.location?.address}
                />
                {errors.pickup_address && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    {errors.pickup_address.message}
                  </p>
                )}
              </div>

              {/* Pickup Instructions */}
              <div>
                <label htmlFor="pickup_instructions" className="block text-sm font-semibold text-neutral-700 mb-3">
                  Pickup Instructions (Optional)
                </label>
                <textarea
                  id="pickup_instructions"
                  {...register('pickup_instructions')}
                  rows={3}
                  className="w-full rounded-2xl border border-neutral-200 bg-white/50 px-6 py-4 text-neutral-900 placeholder-neutral-400 backdrop-blur-sm transition-all duration-300 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20 resize-none"
                  placeholder="Any specific instructions for pickup (e.g., 'Ring doorbell', 'Call upon arrival', 'Use side entrance')"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-purple-600" />
                    Food Images (Optional)
                  </div>
                </label>
                <div className="rounded-2xl border-2 border-dashed border-primary-300 bg-gradient-to-br from-primary-50 to-accent-50 p-8 text-center transition-all duration-300 hover:border-primary-400 hover:bg-gradient-to-br hover:from-primary-100 hover:to-accent-100">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-accent-500">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-3">
                    <label
                      htmlFor="images"
                      className="group inline-flex cursor-pointer items-center gap-3 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                    >
                      <Plus className="h-5 w-5" />
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
                    <p className="text-sm text-neutral-600">
                      PNG, JPG up to 10MB each. Multiple images allowed.
                    </p>
                  </div>
                </div>

                {/* Image Previews */}
                {previewImages.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary-600" />
                      Selected Images ({previewImages.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {previewImages.map((preview, index) => (
                        <div key={index} className="group relative">
                          <div className="aspect-square overflow-hidden rounded-2xl border-2 border-white bg-neutral-100 shadow-lg">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => {
                                console.error('Error loading preview image:', e);
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA5VjEzTTEyIDE3SDE2TTE2IDlIMTJNMTIgOUg4TTggOVY5TTggMTNWMTNNOCAxN0g4IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
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
              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-600 px-12 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:shadow-glow hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Posting Donation...
                      </>
                    ) : (
                      <>
                        <Heart className="h-6 w-6" />
                        Post Donation
                        <Sparkles className="h-6 w-6" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-600 via-primary-500 to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
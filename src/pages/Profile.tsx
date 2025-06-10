import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { User, Camera, Loader2, MapPin } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.location?.address || '',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(user?.profileImage || null);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProfile({
        ...user,
        name: formData.name,
        location: {
          ...user.location,
          address: formData.address,
        },
        ...(previewImage && { profileImage: previewImage }),
      });

      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-2 text-3xl font-bold text-neutral-900">Profile Settings</h1>
          <p className="mb-8 text-neutral-600">
            Update your personal information and preferences
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="h-24 w-24 overflow-hidden rounded-full bg-neutral-200">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={formData.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-full w-full p-4 text-neutral-400" />
                  )}
                </div>
                <label
                  htmlFor="profile-image"
                  className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white shadow-lg transition-colors hover:bg-primary-600"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    id="profile-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h3 className="font-medium text-neutral-900">Profile Photo</h3>
                <p className="text-sm text-neutral-600">
                  Upload a new profile photo
                </p>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                className="mt-1 block w-full rounded-lg border border-neutral-300 bg-neutral-100 px-4 py-2 text-neutral-500"
                disabled
              />
              <p className="mt-1 text-sm text-neutral-500">
                Email cannot be changed
              </p>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-neutral-700">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-neutral-300 pl-10 pr-4 py-2 focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Enter your address"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
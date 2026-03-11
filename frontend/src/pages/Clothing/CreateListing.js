import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  X, Plus, Tag, DollarSign, Package,
  Info, Camera, ChevronRight
} from 'lucide-react';

const CATEGORIES = ['dress', 'suit', 'casual', 'formal', 'accessories', 'shoes', 'outerwear', 'sportswear'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'custom'];
const CONDITIONS = ['like-new', 'excellent', 'good', 'fair'];

const CreateListing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState(['']);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      dailyPrice: '',
      deposit: '',
      minDays: 1,
      maxDays: 30,
    }
  });

  const dailyPrice = watch('dailyPrice');

  const addImageUrl = () => setImageUrls(prev => [...prev, '']);
  const removeImageUrl = (idx) => setImageUrls(prev => prev.filter((_, i) => i !== idx));
  const updateImageUrl = (idx, val) => setImageUrls(prev => prev.map((url, i) => i === idx ? val : url));

  const addTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };
  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));

  const onSubmit = async (data) => {
    if (!isAuthenticated) {
      toast.error('Please log in to create a listing');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const validUrls = imageUrls.filter(url => url.trim() !== '');
      const payload = {
        ...data,
        dailyPrice: parseFloat(data.dailyPrice),
        deposit: parseFloat(data.deposit),
        weeklyPrice: data.weeklyPrice ? parseFloat(data.weeklyPrice) : undefined,
        monthlyPrice: data.monthlyPrice ? parseFloat(data.monthlyPrice) : undefined,
        minDays: parseInt(data.minDays),
        maxDays: parseInt(data.maxDays),
        imageUrls: validUrls,
        tags,
        address: data.address || ''
      };

      await axios.post('/api/clothing', payload);
      toast.success('Your item has been listed successfully!');
      navigate('/my-listings');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create listing';
      const errs = error.response?.data?.errors;
      if (errs?.length) {
        errs.forEach(e => toast.error(e.msg));
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">List Your Item</h1>
          <p className="text-gray-500 mt-1">Fill in the details to list your clothing for rent</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-5">
              <Info className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'At least 3 characters' } })}
                  type="text"
                  placeholder="e.g. Elegant Black Evening Dress"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'At least 10 characters' } })}
                  rows={4}
                  placeholder="Describe your item – style, fit, occasion, and any special details..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size *</label>
                  <select
                    {...register('size', { required: 'Size is required' })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select size</option>
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.size && <p className="mt-1 text-sm text-red-600">{errors.size.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
                  <input
                    {...register('color', { required: 'Color is required' })}
                    type="text"
                    placeholder="e.g. Black, Navy Blue"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.color && <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input
                    {...register('brand')}
                    type="text"
                    placeholder="e.g. Zara, H&M"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
                <div className="grid grid-cols-4 gap-3">
                  {CONDITIONS.map(cond => (
                    <label
                      key={cond}
                      className="relative flex flex-col items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-400 transition-colors"
                    >
                      <input
                        {...register('condition', { required: 'Condition is required' })}
                        type="radio"
                        value={cond}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {cond.replace('-', '\u00A0')}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-5">
              <Camera className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Photos</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">Add image URLs (from Imgur, Google Drive, etc.) to showcase your item</p>
            <div className="space-y-3">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateImageUrl(idx, e.target.value)}
                    placeholder={`Image URL ${idx + 1}`}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {url && (
                    <img
                      src={url}
                      alt="preview"
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageUrl(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {imageUrls.length < 5 && (
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add another image URL</span>
                </button>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-5">
              <DollarSign className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Pricing & Rental Period</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily Price (₹) *</label>
                <input
                  {...register('dailyPrice', {
                    required: 'Daily price is required',
                    min: { value: 1, message: 'Must be at least $1' }
                  })}
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="25.00"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.dailyPrice && <p className="mt-1 text-sm text-red-600">{errors.dailyPrice.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Price (₹)</label>
                <input
                  {...register('weeklyPrice')}
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder={dailyPrice ? `Est. ${(parseFloat(dailyPrice) * 7 * 0.8).toFixed(2)}` : ''}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (₹) *</label>
                <input
                  {...register('deposit', {
                    required: 'Deposit is required',
                    min: { value: 0, message: 'Cannot be negative' }
                  })}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="50.00"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.deposit && <p className="mt-1 text-sm text-red-600">{errors.deposit.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price (₹)</label>
                <input
                  {...register('monthlyPrice')}
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Optional"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Rental Days</label>
                <input
                  {...register('minDays', { min: { value: 1, message: 'At least 1 day' } })}
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Rental Days</label>
                <input
                  {...register('maxDays', { min: { value: 1, message: 'At least 1 day' } })}
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Tags & Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-5">
              <Package className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Additional Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location / Address</label>
                <input
                  {...register('address')}
                  type="text"
                  placeholder="e.g. Mumbai, Maharashtra"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center space-x-1 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="w-3 h-3 ml-1" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addTag(e); }}
                    placeholder="Add a tag (e.g. wedding, summer)"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <span>List Item</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;

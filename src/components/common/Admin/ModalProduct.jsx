import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

const ModalProduct = ({
    isOpen,
    onClose,
    editItem,
    categories,
    onSuccess
}) => {
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image_url: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadLoading, setUploadLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Reset form when modal opens/closes or editItem changes
    useEffect(() => {
        if (isOpen) {
            if (editItem) {
                setProductForm({
                    name: editItem.name || '',
                    description: editItem.description || '',
                    price: editItem.price?.toString() || '',
                    stock: editItem.stock?.toString() || '',
                    category_id: editItem.category_id?.toString() || '',
                    image_url: editItem.image_url || ''
                });
                setImagePreview(editItem.image_url || '');
            } else {
                setProductForm({
                    name: '',
                    description: '',
                    price: '',
                    stock: '',
                    category_id: '',
                    image_url: ''
                });
                setImagePreview('');
            }
            setImageFile(null);
            setErrors({});
        }
    }, [isOpen, editItem]);

    // Upload image to Supabase Storage
    const uploadImage = async (file) => {
        if (!file) return null;

        try {
            setUploadLoading(true);

            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `products/${fileName}`;

            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (error) {
                throw new Error(error.message);
            }

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (err) {
            console.error('Error uploading image:', err);
            throw err;
        } finally {
            setUploadLoading(false);
        }
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setErrors(prev => ({ ...prev, image: 'Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP' }));
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, image: 'Ukuran file terlalu besar. Maksimal 5MB' }));
            return;
        }

        setErrors(prev => ({ ...prev, image: null }));
        setImageFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    // Remove selected image
    const removeImage = () => {
        setImageFile(null);
        setImagePreview('');
        setProductForm(prev => ({ ...prev, image_url: '' }));
        setErrors(prev => ({ ...prev, image: null }));
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!productForm.name.trim()) {
            newErrors.name = 'Nama produk harus diisi';
        }

        if (!productForm.price || parseFloat(productForm.price) <= 0) {
            newErrors.price = 'Harga harus diisi dan lebih dari 0';
        }

        if (!productForm.category_id) {
            newErrors.category_id = 'Kategori harus dipilih';
        }

        if (productForm.stock && parseInt(productForm.stock) < 0) {
            newErrors.stock = 'Stok tidak boleh negatif';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            let imageUrl = productForm.image_url;

            // Upload new image if selected
            if (imageFile) {
                try {
                    imageUrl = await uploadImage(imageFile);
                } catch (error) {
                    setErrors(prev => ({ ...prev, image: 'Gagal mengupload gambar: ' + error.message }));
                    return;
                }
            }

            const productData = {
                name: productForm.name.trim(),
                description: productForm.description.trim() || null,
                price: parseFloat(productForm.price),
                stock: parseInt(productForm.stock) || 0,
                category_id: parseInt(productForm.category_id),
                image_url: imageUrl || null
            };

            if (editItem) {
                // Update product
                const { data, error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', editItem.id)
                    .select('*, categories(name)');

                if (error) throw error;

                onSuccess(data[0], 'update');
            } else {
                // Add new product
                const { data, error } = await supabase
                    .from('products')
                    .insert([productData])
                    .select('*, categories(name)');

                if (error) throw error;

                onSuccess(data[0], 'create');
            }

            onClose();
        } catch (error) {
            console.error('Error saving product:', error);
            setErrors(prev => ({ ...prev, submit: 'Gagal menyimpan produk: ' + error.message }));
        }
    };

    // Handle input changes
    const handleInputChange = (field, value) => {
        setProductForm(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // Handle image URL change
    const handleImageUrlChange = (value) => {
        handleInputChange('image_url', value);
        if (value && !imageFile) {
            setImagePreview(value);
        } else if (!value && !imageFile) {
            setImagePreview('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[100vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {editItem ? '✏️ Edit Produk' : '➕ Tambah Produk Baru'}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {editItem ? 'Perbarui informasi produk' : 'Lengkapi form untuk menambah produk baru'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
                            disabled={uploadLoading}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Alert */}
                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-800">{errors.submit}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Basic Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="bg-blue-100 text-blue-600 rounded-full p-1 mr-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                                Informasi Dasar
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Product Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Produk <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        value={productForm.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Masukkan nama produk"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kategori <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.category_id ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        value={productForm.category_id}
                                        onChange={(e) => handleInputChange('category_id', e.target.value)}
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {errors.category_id && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.category_id}
                                        </p>
                                    )}
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Harga <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-500">Rp</span>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                            value={productForm.price}
                                            onChange={(e) => handleInputChange('price', e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                    {errors.price && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.price}
                                        </p>
                                    )}
                                </div>

                                {/* Stock */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Stok
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.stock ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        value={productForm.stock}
                                        onChange={(e) => handleInputChange('stock', e.target.value)}
                                        placeholder="0"
                                    />
                                    {errors.stock && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.stock}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Image Section */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="bg-green-100 text-green-600 rounded-full p-1 mr-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                Gambar Produk
                            </h4>

                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="mb-4">
                                    <div className="relative w-40 h-40 mx-auto bg-gray-100 rounded-xl overflow-hidden shadow-md">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgMTZMMTAuNTg2IDkuNDE0QzExLjM2NyA4LjYzMyAxMi42MzMgOC42MzMgMTMuNDE0IDkuNDE0TDE2IDEyTTE0IDEwTDE1LjU4NiA4LjQxNEMxNi4zNjcgNy42MzMgMTcuNjMzIDcuNjMzIDE4LjQxNCA4LjQxNEwyMCAxME0xOCA4SDE4LjAxTTYgMjBIMThBMiAyIDAgMDAyMCAxOFY2QTIgMiAwIDAwMTggNEg2QTIgMiAwIDAwNCA2VjE4QTIgMiAwIDAwNiAyMFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 transition-colors duration-200 shadow-lg"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* File Upload */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Upload Gambar
                                    </label>
                                    <div className="flex items-center justify-center w-full">
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="mb-2 text-sm text-gray-500">
                                                    <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                                                </p>
                                                <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP (Maks. 5MB)</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                            />
                                        </label>
                                    </div>
                                    {errors.image && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.image}
                                        </p>
                                    )}
                                </div>


                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="bg-purple-100 text-purple-600 rounded-full p-1 mr-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </span>
                                Deskripsi
                            </h4>
                            <textarea
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all duration-200 resize-none"
                                rows={4}
                                value={productForm.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Masukkan deskripsi produk (opsional)"
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                        disabled={uploadLoading}
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={uploadLoading}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {uploadLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Mengupload...
                            </>
                        ) : (
                            <>
                                {editItem ? (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Update Produk
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Simpan Produk
                                    </>
                                )}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalProduct;
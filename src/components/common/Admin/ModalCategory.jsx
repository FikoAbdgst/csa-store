import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

const ModalCategory = ({
    isOpen,
    onClose,
    editItem,
    onSuccess
}) => {
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Reset form when modal opens/closes or editItem changes
    useEffect(() => {
        if (isOpen) {
            if (editItem) {
                setCategoryForm({
                    name: editItem.name || '',
                    description: editItem.description || ''
                });
            } else {
                setCategoryForm({
                    name: '',
                    description: ''
                });
            }
            setErrors({});
        }
    }, [isOpen, editItem]);

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!categoryForm.name.trim()) {
            newErrors.name = 'Nama kategori harus diisi';
        } else if (categoryForm.name.trim().length < 2) {
            newErrors.name = 'Nama kategori minimal 2 karakter';
        } else if (categoryForm.name.trim().length > 50) {
            newErrors.name = 'Nama kategori maksimal 50 karakter';
        }

        if (categoryForm.description && categoryForm.description.length > 255) {
            newErrors.description = 'Deskripsi maksimal 255 karakter';
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
            setLoading(true);

            const categoryData = {
                name: categoryForm.name.trim(),
                description: categoryForm.description.trim() || null
            };

            if (editItem) {
                // Update category
                const { data, error } = await supabase
                    .from('categories')
                    .update(categoryData)
                    .eq('id', editItem.id)
                    .select();

                if (error) throw error;

                onSuccess(data[0], 'update');
            } else {
                // Add new category
                const { data, error } = await supabase
                    .from('categories')
                    .insert([categoryData])
                    .select();

                if (error) throw error;

                onSuccess(data[0], 'create');
            }

            onClose();
        } catch (error) {
            console.error('Error saving category:', error);
            setErrors(prev => ({ ...prev, submit: 'Gagal menyimpan kategori: ' + error.message }));
        } finally {
            setLoading(false);
        }
    };

    // Handle input changes
    const handleInputChange = (field, value) => {
        setCategoryForm(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {editItem ? '✏️ Edit Kategori' : '➕ Tambah Kategori Baru'}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {editItem ? 'Perbarui informasi kategori' : 'Buat kategori baru untuk produk Anda'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
                            disabled={loading}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-6">
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

                        {/* Category Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="bg-purple-100 text-purple-600 rounded-full p-1 mr-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </span>
                                Informasi Kategori
                            </h4>

                            <div className="space-y-4">
                                {/* Category Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Kategori <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={50}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        value={categoryForm.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Masukkan nama kategori"
                                    />
                                    <div className="flex justify-between mt-1">
                                        {errors.name ? (
                                            <p className="text-sm text-red-600 flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {errors.name}
                                            </p>
                                        ) : (
                                            <span></span>
                                        )}
                                        <span className="text-xs text-gray-500">
                                            {categoryForm.name.length}/50
                                        </span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Deskripsi
                                        <span className="text-gray-400 text-xs ml-1">(Opsional)</span>
                                    </label>
                                    <textarea
                                        maxLength={255}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        rows={4}
                                        value={categoryForm.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Masukkan deskripsi kategori untuk membantu mengorganisir produk..."
                                    />
                                    <div className="flex justify-between mt-1">
                                        {errors.description ? (
                                            <p className="text-sm text-red-600 flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {errors.description}
                                            </p>
                                        ) : (
                                            <span className="text-xs text-gray-500">
                                                Deskripsi membantu mengidentifikasi jenis produk dalam kategori ini
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-500">
                                            {categoryForm.description.length}/255
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                        disabled={loading}
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !categoryForm.name.trim()}
                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                {editItem ? (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Update Kategori
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Simpan Kategori
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

export default ModalCategory;
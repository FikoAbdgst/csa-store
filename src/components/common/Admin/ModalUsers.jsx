import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

const ModalUsers = ({
    isOpen,
    onClose,
    editItem,
    onSuccess
}) => {
    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Reset form when modal opens/closes or editItem changes
    useEffect(() => {
        if (isOpen) {
            if (editItem) {
                setUserForm({
                    name: editItem.name || '',
                    email: editItem.email || '',
                    password: ''
                });
            } else {
                setUserForm({
                    name: '',
                    email: '',
                    password: ''
                });
            }
            setErrors({});
        }
    }, [isOpen, editItem]);

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!userForm.name.trim()) {
            newErrors.name = 'Nama admin harus diisi';
        } else if (userForm.name.trim().length < 2) {
            newErrors.name = 'Nama admin minimal 2 karakter';
        } else if (userForm.name.trim().length > 50) {
            newErrors.name = 'Nama admin maksimal 50 karakter';
        }

        if (!userForm.email.trim()) {
            newErrors.email = 'Email harus diisi';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email.trim())) {
            newErrors.email = 'Format email tidak valid';
        }

        if (!editItem && !userForm.password) {
            newErrors.password = 'Kata sandi harus diisi untuk admin baru';
        } else if (userForm.password && userForm.password.length < 6) {
            newErrors.password = 'Kata sandi minimal 6 karakter';
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

            if (editItem) {
                // Update admin
                const updateData = {
                    name: userForm.name.trim(),
                    email: userForm.email.trim()
                };

                // Update data di tabel admins
                const { data, error: updateError } = await supabase
                    .from('admins')
                    .update(updateData)
                    .eq('id', editItem.id)
                    .select();

                if (updateError) throw updateError;

                // Update email di Supabase Auth jika email berubah
                if (userForm.email !== editItem.email && editItem.auth_user_id) {
                    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
                        editItem.auth_user_id,
                        { email: userForm.email.trim() }
                    );

                    if (authUpdateError) {
                        console.error('Error updating auth user email:', authUpdateError);
                        // Lanjutkan proses meskipun pembaruan auth gagal
                    }
                }

                // Update kata sandi di Supabase Auth jika diisi
                if (userForm.password && editItem.auth_user_id) {
                    const { error: passwordError } = await supabase.auth.admin.updateUserById(
                        editItem.auth_user_id,
                        { password: userForm.password }
                    );

                    if (passwordError) {
                        console.error('Error updating password:', passwordError);
                        // Lanjutkan proses meskipun pembaruan kata sandi gagal
                    }
                }

                onSuccess(data[0], 'update');
            } else {
                // Create new admin
                // Membuat pengguna baru di Supabase Auth
                const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                    email: userForm.email.trim(),
                    password: userForm.password,
                    email_confirm: true
                });

                if (authError) {
                    throw new Error(`Gagal membuat pengguna auth: ${authError.message}`);
                }

                // Menambahkan data admin ke tabel admins dengan referensi auth_user_id
                const { data, error: insertError } = await supabase
                    .from('admins')
                    .insert([{
                        name: userForm.name.trim(),
                        email: userForm.email.trim(),
                        password: userForm.password, // Note: Pertimbangkan untuk tidak menyimpan password di tabel admins
                        auth_user_id: authData.user.id
                    }])
                    .select();

                if (insertError) {
                    // Menghapus pengguna auth jika penyisipan ke tabel admins gagal
                    await supabase.auth.admin.deleteUser(authData.user.id);
                    throw insertError;
                }

                onSuccess(data[0], 'create');
            }

            onClose();
        } catch (error) {
            console.error('Error saving admin:', error);
            setErrors(prev => ({ ...prev, submit: 'Gagal menyimpan admin: ' + error.message }));
        } finally {
            setLoading(false);
        }
    };

    // Handle input changes
    const handleInputChange = (field, value) => {
        setUserForm(prev => ({ ...prev, [field]: value }));
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
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {editItem ? '✏️ Edit Admin' : '➕ Tambah Admin Baru'}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {editItem ? 'Perbarui informasi admin' : 'Buat akun admin baru untuk sistem'}
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
                <div className="p-6 overflow-y-auto max-h-[60vh]">
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

                        {/* Admin Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="bg-blue-100 text-blue-600 rounded-full p-1 mr-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </span>
                                Informasi Admin
                            </h4>

                            <div className="space-y-4">
                                {/* Admin Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Admin <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={50}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        value={userForm.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Masukkan nama lengkap admin"
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
                                            {userForm.name.length}/50
                                        </span>
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        value={userForm.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="admin@example.com"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600 flex items-center mt-1">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kata Sandi {editItem ? (
                                            <span className="text-gray-400 text-xs ml-1">(kosongkan untuk mempertahankan yang lama)</span>
                                        ) : (
                                            <span className="text-red-500">*</span>
                                        )}
                                    </label>
                                    <input
                                        type="password"
                                        required={!editItem}
                                        minLength={6}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        value={userForm.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        placeholder={editItem ? "Masukkan kata sandi baru (opsional)" : "Masukkan kata sandi minimal 6 karakter"}
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-600 flex items-center mt-1">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.password}
                                        </p>
                                    )}
                                    {!editItem && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Kata sandi akan digunakan untuk login ke sistem admin
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>



                        {/* Security Note */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Catatan Keamanan:</strong> Admin akan memiliki akses penuh ke sistem.
                                        Pastikan memberikan akses hanya kepada orang yang dipercaya.
                                    </p>
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
                        disabled={loading || !userForm.name.trim() || !userForm.email.trim() || (!editItem && !userForm.password)}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                                        Update Admin
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Buat Admin
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

export default ModalUsers;
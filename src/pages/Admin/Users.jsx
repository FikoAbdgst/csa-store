import React, { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient';
import ModalUsers from '../../components/common/Admin/ModalUsers';

const Users = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchAdmins();
    }, []);

    // Fungsi untuk mengambil daftar admin dari tabel admins
    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('admins')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching admins:', error);
                showNotification('Gagal memuat admin: ' + error.message, 'error');
                return;
            }
            setAdmins(data || []);
        } catch (err) {
            console.error('Unexpected error loading admins:', err);
            showNotification('Terjadi kesalahan saat memuat admin', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    // Handle modal success
    const handleModalSuccess = (data, action) => {
        if (action === 'create') {
            setAdmins(prev => [data, ...prev]);
            showNotification('Admin berhasil ditambahkan!', 'success');
        } else if (action === 'update') {
            setAdmins(prev => prev.map(admin =>
                admin.id === data.id ? data : admin
            ));
            showNotification('Admin berhasil diperbarui!', 'success');
        }
    };

    // Fungsi untuk menghapus admin
    const handleDelete = async (admin) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus admin "${admin.name}"? Ini juga akan menghapus akses login mereka.`)) {
            try {
                // Menghapus data dari tabel admins
                const { error: deleteError } = await supabase
                    .from('admins')
                    .delete()
                    .eq('id', admin.id);

                if (deleteError) throw deleteError;

                // Menghapus pengguna dari Supabase Auth jika auth_user_id ada
                if (admin.auth_user_id) {
                    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(admin.auth_user_id);

                    if (authDeleteError) {
                        console.error('Error menghapus pengguna auth:', authDeleteError);
                        showNotification('Admin dihapus dari tabel, tetapi ada masalah saat menghapus akses auth. Silakan periksa secara manual.', 'error');
                        return;
                    }
                } else {
                    // Fallback: Mencoba mencari dan menghapus pengguna berdasarkan email
                    try {
                        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
                        if (!listError && users) {
                            const userToDelete = users.users.find(user => user.email === admin.email);
                            if (userToDelete) {
                                await supabase.auth.admin.deleteUser(userToDelete.id);
                            }
                        }
                    } catch (fallbackError) {
                        console.error('Penghapusan fallback gagal:', fallbackError);
                    }
                }

                setAdmins(prev => prev.filter(a => a.id !== admin.id));
                showNotification('Admin berhasil dihapus!', 'success');
            } catch (err) {
                console.error('Error menghapus admin:', err);
                showNotification('Error menghapus admin: ' + err.message, 'error');
            }
        }
    };

    const handleEdit = (admin) => {
        setEditItem(admin);
        setShowModal(true);
    };

    const openAddModal = () => {
        setEditItem(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditItem(null);
    };

    const filteredAdmins = admins.filter(admin =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">👥 Kelola Admin</h1>
                        <p className="text-gray-600">Atur dan kelola akun administrator sistem</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Tambah Admin Baru
                    </button>
                </div>

                {/* Notification */}
                {notification && (
                    <div className={`mb-6 p-4 rounded-lg shadow-lg border-l-4 ${notification.type === 'success'
                        ? 'bg-green-50 border-green-400 text-green-800'
                        : 'bg-red-50 border-red-400 text-red-800'
                        }`}>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                {notification.type === 'success' ? (
                                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium">{notification.message}</p>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    onClick={() => setNotification(null)}
                                    className="inline-flex text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search and Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Cari admin berdasarkan nama atau email..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all duration-200 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="bg-blue-100 rounded-lg p-2">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Admin</p>
                                <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Admins Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex items-center space-x-3">
                                <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-gray-600">Memuat admin...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                                            Admin
                                        </th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                                            Email
                                        </th>
                                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
                                            Status Auth
                                        </th>
                                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
                                            Tanggal Dibuat
                                        </th>
                                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredAdmins.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center">
                                                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    <p className="text-gray-500 text-lg mb-2">
                                                        {searchTerm ? 'Tidak ada admin yang ditemukan' : 'Belum ada admin'}
                                                    </p>
                                                    <p className="text-gray-400 text-sm">
                                                        {searchTerm ? 'Coba ubah kata kunci pencarian' : 'Buat admin pertama untuk mengelola sistem'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAdmins.map((admin) => (
                                            <tr key={admin.id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                                                <span className="text-blue-600 font-semibold text-lg">
                                                                    {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-semibold text-gray-900">{admin.name}</div>
                                                            <div className="text-xs text-gray-500">ID: {admin.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{admin.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {admin.auth_user_id ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                            </svg>
                                                            Tidak Aktif
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="text-sm text-gray-600">
                                                        {formatDate(admin.created_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex justify-center space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(admin)}
                                                            className="bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg text-sm hover:bg-yellow-100 transition-colors duration-200 font-medium flex items-center"
                                                        >
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(admin)}
                                                            className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-sm hover:bg-red-100 transition-colors duration-200 font-medium flex items-center"
                                                        >
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* User Modal */}
                <ModalUsers
                    isOpen={showModal}
                    onClose={closeModal}
                    editItem={editItem}
                    onSuccess={handleModalSuccess}
                />
            </div>
        </div>
    );
};

export default Users;
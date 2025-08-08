import React, { useState, useEffect } from 'react';

const Dashboard = () => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        setCurrentUser(localStorage.getItem('adminName') || 'Admin');
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">
                                Selamat datang, {currentUser}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
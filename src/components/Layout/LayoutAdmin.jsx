import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const LayoutAdmin = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar />
            {/* Main Content */}
            <div className="flex-1 ml-0 min-w-0">
                <main className="h-screen overflow-y-auto">
                    <div className="p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LayoutAdmin;
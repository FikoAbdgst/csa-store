import React, { useState } from 'react'
import { CiHeart, CiSearch, CiShoppingCart } from 'react-icons/ci'
import CartModal from '../common/User/CartModal';

const Navbar = () => {
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);

    const handleCartClick = () => {
        setIsCartModalOpen(true);
    };

    const handleCloseCart = () => {
        setIsCartModalOpen(false);
    };

    return (
        <>
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-14">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-2">
                            <div className=' rounded-full bg-gray-200 w-10 h-10 justify-center flex items-center'>
                                <p>C</p>
                            </div>
                            <h1 className="text-2xl text-gray-900 font-raleway">CSA Store</h1>
                        </div>

                        <div className="hidden md:flex space-x-6">
                            <a href="/" className="text-gray-600 hover:text-blue-600">Home</a>
                            <a href="/shop" className="text-gray-600 hover:text-blue-600">Shop</a>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button>
                                <CiSearch className="text-gray-600 text-xl cursor-pointer" />
                            </button>
                            <button>
                                <CiHeart className="text-gray-600 text-xl cursor-pointer" />
                            </button>
                            <button onClick={handleCartClick}>
                                <CiShoppingCart className="text-gray-600 text-xl cursor-pointer" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Cart Modal */}
            <CartModal
                isOpen={isCartModalOpen}
                onClose={handleCloseCart}
            />
        </>
    )
}

export default Navbar
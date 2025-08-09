import React, { useState } from 'react'
import { CiHeart, CiSearch, CiShoppingCart } from 'react-icons/ci'
import CartModal from '../common/User/CartModal';
import FavoriteModal from '../common/User/FavoriteModal';
import { selectCartTotalItems } from '../../redux/slices/cartSlice';
import { selectFavoriteTotalItems } from '../../redux/slices/favSlice';
import { useSelector } from 'react-redux';

const Navbar = () => {
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);

    const cartTotalItems = useSelector(selectCartTotalItems);
    const favoriteTotalItems = useSelector(selectFavoriteTotalItems);

    const handleCartClick = () => {
        setIsCartModalOpen(true);
    };

    const handleCloseCart = () => {
        setIsCartModalOpen(false);
    };

    const handleFavoriteClick = () => {
        setIsFavoriteModalOpen(true);
    };

    const handleCloseFavorite = () => {
        setIsFavoriteModalOpen(false);
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
                                <CiSearch className="text-gray-600 text-2xl cursor-pointer" />
                            </button>
                            <button onClick={handleFavoriteClick} className='relative'>
                                {
                                    favoriteTotalItems > 0 && (
                                        <span className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                            {favoriteTotalItems}
                                        </span>
                                    )
                                }
                                <CiHeart className="text-gray-600 text-2xl cursor-pointer" />
                            </button>
                            <button onClick={handleCartClick} className='relative'>
                                {
                                    cartTotalItems > 0 && (
                                        <span className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                            {cartTotalItems}
                                        </span>
                                    )
                                }
                                <CiShoppingCart className="text-gray-600 text-2xl cursor-pointer" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <FavoriteModal
                isOpenFavorite={isFavoriteModalOpen}
                onCloseFavorite={handleCloseFavorite}
                isOpenCart={handleCartClick}
            />

            {/* Cart Modal */}
            <CartModal
                isOpenCart={isCartModalOpen}
                onCloseCart={handleCloseCart}
            />
        </>
    )
}

export default Navbar
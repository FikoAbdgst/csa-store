import React from 'react'
import { selectFavoriteItems, removeItemFromFavorite } from '../../../redux/slices/favSlice';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../../../redux/slices/cartSlice';
import FormattedPrice from '../../Utils/FormattedPrice';
import { FaArrowLeft, FaTimes, FaHeart, FaShoppingCart } from 'react-icons/fa';

const FavoriteModal = ({ isOpenFavorite, onCloseFavorite, isOpenCart }) => {
    const favoriteItems = useSelector(selectFavoriteItems);
    const dispatch = useDispatch();

    if (!isOpenFavorite) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onCloseFavorite();
        }
    };

    const handleRemoveFavorite = (product) => {
        dispatch(removeItemFromFavorite(product));
    }

    const handleAddToCart = (product) => {
        dispatch(addToCart(product));
        onCloseFavorite();
        isOpenCart();
    }

    return (
        <div
            className="fixed inset-0 backdrop-blur-sm bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-2xl max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
                    <button
                        type="button"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200 hover:bg-gray-50"
                        onClick={onCloseFavorite}
                    >
                        <FaArrowLeft size={16} className="text-gray-600" />
                    </button>

                    <div className="flex items-center space-x-2">
                        <FaHeart className="text-pink-500" size={20} />
                        <h3 className="text-xl font-bold text-gray-800">Favorite List</h3>
                    </div>

                    <div className="w-10 h-10" /> {/* Spacer for centering */}
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(80vh-140px)]">
                    {favoriteItems.length !== 0 ? (
                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-sm text-gray-600">
                                    {favoriteItems.length} item{favoriteItems.length > 1 ? 's' : ''} in your wishlist
                                </p>
                            </div>

                            <div className="space-y-4">
                                {favoriteItems.map((product) => (
                                    <div
                                        className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
                                        key={product.id}
                                    >
                                        <div className="flex items-center space-x-4">
                                            {/* Product Image */}
                                            <div className="flex-shrink-0 w-20 h-20 bg-white rounded-lg overflow-hidden shadow-sm">
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain object-center p-2"
                                                />
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-semibold text-gray-800 mb-1 truncate">
                                                    {product.name}
                                                </h3>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {FormattedPrice(product.price)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col space-y-2">
                                                <button
                                                    onClick={() => handleRemoveFavorite(product)}
                                                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-50 transition-colors duration-200 group"
                                                    title="Remove from favorites"
                                                >
                                                    <FaTimes className="text-gray-400 group-hover:text-red-500 text-sm" />
                                                </button>

                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg transition-colors duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
                                                >
                                                    <FaShoppingCart size={12} />
                                                    <span>Add to Cart</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-96 px-6 text-center">
                            <div className="mb-6">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <FaHeart className="text-4xl text-gray-300" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    Your wishlist is empty
                                </h2>
                                <p className="text-gray-500 mb-6 max-w-sm">
                                    Tap the heart on any item to start saving your favorites ✨
                                </p>
                            </div>

                            <button
                                onClick={onCloseFavorite}
                                className="px-6 py-3 bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FavoriteModal
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { addItemWithQuantity, selectCartItems } from '../../../redux/slices/cartSlice';
import { addItemToFavorite, selectFavoriteItems } from '../../../redux/slices/favSlice';
import formattedPrice from '../../Utils/FormattedPrice';
import { FaHeart, FaTimes, FaShoppingCart, FaBox, FaPlus, FaMinus } from 'react-icons/fa';

const DetailModal = ({ product, isOpen, onClose }) => {
    const [quantity, setQuantity] = useState(1);
    const dispatch = useDispatch();
    const favoriteItems = useSelector(selectFavoriteItems);
    const cartItems = useSelector(selectCartItems);

    if (!isOpen || !product) return null;

    // Get current quantity of this product in cart
    const currentCartItem = cartItems.find(item => item.id === product.id);
    const ownedInCart = currentCartItem ? currentCartItem.quantity : 0;

    const handleAddToCart = () => {
        // Check if total quantity (owned + new) exceeds stock
        if (ownedInCart + quantity > product.stock) {
            const remainingStock = product.stock - ownedInCart;
            if (remainingStock <= 0) {
                alert(`Cannot add more items. You already have all ${product.stock} available items in your cart.`);
            } else {
                alert(`Cannot add ${quantity} items. You already have ${ownedInCart} in cart. Maximum you can add: ${remainingStock}`);
            }
            return;
        }

        const productWithQuantity = {
            ...product,
            quantity: quantity
        };
        dispatch(addItemWithQuantity(productWithQuantity));
        onClose();
    };

    const handleQuantityChange = (value) => {
        if (value >= 1) {
            // Check if new quantity + owned in cart exceeds stock
            const totalAfterChange = ownedInCart + value;
            if (totalAfterChange > product.stock) {
                const maxAddable = product.stock - ownedInCart;
                setQuantity(maxAddable > 0 ? maxAddable : 1);

                if (maxAddable <= 0) {
                    alert(`You already have all ${product.stock} available items in your cart.`);
                } else {
                    alert(`Stock is limited. You already have ${ownedInCart} in cart. Maximum you can add: ${maxAddable}`);
                }
            } else {
                setQuantity(value);
            }
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleClickFav = product => {
        dispatch(addItemToFavorite(product));
    };

    const favoriteProductIds = favoriteItems.map(item => item.id);
    const isProductInFavorites = (productId) => {
        return favoriteProductIds.includes(productId);
    };

    // Calculate maximum quantity that can be added
    const maxAddableQuantity = product.stock - ownedInCart;

    return (
        <div
            className="fixed inset-0 backdrop-blur-sm bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header Modal */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    >
                        <FaTimes className="text-gray-500 hover:text-gray-700" size={16} />
                    </button>
                </div>

                {/* Content Modal */}
                <div className="p-6">
                    <div className="grid lg:grid-cols-2 gap-8">

                        {/* Product Image */}
                        <div className="space-y-4">
                            <div className="relative">
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-80 lg:h-96 object-cover rounded-xl shadow-lg"
                                />
                                {/* Favorite Button */}
                                <button
                                    onClick={() => handleClickFav(product)}
                                    className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
                                >
                                    <FaHeart
                                        size={20}
                                        className={isProductInFavorites(product.id) ? 'text-red-500' : 'text-gray-400'}
                                    />
                                </button>
                            </div>

                            {/* Category Badge */}
                            {product.categories && (
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    {product.categories.name}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h3>
                                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                            </div>

                            {/* Price */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                                <p className="text-3xl font-bold text-blue-600">
                                    {formattedPrice(product.price)}
                                </p>
                            </div>

                            {/* Stock and Cart Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <FaBox className="text-green-600" size={16} />
                                        <span className="text-sm font-medium text-green-800">Available Stock</span>
                                    </div>
                                    <p className="text-2xl font-bold text-green-700">{product.stock}</p>
                                </div>

                                <div className="bg-orange-50 rounded-lg p-4">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <FaShoppingCart className="text-orange-600" size={16} />
                                        <span className="text-sm font-medium text-orange-800">In Your Cart</span>
                                    </div>
                                    <p className="text-2xl font-bold text-orange-700">{ownedInCart}</p>
                                </div>
                            </div>

                            {/* Out of stock or fully owned warning */}
                            {maxAddableQuantity <= 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-800 font-medium">
                                        {product.stock === 0
                                            ? 'Out of Stock'
                                            : `You already have all ${product.stock} available items in your cart`
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Quantity Selector */}
                            {maxAddableQuantity > 0 && (
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Quantity to Add
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => handleQuantityChange(quantity - 1)}
                                            className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={quantity <= 1}
                                        >
                                            <FaMinus size={12} />
                                        </button>

                                        <div className="flex items-center justify-center w-16 h-10 border-2 border-gray-200 rounded-lg bg-white">
                                            <span className="text-lg font-semibold">{quantity}</span>
                                        </div>

                                        <button
                                            onClick={() => handleQuantityChange(quantity + 1)}
                                            className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={quantity >= maxAddableQuantity}
                                        >
                                            <FaPlus size={12} />
                                        </button>
                                    </div>

                                    <p className="text-sm text-gray-500">
                                        Maximum you can add: <span className="font-semibold">{maxAddableQuantity}</span>
                                    </p>
                                </div>
                            )}

                            {/* Total Price */}
                            {maxAddableQuantity > 0 && (
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-medium text-gray-700">Total Price:</span>
                                        <span className="text-2xl font-bold text-gray-900">
                                            {formattedPrice(product.price * quantity)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {formattedPrice(product.price)} × {quantity} item{quantity > 1 ? 's' : ''}
                                    </p>
                                </div>
                            )}

                            {/* Add to Cart Button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={maxAddableQuantity <= 0}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-[1.02] disabled:transform-none"
                            >
                                {maxAddableQuantity <= 0
                                    ? (product.stock === 0 ? 'Out of Stock' : 'All Items in Cart')
                                    : `Add ${quantity} to Cart`
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DetailModal
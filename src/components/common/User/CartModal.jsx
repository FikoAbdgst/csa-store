import React from 'react'
import { IoClose } from 'react-icons/io5'
import { FaShoppingCart, FaTrash, FaPlus, FaMinus } from 'react-icons/fa'
import { addToCart, removeFromCart, clearItemFromCart, selectCartItems, selectCartTotalPrices } from '../../../redux/slices/cartSlice';
import { useDispatch, useSelector } from 'react-redux';
import FormattedPrice from '../../Utils/FormattedPrice';

const CartModal = ({ isOpenCart, onCloseCart }) => {
    const cartItems = useSelector(selectCartItems);
    const CartTotalPrice = useSelector(selectCartTotalPrices);
    const dispatch = useDispatch();

    if (!isOpenCart) return null;

    // Handle click outside modal
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onCloseCart();
        }
    };

    const handlePlus = (item) => {
        // Check if adding one more item would exceed stock
        if (item.quantity >= item.stock) {
            alert(`Cannot add more items. Maximum stock available: ${item.stock}`);
            return;
        }
        dispatch(addToCart(item));
    }

    const handleMinus = (item) => {
        // Check if quantity would go below 1
        if (item.quantity <= 1) {
            // Optional: Show confirmation before removing last item
            const confirmRemove = window.confirm('This will remove the item from your cart. Continue?');
            if (confirmRemove) {
                dispatch(clearItemFromCart(item));
            }
            return;
        }
        dispatch(removeFromCart(item));
    }

    const handleClearCart = (item) => {
        const confirmClear = window.confirm(`Are you sure you want to remove "${item.name}" from your cart?`);
        if (confirmClear) {
            dispatch(clearItemFromCart(item));
        }
    }

    return (
        <div
            className="fixed inset-0 backdrop-blur-sm bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <FaShoppingCart className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Shopping Cart</h2>
                            <p className="text-sm text-gray-600">
                                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onCloseCart}
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    >
                        <IoClose className="text-gray-500 hover:text-gray-700" size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {cartItems.length === 0 ? (
                        /* Empty cart state */
                        <div className="flex flex-col items-center justify-center h-96 px-6 text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <FaShoppingCart className="text-4xl text-gray-300" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
                            <p className="text-gray-500 mb-6">Add some products to get started</p>
                            <button
                                onClick={onCloseCart}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        /* Cart items */
                        <div className="p-6">
                            <div className="space-y-4">
                                {cartItems.map(item => (
                                    <div key={item.id} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-center space-x-4">
                                            {/* Product Image */}
                                            <div className="flex-shrink-0 w-16 h-16 bg-white rounded-lg overflow-hidden shadow-sm">
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-semibold text-gray-800 mb-1 truncate">
                                                    {item.name}
                                                </h3>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-lg font-bold text-gray-900">
                                                        {FormattedPrice(item.price * item.quantity)}
                                                    </p>
                                                    <div className="text-sm text-gray-500">
                                                        {FormattedPrice(item.price)} each
                                                    </div>
                                                </div>
                                                {/* Stock info */}
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-xs text-gray-500">
                                                        Stock: {item.stock}
                                                    </p>
                                                    {item.quantity >= item.stock && (
                                                        <span className="text-xs text-orange-600 font-medium">
                                                            Max quantity reached
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Controls */}
                                        <div className="flex items-center justify-between mt-4">
                                            {/* Remove Button */}
                                            <button
                                                onClick={() => handleClearCart(item)}
                                                className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                                title="Remove from cart"
                                            >
                                                <FaTrash size={14} />
                                                <span className="text-sm font-medium">Remove</span>
                                            </button>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center space-x-3 bg-white rounded-full border border-gray-200 px-1">
                                                <button
                                                    onClick={() => handleMinus(item)}
                                                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={item.quantity <= 0}
                                                    title={item.quantity <= 1 ? "Remove item from cart" : "Decrease quantity"}
                                                >
                                                    <FaMinus size={10} className="text-gray-600" />
                                                </button>

                                                <div className="flex items-center justify-center min-w-[40px] py-2">
                                                    <span className="text-sm font-semibold text-gray-800">
                                                        {item.quantity}
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={() => handlePlus(item)}
                                                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={item.quantity >= item.stock}
                                                    title={item.quantity >= item.stock ? "Maximum stock reached" : "Increase quantity"}
                                                >
                                                    <FaPlus
                                                        size={10}
                                                        className={item.quantity >= item.stock ? "text-gray-400" : "text-gray-600"}
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Warning for items at max stock */}
                                        {item.quantity >= item.stock && (
                                            <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                                                <p className="text-xs text-orange-800 text-center">
                                                    You have reached the maximum available quantity for this item
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer - Only show when cart has items */}
                {cartItems.length > 0 && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                        <div className="space-y-4">
                            {/* Order Summary */}
                            <div className="bg-white rounded-xl p-4 space-y-2">
                                <div className="flex justify-between items-center text-sm text-gray-600">
                                    <span>Subtotal ({cartItems.reduce((total, item) => total + item.quantity, 0)} items)</span>
                                    <span>{FormattedPrice(CartTotalPrice)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="border-t pt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-900">Total</span>
                                        <span className="text-xl font-bold text-gray-900">
                                            {FormattedPrice(CartTotalPrice)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Stock warnings summary */}
                            {cartItems.some(item => item.quantity >= item.stock) && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-xs text-yellow-800 text-center">
                                        ⚠️ Some items in your cart have reached maximum available quantity
                                    </p>
                                </div>
                            )}

                            {/* Checkout Button */}
                            <button
                                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                                disabled={cartItems.length === 0}
                                onClick={() => {
                                    // Add checkout functionality here
                                    alert('Checkout functionality coming soon!');
                                }}
                            >
                                Proceed to Checkout
                            </button>

                            {/* Continue Shopping */}
                            <button
                                onClick={onCloseCart}
                                className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 py-3 px-6 rounded-xl font-semibold transition-all duration-200 hover:bg-gray-50"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartModal;
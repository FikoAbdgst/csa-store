import React, { useEffect } from 'react'
import { IoClose } from 'react-icons/io5'
import { CiShoppingCart } from 'react-icons/ci'
import { addToCart, removeFromCart, clearItemFromCart, selectCartItems, selectCartTotalPrices } from '../../../redux/slices/cartSlice';
import { useDispatch, useSelector } from 'react-redux';
import FormattedPrice from '../../Utils/FormattedPrice';

const CartModal = ({ isOpen, onClose }) => {

    const cartItems = useSelector(selectCartItems);
    const CartTotalPrice = useSelector(selectCartTotalPrices)
    const dispatch = useDispatch();


    if (!isOpen) return null;

    // Handle click outside modal
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handlePlus = (item) => {
        dispatch(addToCart(item));
    }
    const handleMinus = (item) => {
        dispatch(removeFromCart(item));
    }
    const handleClearCart = (item) => {
        dispatch(clearItemFromCart(item));
    }




    return (
        <div
            className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <CiShoppingCart className="text-2xl text-gray-700" />
                        <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <IoClose className="text-2xl text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Empty cart state */}
                    <div className="text-center py-8">
                        <CiShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">Your cart is empty</p>
                        <p className="text-sm text-gray-400">Add some products to get started</p>
                    </div>

                    {/* Cart items */}
                    <div className="space-y-4">
                        {cartItems.length > 0 ? (
                            cartItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-2 border-b">
                                    <div className="flex items-center gap-4">
                                        <button
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleClearCart(item)}
                                        >
                                            <IoClose className="text-lg" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded" />
                                        <div>
                                            <h3 className="text-gray-900 font-semibold">{item.name}</h3>
                                            <p className="text-gray-600">{FormattedPrice(item.price.toFixed(2) * item.quantity)}</p>
                                        </div>
                                    </div>
                                    <div className="w-24 flex justify-center items-center gap-4 border border-gray-300 rounded-full p-1 ">
                                        <button
                                            type="button"
                                            className="rounded-full w-10 h-auto text-black flex items-center justify-center"
                                            onClick={() => handleMinus(item)}
                                        >
                                            -
                                        </button>
                                        <h3 className="text-sm">{item.quantity}</h3>
                                        <button
                                            type="button"
                                            className="rounded-full w-10 h-auto text-black flex items-center justify-center"
                                            onClick={() => handlePlus(item)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center">Your cart is empty</p>
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="border-t p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="font-bold text-lg text-gray-900">{FormattedPrice(CartTotalPrice)}</span>
                    </div>
                    <button
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        disabled={true}
                    >
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartModal;
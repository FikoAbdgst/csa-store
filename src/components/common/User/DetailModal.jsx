import React, { useState } from 'react'
import { addItemWithQuantity } from '../../../redux/slices/cartSlice';
import { useDispatch } from 'react-redux';
import formattedPrice from '../../Utils/FormattedPrice';

const DetailModal = ({ product, isOpen, onClose }) => {
    const [quantity, setQuantity] = useState(1);
    const dispatch = useDispatch();


    if (!isOpen || !product) return null;

    const handleAddToCart = () => {
        // Menambahkan produk dengan quantity ke cart
        const productWithQuantity = {
            ...product,
            quantity: quantity
        };
        dispatch(addItemWithQuantity(productWithQuantity));
        onClose(); // Tutup modal setelah menambahkan ke cart
    };

    const handleQuantityChange = (value) => {
        if (value >= 1) {
            setQuantity(value);
        }
        if (value == product.stock) {
            setQuantity(product.stock); // Batasi quantity tidak melebihi stok
            alert('Stock is limited to ' + product.stock);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };




    return (
        <div
            className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header Modal */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">{product.name}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Content Modal */}
                <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Product Image */}
                        <div>
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-64 md:h-80 object-cover rounded-lg"
                            />
                        </div>

                        {/* Product Info */}
                        <div>
                            <h3 className="text-xl font-semibold mb-3">{product.name}</h3>
                            <p className="text-gray-600 mb-4">{product.description}</p>

                            {/* Category */}
                            {product.categories && (
                                <p className="text-sm text-gray-500 mb-2">
                                    Category: {product.categories.name}
                                </p>
                            )}

                            {/* Price */}
                            <p className="text-2xl font-bold text-blue-600 mb-6">
                                {formattedPrice(product.price)}
                            </p>
                            <p>
                                Stock :{product.stock}
                            </p>

                            {/* Quantity Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity
                                </label>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => handleQuantityChange(quantity - 1)}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded"
                                        disabled={quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span className="px-4 py-1 border rounded text-center min-w-[60px]">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => handleQuantityChange(quantity + 1)}
                                        className={`bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded ${quantity == product.stock ? 'opacity-50 cursor-not-allowed disabled' : ''}`}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <p>
                                owned in cart: {product.quantity ? product.quantity : 0}
                            </p>
                            {/* Total Price */}
                            <div className="mb-6">
                                <p className="text-lg font-semibold">
                                    Total: {formattedPrice(product.price * quantity)}
                                </p>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
                            >
                                Add to Cart ({quantity} item{quantity > 1 ? 's' : ''})
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DetailModal
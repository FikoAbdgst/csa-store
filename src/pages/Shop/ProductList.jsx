import React, { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient';
import { useSelector } from 'react-redux';
import DetailModal from '../../components/common/User/DetailModal';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const cartItems = useSelector(state => state.cart.items);

    useEffect(() => {
        console.log('Cart items:', cartItems);
    }, [cartItems]);

    const loadProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*, categories(name)')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading products:', error);
                return;
            }
            setProducts(data || []);
        } catch (err) {
            console.error('Unexpected error loading products:', err);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    console.log('Products:', products);


    const handleOpenModal = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    }

    const formatPrice = (price) => {
        return price.toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                    <div key={product.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
                        <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover mb-4 rounded" />
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <p className="text-gray-600">{product.description}</p>
                        <p className="text-blue-600 font-bold mt-2">{formatPrice(product.price)}</p>
                        <button
                            onClick={() => handleOpenModal(product)}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                        >
                            View Details
                        </button>
                    </div>
                ))}
            </div>

            {/* Detail Modal */}
            {isModalOpen && selectedProduct && (
                <DetailModal
                    product={selectedProduct}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    )
}

export default ProductList
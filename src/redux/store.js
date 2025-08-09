import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import favReducer from './slices/favSlice'

export default configureStore({
    reducer: {
        cart: cartReducer,
        favorite: favReducer
    },
});
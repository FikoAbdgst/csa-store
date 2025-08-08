import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: [],
}
const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const existingItem = state.items.find(item => item.id === action.payload.id);
            if (existingItem) {
                existingItem.quantity += 1;
                existingItem.totalPrice += action.payload.price;
            } else {
                state.items.push({ ...action.payload, quantity: 1, totalPrice: action.payload.price });
            }
        },
        removeFromCart: (state, action) => {
            const existingItem = state.items.find(item => item.id === action.payload.id);
            if (existingItem) {
                if (existingItem.quantity > 1) {
                    existingItem.quantity -= 1;
                    existingItem.totalPrice -= action.payload.price;
                } else {
                    // Remove item if quantity is 1
                    state.items = state.items.filter(item => item.id !== action.payload.id);
                }
            }
        },
        clearItemFromCart: (state, action) => {
            const selectCartIndex = state.items.findIndex(item => item.id === action.payload.id);
            state.items.splice(selectCartIndex, 1);
        },
        addItemWithQuantity: (state, action) => {
            const existingItem = state.items.find(item => item.id === action.payload.id);
            if (existingItem) {
                existingItem.quantity += action.payload.quantity;
                existingItem.totalPrice += action.payload.price * action.payload.quantity;
            } else {
                state.items.push({ ...action.payload, quantity: action.payload.quantity, totalPrice: action.payload.price * action.payload.quantity });
            }


        },


    }
});

export const { addToCart, removeFromCart, clearItemFromCart, addItemWithQuantity } = cartSlice.actions;
export default cartSlice.reducer;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalPrices = (state) => state.cart.items.reduce((total, item) => total + item.totalPrice, 0);
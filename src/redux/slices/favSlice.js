import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items: [],
}

export const favSlice = createSlice({
    name: 'favorite',
    initialState,
    reducers: {
        addItemToFavorite: (state, action) => {
            const newItem = action.payload
            const selectFavoriteIndex = state.items.findIndex(product => product.id === newItem.id)

            if (selectFavoriteIndex !== -1) {
                state.items.splice(selectFavoriteIndex, 1);

            } else {
                state.items.push({
                    ...newItem,
                    qty: 1,
                })
            }
        },
        removeItemFromFavorite: (state, action) => {
            const newItem = action.payload
            const selectFavoriteIndex = state.items.findIndex(product => product.id === newItem.id)

            state.items.splice(selectFavoriteIndex, 1);
        }
    }
})

export const { addItemToFavorite, removeItemFromFavorite } = favSlice.actions
export default favSlice.reducer

export const selectFavoriteItems = state => state.favorite.items
export const selectFavoriteTotalItems = state => state.favorite.items.reduce((total, item) => total + item.qty, 0)


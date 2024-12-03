import { configureStore } from "@reduxjs/toolkit";
import resourceReducer from './resources/resourcesSlice'




export const store= configureStore({
    reducer:{
        resources:resourceReducer,
    }
})
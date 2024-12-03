import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
    "shelter": [
        {
            "id": "123456",
            "Name": "temp",
            "City": "New York",
            "Address": "temp",
            "Description": "NULL",
            "ContactInfo": "66664566565",
            "HoursOfOperation": "2024-01-11",
            "ORG": "NGO",
            "TargetUser": "HML",
            "Capacity": "100",
            "CurrentUse": "10",
            "mappoint": [23.5, 121],
        },
    ],
    "counseling":[

    ],
    "food":[

    ],
    "healthcare":[

    ],
    "outreach":[

    ]
};

const resourcesSlice = createSlice({
    name: "resources",
    initialState,
    reducers: {
        updateResource: (state, action) => {
            // Update the name of a specific shelter
            const { id, newData,resourcesType } = action.payload;
            const list = state[resourcesType].find((s) => s.id === id);
            if (list) {
                Object.keys(newData).forEach((key) => {
                    list[key] = newData[key];
                });
            }
        },
        deleteResource: (state, action) => {
            // Remove a shelter by id
            const { resourcesType, id } = action.payload;
            state[resourcesType] = state[resourcesType].filter((s) => s.id !== id);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(setResourceAsync.fulfilled, (state, action) => {
            const {updatedResource,resourcesType}= action.payload
            console.log(action.payload)
            state[resourcesType] =updatedResource
        }).addCase(
            updateResourceAsync.fulfilled, (state, action) => {
                const {updatedResource, id, ret,resourcesType } = action.payload;
                const list = state[resourcesType].find((s) => s.id === id);
                if (list) {
                    Object.keys(ret).forEach((key) => {
                        list[key] = ret[key];
                    });
                }
                console.log(updatedResource)
            }).addCase(
                deleteResourceAsync.fulfilled, (state, action) => {
                    const { updatedResource, id,resourcesType } = action.payload;
                    console.log(updatedResource);
                    state[resourcesType] = state[resourcesType].filter((s) => s.id !== id);

                })
    }
});
// Define the async action
export const updateResourceAsync = createAsyncThunk(
    "resources/updateResourceAsync",
    async ({ id, newData, resourcesType }) => {
        try {
            // Replace with your actual API endpoint
            const ret=newData
            delete newData.mappoint;
            delete newData.Catagory;
            console.log(newData)
            const response = await fetch("http://127.0.0.1:8082/update/" + resourcesType, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json", // Set the content type
                },
                body: JSON.stringify(newData),
            });

            if (!response.ok) {
                // Handle HTTP errors
                const errorData = await response.json();
                return errorData;
            }

            // Return the updated resource data
            const updatedResource = await response.json();
            return { updatedResource, id,ret,resourcesType };
        } catch (error) {
            // Handle network or unexpected errors
            return 'error';
        }
    }
);
export const setResourceAsync = createAsyncThunk(
    "resources/setResourceAsync",
    async (resourcesType) => {
        try {

            const url = "http://127.0.0.1:8082/get/" + resourcesType;

            // Replace with your actual API endpoint
            const response = await fetch(url, {
                method: "GET",
            });

            if (!response.ok) {
                // Handle HTTP errors
                const errorData = await response.json();
                return errorData;
            }

            // Return the updated resource data
            const updatedResource = await response.json();
            return {updatedResource,resourcesType};
        } catch (error) {
            // Handle network or unexpected errors
            return 'error';
        }
    }
);
export const deleteResourceAsync = createAsyncThunk(
    "resources/deleteResourceAsync",
    async ({ resourcesType, id }) => {
        try {
            const newData = { "id": id }
            console.log(resourcesType)
            const url = "http://127.0.0.1:8082/delete/" + resourcesType;

            // Replace with your actual API endpoint
            const response = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json", // Set the content type
                },
                body: JSON.stringify(newData),
            });

            if (!response.ok) {
                // Handle HTTP errors
                const errorData = await response.json();
                return errorData;
            }

            // Return the updated resource data
            const updatedResource = await response.json();
            return { updatedResource, id,resourcesType };
        } catch (error) {
            // Handle network or unexpected errors
            return 'error';
        }
    }
);
export const { updateResource, deleteResource } = resourcesSlice.actions;
export default resourcesSlice.reducer;
import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setResourceAsync } from './state/resources/resourcesSlice';
import './AddList.css';
import 'leaflet/dist/leaflet.css';
const AddList = ({resourcetype, format, setloading }) => {
  const col_name = format
  const dispatch=useDispatch()
  const [formData, setFormData] = useState(() => {
    const initialData = {};
    col_name.forEach((key, index) => {
      initialData[key] = "";
    });
    return initialData;
  })
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value, // Update the specific field
    }));
  };
  async function handle_Add() {
      const fetchResources = async () => {
        try {
          // Replace with your actual API endpoint
          console.log(formData)
          const response = await fetch("http://13.115.67.82:8082/add/" + resourcetype, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json", // Set the content type
              },
              body: JSON.stringify(formData),
          });

          if (!response.ok) {
              // Handle HTTP errors
              const errorData = await response.json();
              return errorData;
          }

          // Return the updated resource data
          const updatedResource = await response.json();
          console.log(updatedResource)
          return;
      } catch (error) {
          // Handle network or unexpected errors
          return 'error';
      }
      };
      setloading(true)
      await fetchResources();
      const updateData = async () => {
        const resources = ['shelter', 'counseling', 'food', 'healthcare', 'outreach']
        for (const item of resources) {
          // Assuming 'shelter' is the value for each resource
          await dispatch(setResourceAsync(item));
        }
        // Wait for the async dispatch
        setloading(false); // Set loading to false once data is fetched
      };
      updateData();
  }
  return (
    <div className="add"  >
      <h2>{resourcetype} </h2>
      <p>
        fill the given input
      </p>
      <ul>
        {Object.keys(formData).map((key, i) => (
          <li>
            {key}:
            <input
              type="text"
              value={formData[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              style={{ width: '90%' }}
            />
          </li>
        ))}

      </ul>
      <p>
        <button onClick={() => { handle_Add() }}>
          Add
        </button>
      </p>
    </div>
  );
}

export default AddList;

import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { useDispatch } from 'react-redux';
import './Card.css';
import 'leaflet/dist/leaflet.css';
import { updateResourceAsync, deleteResourceAsync } from "./state/resources/resourcesSlice";
const Card = forwardRef(({ type,map,defaultCenter, item, setloading }, ref) => {
  const dispatch = useDispatch()
  const col_name = Object.keys(item)
  const id = item['id']
  const location = item['mappoint']
  const localRef = useRef(null);
  const [edit, setEdit] = useState(true)
  const [formData, setFormData] = useState(() => {
    const initialData = {};
    col_name.forEach((key, index) => {
      initialData[key] = item[key];
    });
    return initialData;
  })
  function handleOnFlyTo() {
    map.current.flyTo(location, map.current.getZoom())
    defaultCenter.current=location
  }
  async function handleCancelDelete() {

    if (!edit) {
      setFormData(() => {
        const initialData = {};
        col_name.forEach((key, index) => {
          initialData[key] = item[key];
        });
        return initialData;
      })
      setEdit(!edit)
    }
    else {
      setloading(true)
      // dispatch(deleteResource({ resourcesType: "shelter", id: id }));
      await dispatch(deleteResourceAsync({ resourcesType: type, id: id }));
      setloading(false)
    }
  }
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value, // Update the specific field
    }));
  };
  async function handleEditSave() {
    setEdit(!edit)
    if (!edit) {
      const fetchResources = async () => {
        // dispatch(updateResource({ id: id, newData: formData }));
        setloading(true)
        await dispatch(updateResourceAsync({ id: id, newData: formData, resourcesType: type }));
        setloading(false)
      };

      fetchResources();
    }
  }
  useImperativeHandle(ref, () => ({
    getRect: () => localRef.current.getBoundingClientRect(),
    focus: () => localRef.current.focus(),
  }));
  return (
    <div className="card"  >
      <h2 onClick={() => { handleOnFlyTo() }}>{formData.Name} </h2>
      <p>
        {formData.Address}
      </p>
      <ul>
        {Object.keys(formData).map((key, i) => (
          <li>
            {key}:
            <input
              className={((key !== 'id') ? edit : true) ? 'nonout' : "out"}
              type="text"
              value={formData[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              readOnly={(key !== 'id') ? edit : true}
              ref={localRef}
            />
          </li>
        ))}
      </ul>
      <p>
        <button onClick={() => { handleEditSave() }}>
          {(edit) ? "Edit" : "Save and Update"}
        </button>
        <button onClick={() => { handleCancelDelete() }}>
          {(edit) ? "Delete" : "Cancel"}
        </button>
      </p>
    </div>
  );
})

export default Card;

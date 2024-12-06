import React, { useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import './App.css';
import 'leaflet/dist/leaflet.css';
import Card from './Card';
import AddList from './AddList';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setResourceAsync } from './state/resources/resourcesSlice';
// let defaultCenter = [38.9072, -77.0369];
const defaultZoom = 20;
const iconPerson = [
  new L.Icon({
    iconUrl: require('./icon/shelter.png'),
    iconRetinaUrl: require('./icon/shelter.png'),
    iconSize: new L.Point(50, 50),
    className: 'leaflet-div-icon'
  }),
  new L.Icon({
    iconUrl: require('./icon/counseling.png'),
    iconRetinaUrl: require('./icon/counseling.png'),
    iconSize: new L.Point(50, 50),
    className: 'leaflet-div-icon'
  }),
  new L.Icon({
    iconUrl: require('./icon/food.png'),
    iconRetinaUrl: require('./icon/food.png'),
    iconSize: new L.Point(50, 50),
    className: 'leaflet-div-icon'
  }),
  new L.Icon({
    iconUrl: require('./icon/healthcare.png'),
    iconRetinaUrl: require('./icon/healthcare.png'),
    iconSize: new L.Point(50, 50),
    className: 'leaflet-div-icon'
  }),
  new L.Icon({
    iconUrl: require('./icon/outreach.png'),
    iconRetinaUrl: require('./icon/outreach.png'),
    iconSize: new L.Point(50, 50),
    className: 'leaflet-div-icon'
  }),];
function LocationMarker({ defaultCenter }) {
  const [position, setPosition] = useState(null)

  const map = useMapEvents({
    click() {
      map.locate()
    },
    locationfound(e) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
      defaultCenter.current = e.latlng
    },
  })

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  )
}

function App() {
  const resources = ['shelter', 'counseling', 'food', 'healthcare', 'outreach']
  const add_format={
    'shelter':["Name" ,"City" ,"Address","Description","ContactInfo" ,"HoursOfOperation","ORG","TargetUser" ,"Capacity" ,"CurrentUse"],
    'counseling' :["Name","City","Address","Description","ContactInfo","HoursOfOperation","counselorName"],
    'food':["Name","City" ,"Address","Description" ,"ContactInfo" ,"HoursOfOperation","TargetUser" ,"Quantity" ,"ExpirationDate"],
    'healthcare':[ "Name","City" ,"Address","Description","HoursOfOperation","eligibilityCriteria","ContactInfo"],
    'outreach':[    "Name","City","Address","Description","ContactInfo","HoursOfOperation","TargetAudience"]
}
  const dispatch = useDispatch();
  const defaultCenter = useRef([38.9072, -77.0369])
  const [loading, setLoading] = useState(true); // Track loading state
  const [initialized, setInitialized] = useState(false);
  const [add, setAdd] = useState(false);
  const mapRef = useRef();
  const cardRef = useRef([]);
  // const [Data, setData] = useState([]); // Example state
  const Data = useSelector((state) => state.resources)
  const handleFocus = (i) => {
    if (cardRef.current[i]) {
      cardRef.current[i].focus(); // Focuses the element and scrolls to it
    }
  };
  async function get_add_format(add_type){
    const url = "http://127.0.0.1:8082/getformat/" + add_type;
  
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
    const add_format = await response.json();
    console.log(add_format)
    
    return add_format;
  }
  // useEffect template
  useEffect(() => {
    if (!initialized) {
      const fetchResources = async () => {
        for (const item of resources) {
          // Assuming 'shelter' is the value for each resource
          await dispatch(setResourceAsync(item));
        }
        // Wait for the async dispatch
        setLoading(false); // Set loading to false once data is fetched
        setInitialized(true); // Mark as initialized
      };

      fetchResources();
    }
  }, [dispatch, initialized]);
  if (loading) {
    return <div className="loading">Loading resources...</div>; // Show a loading indicator while fetching data
  }
  return (
    <div className="App">
      <MapContainer  ref={mapRef} center={defaultCenter.current} zoom={defaultZoom}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {(() => {
          let count = 0; // Initialize count here
          return resources.map((resource, resourceIndex) => {
            if (Data[resource].length <= 0) {
              return null; // Skip empty resources
            }

            return Data[resource].map((item, itemIndex) => {
              const currentCount = count++; // Increment count safely
              return (
                <Marker
                  key={`marker-${resourceIndex}-${itemIndex}`} // Unique key for React
                  position={item['mappoint']}
                  icon={iconPerson[resourceIndex]}
                >
                  <Popup>
                    {item.Name} <br /> {item.Address} <br />
                    <button onClick={() => handleFocus(currentCount)}>
                      Show in the list
                    </button>
                  </Popup>
                </Marker>
              );
            });
          });
        })()}

        <LocationMarker defaultCenter={defaultCenter} />
      </MapContainer>
      <div className="sidebar">
        <div className='buttonhouse'>
            <button
              onClick={() => {setAdd(!add)}} // Define your action
              className='add_button'
              style={{marginBottom:10}}
            >
              {add?"Update & Delete mode":"Add Mode"}
            </button>
        </div>
        {!add?(() => {
          let count = 0; // Initialize count locally within a self-contained function
          return resources.map((item, index) =>
          (Data[item].length <= 0 ? (
            <div key={`empty-${index}`} /> // Add a unique key for React
          ) : (
            Data[item].map((dataItem, dataIndex) => (
              <Card
                key={`card-${count}`} // Unique key for React
                map={mapRef}
                type={item}
                defaultCenter={defaultCenter}
                item={dataItem}
                setloading={setLoading}
                ref={(el) => (cardRef.current[count++] = el)} // Increment count correctly
              />
            ))
          ))
          );
        })():
        resources.map((item,index)=>(
        <AddList resourcetype={item} format={add_format[item]} setloading={setInitialized}/> )
      )}
      </div>
    </div>
  );
}

export default App;

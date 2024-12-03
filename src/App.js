import React, { useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import './App.css';
import 'leaflet/dist/leaflet.css';
import Card from './Card';
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
  const dispatch = useDispatch();
  const defaultCenter = useRef([38.9072, -77.0369])
  const [loading, setLoading] = useState(true); // Track loading state
  const [initialized, setInitialized] = useState(false);
  const mapRef = useRef();
  const cardRef = useRef([]);
  // const [Data, setData] = useState([]); // Example state
  const Data = useSelector((state) => state.resources)
  const handleFocus = (i) => {
    if (cardRef.current[i]) {
      cardRef.current[i].focus(); // Focuses the element and scrolls to it
    }
  };
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
      <MapContainer ref={mapRef} center={defaultCenter.current} zoom={defaultZoom}>
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
        {(() => {
          let count = 0; // Initialize count locally within a self-contained function
          return resources.map((item, index) =>
            Data[item].length <= 0 ? (
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
            )
          );
        })()}
      </div>
    </div>
  );
}

export default App;

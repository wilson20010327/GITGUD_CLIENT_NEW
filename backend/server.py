
from geopy.geocoders import Nominatim
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from dotenv import load_dotenv
import os
load_dotenv()
app = Flask(__name__)
CORS(app)
geolocator = Nominatim(user_agent="myGeocoder")
key_order = ["id", "Name", "City"]
GET_KEY=os.getenv("GET_KEY")
MODIFY_KEY=os.getenv("MODIFY_KEY")
ip=os.getenv("SERVICE_IP")
def getresources(category):
    url = f"http://{ip}:8080/resources/{category.lower()}/getAll"
    headers = {
        "Authorization": "Bearer "+GET_KEY
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        ret=[]
        for item in data:
        # create_map()
            # print(f'{item}\n')
            address = item['Address']
            geocoded_location = geolocator.geocode(address, timeout=10)
            if geocoded_location:
                lat = geocoded_location.latitude
                lon = geocoded_location.longitude
            item['mappoint']=(lat,lon)
            # print(item['_id']["$oid"])
            item['id']=item['_id']["$oid"]
            del item['_id']

            ret.append(item)
        return jsonify(ret), 200
    except Exception as e:
        print(f"Error fetching data from API: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
def updateresources(category):
    url = f"http://{ip}:8080/resources/{category.lower()}/update"
    headers = {
        "Authorization": "Bearer "+MODIFY_KEY
    }
    try:
        raw_data = request.get_data()

        # Print or process the raw data if needed
        # print(f"Received raw data: {raw_data}")

        response = requests.patch(url, headers=headers,data=raw_data)
        return  jsonify({
            'status': response.status_code,
            'response_text': response.text
        })
    except Exception as e:
        print(f"Error fetching data from API: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
def addresources(category):
    url = f"http://{ip}:8080/resources/{category.lower()}/add"
    headers = {
        "Authorization": "Bearer "+MODIFY_KEY
    }
    try:
        raw_data = request.get_data()

        # Print or process the raw data if needed
        # print(f"Received raw data: {raw_data}")

        response = requests.post(url, headers=headers,data=raw_data)
        return  jsonify({
            'status': response.status_code,
            'response_text': response.text
        })
    except Exception as e:
        print(f"Error fetching data from API: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500    
def deletesources(category):
    url = f"http://{ip}:8080/resources/{category.lower()}/delete"
    headers = {
        "Authorization": "Bearer "+MODIFY_KEY
    }
    try:
        raw_data = request.get_data()

        # Print or process the raw data if needed
        # print(f"Received raw data: {raw_data}")

        response = requests.delete(url, headers=headers,data=raw_data)
        return  jsonify({
            'status': response.status_code,
            'response_text': response.text
        })
    except Exception as e:
        print(f"Error fetching data from API: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
def getformat(category):
    try:
        add_format={
            'shelter':["Name" ,"City" ,"Address","Description","ContactInfo" ,"HoursOfOperation","ORG","TargetUser" ,"Capacity" ,"CurrentUse"],
            'counseling' :["Name","City","Address","Description","ContactInfo","HoursOfOperation","counselorName"],
            'food':["Name","City" ,"Address","Description" ,"ContactInfo" ,"HoursOfOperation","TargetUser" ,"Quantity" ,"ExpirationDate"],
            'healthcare':[ "Name","City" ,"Address","Description","HoursOfOperation","eligibilityCriteria","ContactInfo"],
            'outreach':[    "Name","City","Address","Description","ContactInfo","HoursOfOperation","TargetAudience"]
        }
        return  jsonify({
            'status': 200,
            'response_text': add_format[category]
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
@app.route('/get/<type>', methods=['GET'])
def get_resources(type):
    return getresources(type)
@app.route('/update/<type>', methods=['PATCH'])
def resources(type):
    return updateresources(type)
@app.route('/add/<type>', methods=['POST'])
def add_resources(type):
    return addresources(type)
@app.route('/delete/<type>', methods=['DELETE'])
def delete_resources(type):
    return deletesources(type)
@app.route('/getformat/<type>', methods=['GET'])
def get_format(type):
    return getformat(type)
if __name__ == "__main__":    
    app.run(host='0.0.0.0', port=8082)
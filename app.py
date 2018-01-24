# -*- coding: utf-8 -*-
"""
Created on Fri Jan 12 15:17:05 2018

@author: hiroellis
"""

import pandas as pd
from shapely.geometry import Point, shape

from flask import Flask
from flask import render_template
import json

data_path='./Data/'

# geojson file that outlines the lat long shape of NYC neighborhoods
with open(data_path + '/geojson/nycnh.json') as data_file: 
    nh_json=json.load(data_file)

# Function returns citibike trip starting NYC neighborhood
def get_neighborhood(longitude, latitude, nh_json):
    
    point = Point(longitude, latitude)
    
    for record in nh_json['features']:
        polygon = shape(record['geometry'])
        if polygon.contains(point):
            return record['properties']['neighborhood']
    return 'other'

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/data")
def get_data():
    df = pd.read_csv(data_path + '/citibike-trips/2013-07_tripdata.csv')

    df['starting neighborhood'] = df.apply(lambda row: get_neighborhood(row['start station longitude'], row['start station latitude'],nh_json), axis=1)
    df['ending neighborhood'] = df.apply(lambda row: get_neighborhood(row['end station longitude'], row['end station latitude'],nh_json), axis=1)
   

    return df.to_json(orient='records')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
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

data_path='.Data/'

def get_location_start(longitude, latitude, nh_json):
    
    point = Point(longitude, latitude)
    
    for record in nh_json['features']:
        polygon = shape(record['geometry'])
        if polygon.contains(point):
            return record['properties']['neighborhood']
        return 'other'

with open(data_path + 'geojson/nycnh.json') as data_file: 
    nh_json=json.load(data_file)

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/data")
def get_data():
    df = pd.read_csv('C:/Users/hiroellis/Desktop/urban-work/Data/citibike-trips/citibiketest.csv')

    df['starting neighborhood'] = df.apply(lambda row: get_location_start(row['start station longitude'], row['start station latitude'],nh_json), axis=1)
   
    
    return df.to_json(orient='records')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
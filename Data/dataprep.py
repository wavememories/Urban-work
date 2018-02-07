# -*- coding: utf-8 -*-
"""
Created on Fri Jan 12 14:07:06 2018

@author: hiroellis
""" 

import pandas as pd
import json

data_path =  './Data/'

df = pd.read_csv(data_path + "/citibike-trips/2013-07_tripdata.csv")

print(df)

from shapely.geometry import Point, shape

with open(data_path + '/geojson/nycnh.json') as data_file:
    nh_json=json.load(data_file)
    
def get_neighborhood(longitude, latitude, nh_json):
    point = Point(longitude, latitude)
    for record in nh_json['features']:
        polygon = shape(record['geometry'])
        if polygon.contains(point):
            return record['properties']['neighborhood']
    return 'other'

df['starting neighborhood'] = df.apply(lambda row: get_neighborhood(row['start station longitude'], row['start station latitude'],nh_json), axis=1)
df['ending neighborhood'] = df.apply(lambda row: get_neighborhood(row['end station longitude'], row['end station latitude'],nh_json), axis=1)
   

df.to_json(orient='records')

print(df)
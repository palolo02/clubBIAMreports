#################################################
# Import Modules
#################################################

from flask import Flask, Response
from flask import render_template
from flask import redirect
from flask import jsonify
from flask import request
#from flask import current_app as app
import pandas as pd
import json
import api_db

# Modules needed
import pandas as pd
import numpy as np

#import sqlalchemy
from flask_sqlalchemy import SQLAlchemy
from credentials import Config
#from sqlalchemy.ext.automap import automap_base
#from sqlalchemy.orm import Session
#from sqlalchemy.orm import sessionmaker
#from sqlalchemy import create_engine, func, inspect, and_


import os
import glob
import datetime
import calendar

#################################################
# DB Connection
#################################################
app = Flask(__name__, instance_relative_config=False)
app.config.from_object('credentials.Config')
db = SQLAlchemy(app)
#db.get_engine(bind=Config.SQLALCHEMY_DATABASE_URI)
print(Config.SQLALCHEMY_DATABASE_URI)

#################################################
# Flask Routes
#################################################
@app.route("/")
def home():
    print("======================================")
    return render_template("index.html")

@app.route("/year")
def year():
    print("======================================")
    return render_template("results.html")

@app.route("/overview")
def overview():
    print("======================================")
    return render_template("overview.html")
#################################################
# Flask API
#################################################
@app.route("/api/v1/getResultsPerDateRange/<year_>/<month_>",methods=["GET"])
def resultsPerDateRange(year_,month_):
    json_results = api_db.getResultsPerDateRange(int(year_),int(month_),db.session.session_factory,db.get_engine())
    json_results = json_results.to_json()
    return jsonify(json_results)

@app.route("/api/v1/getStatsPerDateRange/<year_>/<month_>",methods=["GET"])
def statisticsPerDateRange(year_,month_):
    json_results = api_db.getStatsPerDateRange(int(year_),int(month_),db.get_engine())
    json_results = json_results.to_json()
    return jsonify(json_results)

@app.route("/api/v1/getStatsPerYear/<year_>",methods=["GET"])
def statisticsPerYear(year_):
    json_results = api_db.getStatsPerYear(int(year_),db.get_engine())
    json_results = json_results.to_json()
    return jsonify(json_results)

@app.route("/api/v1/getStatsPerClub/<year_>",methods=["GET"])
def statisticsPerClub(year_):
    json_results = api_db.getStatsPerClub(int(year_),db.get_engine())
    json_results = json_results.to_json()
    return jsonify(json_results)

@app.route("/api/v1/getStatsPerSessionType/<year_>",methods=["GET"])
def statisticsPerSessionType(year_):
    json_results = api_db.getStatsPerSessionType(int(year_),db.get_engine())
    json_results = json_results.to_json()
    return jsonify(json_results)

@app.route("/api/v1/getAllResults/<member_>/<year_>",methods=["GET"])
def resultsAllResults(member_,year_):
    json_results = api_db.getAllResults(member_,int(year_),db.session.session_factory,db.get_engine())
    json_results = json_results.to_json()
    return jsonify(json_results)

@app.route("/api/v1/getRoleResults/<member_>/<year_>",methods=["GET"])
def resultsRoleResults(member_,year_):
    json_results = api_db.getResultsPerMember(member_,int(year_),db.session.session_factory,db.get_engine())
    json_results = json_results.to_json()
    return jsonify(json_results)

@app.route("/api/v1/getDetailedResults/<member_>/<year_>",methods=["GET"])
def resultsDetailedResults(member_,year_):
    json_results = api_db.getDetailedResultsPerMember(member_,int(year_),db.session.session_factory,db.get_engine())
    json_results = json_results.to_json()
    return jsonify(json_results)


if __name__ == "__main__":
    app.run()
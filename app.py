#################################################
# Import Modules
#################################################

from flask import Flask, Response
from flask import render_template
from flask import redirect
from flask import jsonify
from flask import request
import pandas as pd
import json
import api_db

# Modules needed
import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, func, inspect, and_


import os
import glob
import datetime
import calendar

# import variables from config file
from credentials import host
from credentials import pwd
from credentials import usr
from credentials import dialect
from credentials import port
from credentials import db

#################################################
# DB Connection
#################################################

app = Flask(__name__)


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


@app.errorhandler(404)
def pageNotFound(e):
    return render_template("404.html"), 404

@app.errorhandler(500)
def internalServerError(e):
    return render_template("500.html"), 5050

#################################################
# Flask API
#################################################

@app.route("/api/v1/getResultsPerDateRange/<year_>/<month_>",methods=["GET"])
def resultsPerDateRange(year_,month_):
    json_results = api_db.getResultsPerDateRange(int(year_),int(month_))
    json_results = json_results.to_json()
    return jsonify(json_results)

@app.route("/api/v1/getStatsPerDateRange/<year_>/<month_>",methods=["GET"])
def statisticsPerDateRange(year_,month_):
    json_results = api_db.getStatsPerDateRange(int(year_),int(month_))
    json_results = json_results.to_json()
    return jsonify(json_results)

@app.route("/api/v1/getStatsPerYear/<year_>",methods=["GET"])
def statisticsPerYear(year_):
    json_results = api_db.getStatsPerYear(int(year_))
    json_results = json_results.to_json()
    return jsonify(json_results)

@app.route("/api/v1/getStatsPerClub/<year_>",methods=["GET"])
def statisticsPerClub(year_):
    json_results = api_db.getStatsPerClub(int(year_))
    json_results = json_results.to_json()
    return jsonify(json_results)

@app.route("/api/v1/getStatsPerSessionType/<year_>",methods=["GET"])
def statisticsPerSessionType(year_):
    json_results = api_db.getStatsPerSessionType(int(year_))
    json_results = json_results.to_json()
    return jsonify(json_results)


if __name__ == "__main__":
    app.run(debug=True)
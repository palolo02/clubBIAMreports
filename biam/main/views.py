from flask import Flask, Response
from flask import render_template
from flask import redirect
from flask import jsonify
from flask import request
from . import main
from flask_login import login_required
import json
from .. import api_db 
from .. import db


#################################################
# Flask Routes
#################################################

@main.route("/")
@login_required
def home():
    print("======================================")
    return render_template("index.html")

@main.route("/year")
@login_required
def year():
    print("======================================")
    return render_template("year.html")

@main.route("/overview")
@login_required
def overview():
    print("======================================")
    return render_template("overview.html")

@main.route("/member")
@login_required
def member():
    print("======================================")
    return render_template("member.html")

#################################################
# Flask API
#################/################################

@main.route("/api/v1/getResultsPerDateRange/<int:year_>/<int:month_>",methods=['GET', 'POST'])
def resultsPerDateRange(year_,month_):
    json_results = api_db.getResultsPerDateRange(int(year_),int(month_),db)
    json_results = json_results.to_json()
    return jsonify(json_results)

@main.route("/api/v1/getStatsPerDateRange/<int:year_>/<int:month_>",methods=['GET', 'POST'])
def statisticsPerDateRange(year_,month_):
    json_results = api_db.getStatsPerDateRange(int(year_),int(month_),db)
    json_results = json_results.to_json()
    return jsonify(json_results)

@main.route("/api/v1/getStatsPerYear/<int:year_>",methods=['GET', 'POST'])
def statisticsPerYear(year_):
    json_results = api_db.getStatsPerYear(int(year_),db)
    json_results = json_results.to_json()
    return jsonify(json_results)

@main.route("/api/v1/getStatsPerClub/<int:year_>",methods=['GET', 'POST'])
def statisticsPerClub(year_):
    json_results = api_db.getStatsPerClub(int(year_),db)
    json_results = json_results.to_json()
    return jsonify(json_results)

@main.route("/api/v1/getStatsPerSessionType/<int:year_>",methods=['GET', 'POST'])
def statisticsPerSessionType(year_):
    json_results = api_db.getStatsPerSessionType(int(year_),db)
    json_results = json_results.to_json()
    return jsonify(json_results)

@main.route("/api/v1/getAllResults/<member_>/<int:year_>",methods=['GET', 'POST'])
def resultsAllResults(member_,year_):
    json_results = api_db.getAllResults(member_,int(year_),db)
    json_results = json_results.to_json()
    return jsonify(json_results)

@main.route("/api/v1/getRoleResults/<member_>/<int:year_>",methods=['GET', 'POST'])
def resultsRoleResults(member_,year_):
    json_results = api_db.getResultsPerMember(member_,int(year_),db)
    json_results = json_results.to_json()
    return jsonify(json_results)

@main.route("/api/v1/getDetailedResults/<member_>/<int:year_>",methods=['GET', 'POST'])
def resultsDetailedResults(member_,year_):
    json_results = api_db.getDetailedResultsPerMember(member_,int(year_),db)
    json_results = json_results.to_json()
    return jsonify(json_results)

@main.route("/api/v1/getActiveMembers/<int:year_>",methods=['GET', 'POST'])
def resultsActiveMembers(year_):
    json_results = api_db.getActiveMembers(int(year_),db)
    json_results = json_results.to_json()
    return jsonify(json_results)

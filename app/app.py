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
from config import appConfig

import os
import glob
import datetime
import calendar

#################################################
# App config
#################################################

#if __name__ == "__main__":
#    create_app()
#    app.run(debug=True)
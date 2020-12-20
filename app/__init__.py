from flask import Flask, Response
from flask import render_template
from flask import redirect
from flask import jsonify
from flask import request
from flask_sqlalchemy import SQLAlchemy
from config import appConfig


db = SQLAlchemy()


def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(appConfig[config_name])
    appConfig[config_name].init_app(app)
    db.init_app(app)

    # Attach routes and custom error pages here
    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    return app

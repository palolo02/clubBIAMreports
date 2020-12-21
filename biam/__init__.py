from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import appConfig


db = SQLAlchemy()




def create_app(config_name):
    print(config_name)
    newWebApp = Flask(__name__)
    newWebApp.config.from_object(appConfig[config_name])
    appConfig[config_name].init_app(newWebApp)
    db.init_app(newWebApp)

    # Attach routes and custom error pages here
    from .main import main as main_blueprint
    newWebApp.register_blueprint(main_blueprint)

    return newWebApp

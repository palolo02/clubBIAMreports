from flask import Flask, render_template
from flask_mail import Mail
from flask_bootstrap import Bootstrap
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from config import appConfig


db = SQLAlchemy()
mail = Mail()
bootstrap = Bootstrap()

login_manager = LoginManager()
login_manager.login_view = 'auth.login'




def create_app(config_name):
    print(config_name)
    newWebApp = Flask(__name__)
    newWebApp.config.from_object(appConfig[config_name])
    appConfig[config_name].init_app(newWebApp)
    db.init_app(newWebApp)
    mail.init_app(newWebApp)
    bootstrap.init_app(newWebApp)
    login_manager.init_app(newWebApp)

    # Attach routes and custom error pages here
    from .main import main as main_blueprint
    newWebApp.register_blueprint(main_blueprint)
    # Attach auth blueprints
    from .auth import auth as auth_blueprint
    newWebApp.register_blueprint(auth_blueprint, url_prefix='/auth')

    return newWebApp

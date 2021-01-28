# Credentials
import os
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:   
    # App
    SECRET_KEY = os.environ.get('SECRET_KEY')
    FLASK_APP = os.environ.get('FLASK_APP')
    FLASK_ENV = os.environ.get('FLASK_ENV')

    # Database
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Mail Server
    MAIL_SERVER = "smtp.googlemail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS','')
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME','')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD','')
    FLASKY_MAIL_SUBJECT_PREFIX = os.environ.get('FLASKY_MAIL_SUBJECT_PREFIX','')
    FLASKY_MAIL_SENDER = os.environ.get('FLASKY_MAIL_SENDER','')

    @staticmethod
    def init_app(app):
        pass

class DevConfig(Config):
    # Set Flask configuration from file
    dialect = os.environ.get('','postgresql+psycopg2')
    host = os.environ.get('HOST_DEV','localhost')
    port = os.environ.get('PORT_DEV','5432')
    db = os.environ.get('DB_DEV','biam')
    usr = os.environ.get('USR_DEV','postgres')
    pwd = os.environ.get('PWD_DEV','admin')
    SQLALCHEMY_DATABASE_URI = f'{dialect}://{usr}:{pwd}@{host}:{port}/{db}'

class TestingConfig(Config):
    DEBUG = True
    # Set Flask configuration from file
    dialect = 'postgresql+psycopg2'
    host = os.environ.get('HOST_QA','localhost')
    port = os.environ.get('PORT_QA','5432')
    db = os.environ.get('DB_QA','biam')
    usr = os.environ.get('USR_QA','postgres')
    pwd = os.environ.get('PWD_QA','admin')
    SQLALCHEMY_DATABASE_URI = f'{dialect}://{usr}:{pwd}@{host}:{port}/{db}'


class ProdConfig(Config):
    # Set Flask configuration from file
    dialect = os.environ.get('DB_DIALECT')
    host = os.environ.get('DB_HOST')
    port = os.environ.get('DB_PORT')
    db = os.environ.get('DB')
    usr = os.environ.get('DB_USR')
    pwd = os.environ.get('DB_PWD')
    SQLALCHEMY_DATABASE_URI = f'{dialect}://{usr}:{pwd}@{host}:{port}/{db}'
    print(SQLALCHEMY_DATABASE_URI)


# Variable to hold configuration environments
appConfig = {
    'dev' : DevConfig,
    'tetsting' : TestingConfig,
    'prod' : ProdConfig,    
    'default' : ProdConfig
}
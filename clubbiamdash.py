import os
from biam import create_app, db
from biam.models import User, UserRole
#from flask_migrate import Migrate

# Choose the configuration variable to use
webApp = create_app('default')

@webApp.shell_context_processor
def make_shell_context():
    return dict(db=db)


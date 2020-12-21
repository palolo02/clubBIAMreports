import os
from biam import create_app, db

# Choose the configuration variable to use
webApp = create_app('default')

@webApp.shell_context_processor
def make_shell_context():
    return dict(db=db)


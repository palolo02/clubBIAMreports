import os
from app import create_app, db

# Choose the configuration variable to use
app = create_app('default')

@app.shell_context_processor
def make_shell_context():
    return dict(db=db)


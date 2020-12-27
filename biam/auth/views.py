from flask import render_template
from flask_login import login_user, logout_user, login_required, current_user
from .forms import LoginForm
from . import auth

@auth.route('/login')
def login():
    form = LoginForm()
    return render_template('auth/login.html', form = form)
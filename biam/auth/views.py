from flask import render_template, redirect, request, url_for, flash, session
from flask_login import login_user, logout_user, login_required, current_user
from .forms import LoginForm
from . import auth
from ..models import User
from .. import db
from .. import api_db

@auth.route('/login', methods=['GET','POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(user_desc=form.email.data).first()
        if user is not None and user.verify_password(form.password.data):
            login_user(user,form.remember_me.data)
            session['lastClubSession'] = api_db.getLastSession(db)
            # Get the original URL requested by the user (if any)
            next = request.args.get('next')
            if next is None or not next.startswith("/"):
                next = url_for('main.year')
            return redirect(next)
        flash('Invalid username or password')
    return render_template('auth/login.html', form = form)

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    session.pop('username', 'Error')
    flash('You have been logged out')
    return redirect(url_for('main.year'))
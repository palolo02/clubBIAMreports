from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from . import db, login_manager

print('Loading Models')

class UserRole(db.Model):
    __tablename__ = 'UserRole'
    user_role_id = db.Column(db.Integer, primary_key=True)
    user_role_desc = db.Column(db.String(64), unique=True, index=True)
    is_active = db.Column(db.Boolean)
    permission = db.Column(db.SmallInteger)
    start_dt = db.Column(db.Date)
    update_dt = db.Column(db.Date)

    def __repr__(self):
        return '<UserRole %r>' % self.name



class User(UserMixin, db.Model):
    __tablename__ = 'User'
    user_id = db.Column(db.Integer, primary_key=True)
    user_desc = db.Column(db.String(64), unique=True, index=True)
    name = db.Column(db.String(64), unique=False, index=True)
    password_hash = db.Column(db.String(128))
    user_role_id = db.Column(db.SmallInteger, db.ForeignKey('UserRole.user_role_id'))    
    is_active = db.Column(db.Boolean)
    start_dt = db.Column(db.Date)
    update_dt = db.Column(db.Date)
    
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return '<User %r>' % self.user_desc


@login_manager.user_loader
def load_user(user_id):
    return User.query.filter_by(alternative_id=int(user_id)).first()

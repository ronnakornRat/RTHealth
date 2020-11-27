# pip install flask
# pip install flask-sqlalchemy
# migrated
# pip install flask-migrate
from datetime import datetime
import sys
import json

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate

# for verifying google token
from google.oauth2 import id_token
from google.auth.transport import requests
# for decoding uri
import urllib.parse

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.testsqlite'
db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    # new 'sub' in google response
    user_id = db.Column(db.String(30), unique=True, nullable=False, default='user')
    session_token = db.Column(db.String(100), unique=True, nullable=False,  default='token')
    time_created = db.Column(db.DateTime, default=datetime.now)

    def __repr__(self):
        return '<User %r>' % self.username


class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    participant1 = db.Column(
        db.String(80), db.ForeignKey('user.id'), nullable=False)
    participant2 = db.Column(
        db.String(80), db.ForeignKey('user.id'), nullable=False)

# for admin use


@app.route('/users', methods=['GET', 'POST'])
def all_users():
    if request.method == 'GET':
        # return all user
        user_list = User.query.order_by(User.username).all()
        ret_val = []

        for user in user_list:
            ret_val.append({
                'user_id': user.id,
                'username': user.username,
                'google_id': user.user_id,
                'time_created': user.time_created
            })
        return jsonify(ret_val)

    if request.method == 'POST':
        # make new user
        user = User(username=request.form['username'])
        db.session.add(user)
        db.session.commit()
        return user
    return 'unknown error'

# managing user data


@app.route('/users/<username>', methods=['GET', 'POST', 'DELETE'])
def get_user(username):
    user = User.query.filter_by(username=username).first()
    if request.method == 'GET':
        # get 1 user
        return 'id {} username {} created at {}'.format(user.id, user.username, user.time_created)

    if request.method == 'POST':
        # edit username
        user = User.query.filter_by(username=username).first()
        old_name = user.username
        new_name = request.form['username']
        user.username = new_name
        db.session.commit()

        return 'change user name: {} -> {}'.format(old_name, new_name)

    if request.method == 'DELETE':
        # delete 1 user
        old_name = user.username
        db.session.delete(user)
        db.session.commit()
        return 'user <{}> is deleted'.format(old_name)

    return 'unknown error'

# authenication


@app.route('/users/<username>/login', methods=['POST'])
def login(username):
    # check if user exist in database
    decode_username = urllib.parse.unquote(username)
    print('login: user =', username, file=sys.stderr)
    user = User.query.filter_by(username=decode_username).first()
    result = {'data': '',
              'status': 'unknown'
              }
    token = request.form['idtoken']
    if user:
        # user exist, update the token
        result = verify_token(token)
        update_token(decode_username, token)
    else:
        # user not exist make a new user
        result = verify_token(token, make_new_user=1, username=decode_username)

    return result


def verify_token(token, make_new_user=0, username=''):
    CLIENT_ID = "1044675055259-dtg2j9c75uuapbu73qukltu25ptuirql.apps.googleusercontent.com"

    ret_val = {'data': '',
               'status': 'unknown'
               }
    try:
        # Specify the CLIENT_ID of the app that accesses the backend:
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), CLIENT_ID)

        # ID token is valid. Get the user's Google Account ID from the decoded token.
        userid = idinfo['sub']
        print(json.dumps(idinfo, indent=4, sort_keys=True), file=sys.stderr)
        ret_val = {'data': userid,
                   'status': 'ok',
                   'action': 'verify token'
                   }
    except ValueError as e:
        # Invalid token
        print('error:', e, file=sys.stderr)
        ret_val = {'data': e,
                   'status': 'error'
                   }

    if make_new_user == 1:
        # make new user
        user = User(username=username,
                    user_id=idinfo['sub'], session_token=token)
        db.session.add(user)
        db.session.commit()
        ret_val['action'] = 'make new user'

    return jsonify(ret_val)

@app.route('/google/<user_id>/verify', methods=['GET'])



def update_token(username, token):
    user = User.query.filter_by(username=username).first()
    user.session_token = token
    db.session.commit()


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
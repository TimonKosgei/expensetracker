from flask import Flask, jsonify
from flask_restful import Api
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from database import db

from resources import UserRegistrationResource, UserLoginResource, TransactionResource  

#config
app = Flask(__name__)
CORS(app)

# --- Config ---
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "super-secret-key"

# --- Initialize extensions ---
db.init_app(app)
jwt = JWTManager(app)
api = Api(app)
migrate = Migrate(app, db)


# JWT error handlers to return JSON responses the frontend can inspect
@jwt.unauthorized_loader
def missing_token_callback(reason):
    # Called when no JWT is present in a protected endpoint
    return jsonify({'message': reason}), 401


@jwt.invalid_token_loader
def invalid_token_callback(reason):
    # Called when a token is provided but invalid
    return jsonify({'message': reason}), 422


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    # Called when a token has expired
    return jsonify({'message': 'Token has expired'}), 401


@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    return jsonify({'message': 'Token has been revoked'}), 401

#routes initialization
api.add_resource(UserRegistrationResource, "/api/register")
api.add_resource(UserLoginResource, "/api/login")
api.add_resource(TransactionResource, "/api/transactions")


if __name__ == '__main__':
    app.run(debug=True)
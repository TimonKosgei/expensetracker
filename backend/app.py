from flask import Flask
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

#routes initialization
api.add_resource(UserRegistrationResource, "/api/register")
api.add_resource(UserLoginResource, "/api/login")
api.add_resource(TransactionResource, "/api/transactions")


if __name__ == '__main__':
    app.run(debug=True)
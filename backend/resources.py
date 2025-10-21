from flask import request
from flask_restful import Resource
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from database import db
from models import User, Transaction

class UserRegistrationResource(Resource):
    def post(self):
        data  = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if User.query.filter((User.username == username) | (User.email == email)).first():
            return {'message': 'User with that username or email already exists'}, 400
        
        hashed_pw = generate_password_hash(password)
        new_user = User(username = username, email = email, password = hashed_pw)
        db.session.add(new_user)
        db.session.commit()
        return {'message': 'User created successfully'}, 201


class UserLoginResource(Resource):
    def post(self):
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            access_token = create_access_token(identity=user.id)
            return {'access_token': access_token}, 200
        return {'message': 'Invalid credentials'}, 401
    

class TransactionResource(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        amount = data.get('amount')
        description = data.get('description')
        date = data.get('date')
        new_transaction = Transaction(amount=amount, description=description, date=date, user_id=user_id)
        db.session.add(new_transaction) 
        db.session.commit()
        return {'message': 'Transaction added successfully'}, 201
    
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        transactions = Transaction.query.filter_by(user_id=user_id).all()
        result = []
        for txn in transactions:
            result.append({
                'id': txn.id,
                'amount': txn.amount,
                'description': txn.description,
                'date': txn.date.isoformat()
            })
        return {'transactions': result}, 200
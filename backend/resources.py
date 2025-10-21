from flask import request, jsonify, make_response
from flask_restful import Resource
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from database import db
from models import User, Transaction
from datetime import datetime

class UserRegistrationResource(Resource):
    def post(self):
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if User.query.filter((User.username == username) | (User.email == email)).first():
            return jsonify({'message': 'User with that username or email already exists'}), 400

        hashed_pw = generate_password_hash(password)
        new_user = User(username=username, email=email, password=hashed_pw)
        db.session.add(new_user)
        db.session.commit()
        return make_response(jsonify({'message': 'User created successfully'}), 201)


class UserLoginResource(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password, password):
            access_token = create_access_token(identity=user.email)
            return make_response(jsonify({'access_token': access_token}), 200)
        return make_response(jsonify({'message': 'Invalid credentials'}), 401)


class TransactionResource(Resource):
    @jwt_required()
    def post(self):
        email = get_jwt_identity()
        data = request.get_json()
        amount = data.get('amount')
        description = data.get('description')
        date = data.get('date')
        transaction_type = data.get('transaction_type', 'expense')

        if isinstance(date, str):
            try:
                date = datetime.fromisoformat(date)
            except ValueError:
                return make_response(jsonify({'message': 'Invalid date format. Please send an ISO formatted date string.'}), 400)
        user = User.query.filter_by(email=email).first()
        new_transaction = Transaction(amount=amount, description=description, date=date, transaction_type=transaction_type, user_id=user.id)
        db.session.add(new_transaction)
        db.session.commit()
        return make_response(jsonify({'message': 'Transaction added successfully'}), 201)

    @jwt_required()
    def get(self):
        email = get_jwt_identity()
        user = User.query.filter_by(email=email).first()
        transactions = Transaction.query.filter_by(user_id=user.id).all()

        result = [
            {
                'id': txn.id,
                'amount': txn.amount,
                'description': txn.description,
                'date': txn.date.isoformat(),
                'transaction_type': txn.transaction_type
            }
            for txn in transactions
        ]

        return make_response(jsonify({'transactions': result}), 200)

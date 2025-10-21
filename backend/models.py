from database import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    transactions = db.relationship('Transaction', back_populates="user", lazy=True)

    def __repr__(self):
        return f'<User {self.username}>'
    

class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)    
    description = db.Column(db.String(200))
    date = db.Column(db.DateTime, nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False, default='expense')  # 'income' or 'expense'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', back_populates="transactions", lazy=True)



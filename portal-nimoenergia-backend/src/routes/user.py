from flask import Blueprint, jsonify, request
from models.user import db, Usuario

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['GET'])
def get_users():
    users = Usuario.query.all()
    return jsonify([user.to_dict() for user in users])

@user_bp.route('/users', methods=['POST'])
def create_user():
    data = request.json
    user = Usuario(email=data['email'], nome=data['nome'], tipo=data['tipo'])
    if 'password' in data:
        user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = Usuario.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = Usuario.query.get_or_404(user_id)
    data = request.json
    user.nome = data.get('nome', user.nome)
    user.email = data.get('email', user.email)
    if 'password' in data:
        user.set_password(data['password'])
    db.session.commit()
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = Usuario.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return '', 204


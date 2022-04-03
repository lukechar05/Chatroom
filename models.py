from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()




class User(db.Model): 
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.Text, nullable = False)
    password = db.Column(db.Text, nullable = False)
    myChatrooms = db.relationship('Chatroom', backref = 'creator')

    def __init__(self, username, password):
        self.username = username
        self.password = password
    
    def __repr__(self):
        return '<user{}>'.format(self.id)


class Chat(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    msg = db.Column(db.Text, nullable = False)
    room_id = db.Column(db.Integer, db.ForeignKey('chatroom.id'))
    
    def __init__(self, msg, room_id):
        self.msg = msg
        self.room_id = room_id

    def __repr__(self):
        return '<chat{}>'.format(self.id)

    
class Chatroom(db.Model): 

    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.Text, nullable = False)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False)
    ourChats = db.relationship('Chat', backref = 'chats')

    def __init__(self, name, creator_id):
        self.name = name
        self.creator_id = creator_id

        def __repr__(self):
            return '<chatroom{}>'.format(self.id)
    
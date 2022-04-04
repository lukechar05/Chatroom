from email import message
import json
from operator import indexOf
import os
from flask import Flask, request, g, session, jsonify, redirect, url_for, abort, render_template, flash
from models import db, User, Chatroom, Chat

app = Flask(__name__)

# Load default config and override config from an environment variable
app.config.update(dict(
	DEBUG=True,
	SECRET_KEY='development key',
	SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(app.root_path, 'chat.db')
))
app.config.from_object(__name__)
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

db.init_app(app)

# ----------------------------------------------------------------------------------------------------------------------------------------------#
# App movement and base functionality


# Initializes database
@app.cli.command('initdb')
def initdb_command():
	"""Creates the database tables."""
	db.drop_all()
	db.create_all()
	print('Intialized Database')





def room_exists(room_id): 
	r = Chatroom.query.filter_by(id=room_id).first()

	if r: 
		return True
	else: 
		return False 



# Default, brings user to screen where they can choose to signup or login
@app.route('/')
def loginPage():
	return render_template('onboard.html')

# ----------------------------------------------------------------------------------------------------------------------------------------------#
# Authenticate


@app.route('/onboard<auth>', methods = ['GET'])
def onboardFunc(auth): 

	# new user
	if auth == "new":
		return render_template('signup.html')
	
	# returning user 
	else: 
		return render_template('login.html')

# ----------------------------------------------------------------------------------------------------------------------------------------------#

@app.route('/signup', methods = ["GET", "POST"])
def signup(): 
	
	username = request.form['Username']
	password = request.form['Password']

	user = User(username, password)

	db.session.add(user)
	db.session.commit()
	session['user_id'] = user.id
	chatrooms = Chatroom.query.all()

	# Send list of current chatrooms to the landing page for users
	return render_template('landing.html', chatrooms = chatrooms, user = session['user_id'])


@app.route('/login', methods = ["GET", "POST"])
def login():

	error = None
	username = request.form['Username']
	password = request.form['Password']
	chatrooms = Chatroom.query.all()

	user = User.query.filter_by(username=request.form['Username']).first()

	if user is None: 
		error = "Invalid Username" 
		render_template("login.html")  # keep them on the same screen

	elif password != user.password:
		error = "Invalid Password"
		render_template("login.html") # don't let them login without correct password
	
	else: 
		flash('A user was logged in')
		session['user_id'] = user.id
		chatrooms = Chatroom.query.all()
		return render_template('landing.html', chatrooms = chatrooms, user = session['user_id'])

# ----------------------------------------------------------------------------------------------------------------------------------------------#
# ChatRoom Creation and display

@app.route('/createChatroom<what>', methods = ['GET', 'POST'])
def createRoomFunction(what):

	if what == 'create':

		name = request.form['Roomname']
		chatroom = Chatroom(name, session['user_id'])  # get the user who created this room 
		db.session.add(chatroom)
		db.session.commit()
		chatrooms = Chatroom.query.all()
		return render_template('landing.html', chatrooms = chatrooms, user = session['user_id'])

	else:
		return render_template('onboard.html')

#  All routes from landing page, create room, delete room, join room, and logout 
@app.route('/landing<what><chatroom_id>', methods=['GET', 'POST'])
def landingFunctions(what, chatroom_id): 

	if what == 'create':
		return render_template('createChatroom.html')

	elif what == 'delete':
		chatroom = Chatroom.query.filter_by(id = chatroom_id).first()
		db.session.delete(chatroom)
		db.session.commit()
		chatrooms = Chatroom.query.all()
		return render_template('landing.html', chatrooms = chatrooms, user = session['user_id'])
		
	elif what == 'join':
		chatroom = Chatroom.query.filter_by(id = chatroom_id).first()
		session['currChatroom'] = chatroom.id
		return render_template("chatroom.html")
		
	else:
		return render_template('onboard.html')


# ----------------------------------------------------------------------------------------------------------------------------------------------#
# Chatroom create messages

#
@app.route("/new_chat", methods=["POST"])
def add():

	# create a chat add to database
	chat = Chat(request.form["chat"], session['currChatroom'])
	db.session.add(chat)
	db.session.commit()

	chats = []
	# query all chats
	allChats = Chat.query.all()
	
	# Add ones from this chatroom into chats list
	for individualChat in allChats: 
		if individualChat.room_id == session['currChatroom']:
			theMessage = individualChat.msg
			chats.append(theMessage)

	return json.dumps(chats)


# Polling for new chats 
@app.route("/chats")
def get_items():

	chats = []

	if room_exists(session['currChatroom']):
		
		allChats = Chat.query.all()
		for individualChat in allChats: 
			if individualChat.room_id == session['currChatroom']:
				theMessage = individualChat.msg
				chats.append(theMessage)
		return json.dumps(chats), 202

	else:
		return json.dumps(chats), 404


@app.route("/chatroom<what>")
def roomFunctions(what):
	if what == "logout":
		return render_template("onboard.html")

	# when room gets deleted
	elif what == "back":

		chatrooms = Chatroom.query.all()
		return render_template("landing.html", chatrooms = chatrooms, user = session['user_id'])

# ----------------------------------------------------------------------------------------------------------------------------------------------#

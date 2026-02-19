from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

mongo = PyMongo()
bcrypt = Bcrypt()
mail = Mail()
db = SQLAlchemy()
migrate = Migrate()

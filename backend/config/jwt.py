import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

from fast_jwt import FastJWT

jwt_auth = FastJWT(
    secret_key=os.getenv("JWT_SECRET_KEY"),
    algorithm=os.getenv("JWT_ALGORITHM"),
    access_token_expires=timedelta(minutes=30),
    refresh_token_expires=timedelta(days=1),
)

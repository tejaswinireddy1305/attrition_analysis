import os


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "attrition-dev-secret")
    TOKEN_EXP_MINUTES = int(os.getenv("TOKEN_EXP_MINUTES", "120"))

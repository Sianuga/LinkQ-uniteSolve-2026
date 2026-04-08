from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = "linkq-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    CHROMA_PERSIST_DIR: str = "./data/chroma"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    class Config:
        env_prefix = "LINKQ_"


settings = Settings()

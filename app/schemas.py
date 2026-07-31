from pydantic import BaseModel, ConfigDict
from datetime import datetime

class URLCreate(BaseModel):
    original_url: str

class URLInfo(BaseModel):
    id: int
    original_url: str
    short_id: str
    clicks: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
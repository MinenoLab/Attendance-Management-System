from pydantic import BaseModel

class AttendanceRequest(BaseModel):
    id    : str
    status: str
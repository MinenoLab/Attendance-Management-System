from fastapi import APIRouter

from app.services.card_service import read_card_uid

router = APIRouter()

@router.get("/read")
async def read_card():
    try:
        hashed_id = read_card_uid()
        return {
            "statusCode": 200,
            "nfc_id"    : hashed_id
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "message": str(e)
        }
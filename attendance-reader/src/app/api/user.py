from fastapi import APIRouter

from app.schemas.user     import UserRequest
from shared.config        import LOG_PATHS
from shared.error_handler import ErrorHandler
from shared.task_queue    import enqueue_task

router = APIRouter()
logger = ErrorHandler(log_file=str(LOG_PATHS["register_user"]))

@router.post("/")
async def register_user(request: UserRequest):
    try:
        enqueue_task(
            job_type = "register_user",
            params   = {
                "id"   : request.id,
                "name" : request.name,
                "grade": request.grade
            }
        )
        return {
            "statusCode": 200,
            "message"   : "Task enqueued"
        }

    except Exception as e:
        logger.log_error(f"User task enqueue failed: {e}")
        return {
            "statusCode": 500,
            "message"   : "Failed to enqueue user registration task"
        }
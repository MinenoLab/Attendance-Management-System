from fastapi import APIRouter

from app.schemas.attendance import AttendanceRequest
from shared.config          import LOG_PATHS
from shared.error_handler   import ErrorHandler
from shared.task_queue      import enqueue_task

router = APIRouter()
logger = ErrorHandler(log_file=str(LOG_PATHS["register_attendance"]))

@router.post("/")
async def register_attendance(request: AttendanceRequest):
    try:
        enqueue_task(
            job_type = "register_attendance",
            params   = {
                "id"    : request.id,
                "status": request.status,
            }
        )
        return {
            "statusCode": 200,
            "message"   : "Task enqueued"
        }

    except Exception as e:
        logger.log_error(f"Attendance task enqueue failed: {e}")
        return {
            "statusCode": 500,
            "message"   : "Failed to enqueue attendance task"
        }
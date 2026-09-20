import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from utils import get_current_seller
from config import settings

router = APIRouter(prefix="/api/upload", tags=["文件上传"])

# 允许的文件类型
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"]

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_seller: str = Depends(get_current_seller)
):
    """上传图片（卖家端，需要登录）"""
    # 检查文件类型
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不支持的图片格式，仅支持 JPG、PNG、GIF、WebP"
        )

    # 检查文件大小
    file_size = 0
    content = await file.read()
    file_size = len(content)

    if file_size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"文件大小超过限制，最大允许 {settings.MAX_FILE_SIZE // 1024 // 1024}MB"
        )

    # 生成唯一文件名
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_ext}"

    # 确保上传目录存在
    upload_dir = os.path.join(settings.UPLOAD_DIR, "images")
    os.makedirs(upload_dir, exist_ok=True)

    # 保存文件
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as f:
        f.write(content)

    # 返回文件URL
    file_url = f"/uploads/images/{filename}"
    return {"url": file_url, "filename": filename}

@router.post("/video")
async def upload_video(
    file: UploadFile = File(...),
    current_seller: str = Depends(get_current_seller)
):
    """上传视频（卖家端，需要登录）"""
    # 检查文件类型
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不支持的视频格式，仅支持 MP4、WebM、OGG"
        )

    # 检查文件大小（视频文件限制更大）
    video_max_size = settings.MAX_FILE_SIZE * 5  # 视频最大50MB
    file_size = 0
    content = await file.read()
    file_size = len(content)

    if file_size > video_max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"视频文件大小超过限制，最大允许 {video_max_size // 1024 // 1024}MB"
        )

    # 生成唯一文件名
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_ext}"

    # 确保上传目录存在
    upload_dir = os.path.join(settings.UPLOAD_DIR, "videos")
    os.makedirs(upload_dir, exist_ok=True)

    # 保存文件
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as f:
        f.write(content)

    # 返回文件URL
    file_url = f"/uploads/videos/{filename}"
    return {"url": file_url, "filename": filename}
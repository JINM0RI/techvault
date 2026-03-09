from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class NotebookCell(BaseModel):
    type: Literal["markdown", "code"]
    content: str
    language: str | None = None


class Topic(BaseModel):
    id: int
    title: str
    category: str
    technology: str
    file_path: str
    created_at: datetime | str


class TopicDetail(Topic):
    cells: list[NotebookCell]


class RunCodeRequest(BaseModel):
    code: str


class RunCodeResponse(BaseModel):
    output: str


class UploadResponse(BaseModel):
    id: int
    message: str


class CheatSheetItem(BaseModel):
    title: str
    slug: str


class CheatSheetDetail(CheatSheetItem):
    content: str

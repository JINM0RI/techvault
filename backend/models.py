from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class Topic(BaseModel):
    id: int
    title: str
    category: str
    technology: str
    language: str
    created_at: datetime | str


class Block(BaseModel):
    id: int
    topic_id: int
    block_type: Literal["explanation", "code"]
    content: str
    language: str | None = None
    position: int
    created_at: datetime | str


class TopicDetail(Topic):
    blocks: list[Block]


class CreateTopicRequest(BaseModel):
    title: str
    category: str
    technology: str
    language: str


class CreateTopicResponse(BaseModel):
    id: int
    message: str


class CreateBlockRequest(BaseModel):
    block_type: Literal["explanation", "code"]
    content: str = ""
    language: str | None = None


class UpdateBlockRequest(BaseModel):
    content: str
    language: str | None = None


class ReorderBlockRequest(BaseModel):
    direction: Literal["up", "down"]


class RunCodeRequest(BaseModel):
    code: str


class RunCodeResponse(BaseModel):
    output: str


class CheatSheetItem(BaseModel):
    title: str
    slug: str


class CheatSheetDetail(CheatSheetItem):
    content: str

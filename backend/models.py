from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class Category(BaseModel):
    id: int
    name: str
    created_at: datetime | str


class Note(BaseModel):
    id: int
    category_id: int
    name: str
    technology: str | None
    created_at: datetime | str


class Topic(BaseModel):
    id: int
    note_id: int
    title: str
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


class CreateCategoryRequest(BaseModel):
    name: str = Field(min_length=1)


class UpdateCategoryRequest(BaseModel):
    name: str = Field(min_length=1)


class CreateNoteRequest(BaseModel):
    name: str = Field(min_length=1)
    technology: str | None = None


class UpdateNoteRequest(BaseModel):
    name: str = Field(min_length=1)
    technology: str | None = None


class CreateTopicRequest(BaseModel):
    title: str
    language: str = "python"


class UpdateTopicRequest(BaseModel):
    title: str
    language: str


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

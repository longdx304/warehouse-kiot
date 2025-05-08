"""
Core module for the application.
Contains shared functionality and utilities used across the application.
"""

from core.exceptions import *
from core.error_handlers import add_error_handlers
from core.cache import Cache

from core.integrations.kiot_viet.client import KiotVietClient

kiotviet_client = KiotVietClient()

import ulid
from enum import Enum

class Prefix(str, Enum):
    USER = "usr_"
    WAREHOUSE = "wh_"
    WAREHOUSE_INVENTORY = "wi_"
    ITEM_UNIT = "iu_"
    LINE_ITEM = "item_"

def generate_id(prefix: Prefix) -> str:
    """
    Generate a unique ID with the given prefix using ULID.
    
    Args:
        prefix: The prefix to use (e.g., Prefix.USER for "usr_")
        
    Returns:
        A string with the format {prefix}{ulid}
    """
    # Generate ULID
    id_value = str(ulid.new())
    
    # Return prefixed ID
    return f"{prefix.value}{id_value}"
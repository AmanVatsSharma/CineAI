"""Shared pydantic base — camelCase on the wire so payloads match libs/domain-types."""

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class WireModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        # Fields such as `model_id` are ours, not pydantic's.
        protected_namespaces=(),
    )

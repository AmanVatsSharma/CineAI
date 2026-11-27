import pytest

from src.brands import store as brand_store
from src.campaigns import store as campaign_store


@pytest.fixture(autouse=True)
def fresh_state():
    brand_store.reset()
    campaign_store.reset()


@pytest.fixture
def vedpragya():
    brand = brand_store.get_brand("vedpragya")
    assert brand
    return brand


@pytest.fixture
def lumen():
    brand = brand_store.get_brand("lumen-skin")
    assert brand
    return brand

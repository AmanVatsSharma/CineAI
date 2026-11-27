import pytest
from fastapi.testclient import TestClient

from src.main import app

BRIEF = {
    "title": "Launch",
    "objective": "launch",
    "product": "the Foundations course",
    "keyMessage": "A guaranteed path with real results.",
    "cta": "Buy now",
    "totalDurationS": 30,
    "channels": ["instagram_reel"],
}


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_models_list_and_filter(client):
    all_models = client.get("/models/catalog").json()
    assert {m["modality"] for m in all_models} == {
        "video",
        "image",
        "voice",
        "music",
        "sfx",
        "copy",
    }
    assert all(m["creditCost"] > 0 for m in all_models)  # camelCase on the wire
    video = client.get("/models/catalog", params={"modality": "video"}).json()
    assert video and all(m["modality"] == "video" for m in video)
    spokes = client.get("/models/catalog", params={"use_case": "spokesperson"}).json()
    assert [m["id"] for m in spokes] == ["heygen-avatar-4"]


def test_route_endpoint(client):
    r = client.post("/models/route", json={"modality": "image", "require": ["vector"]})
    assert r.status_code == 200 and r.json()["model"]["id"] == "recraft-v3"
    bad = client.post("/models/route", json={"modality": "voice", "require": ["vector"]})
    assert bad.status_code == 422


def test_brand_crud(client):
    brands = client.get("/brands").json()
    assert {b["id"] for b in brands} >= {"vedpragya", "lumen-skin"}
    assert client.get("/brands/nope").status_code == 404

    fields = {k: v for k, v in client.get("/brands/vedpragya").json().items() if k != "id"}
    fields["name"] = "Vedpragya Labs"
    created = client.post("/brands", json=fields)
    assert created.status_code == 201 and created.json()["id"] == "vedpragya-labs"
    again = client.post("/brands", json=fields).json()
    assert again["id"] == "vedpragya-labs-2"  # no collisions

    fields["tagline"] = "Updated"
    assert client.put("/brands/vedpragya-labs", json=fields).json()["tagline"] == "Updated"
    assert client.put("/brands/nope", json=fields).status_code == 404


def test_brand_rejects_invalid_hex(client):
    fields = {k: v for k, v in client.get("/brands/vedpragya").json().items() if k != "id"}
    fields["visual"]["palette"]["primary"] = "indigo"
    assert client.post("/brands", json=fields).status_code == 422


def test_check_endpoint(client):
    r = client.post(
        "/brands/vedpragya/check",
        json={"text": "A guaranteed path to results.", "visualPrompt": "neon sign in #FF0000"},
    )
    body = r.json()
    assert r.status_code == 200
    assert body["textReport"]["passed"] is False
    assert "guaranteed" not in body["revisedText"].lower()
    assert body["revisedText"].endswith("Individual results vary.")
    assert {f["code"] for f in body["visualReport"]["findings"]} == {
        "avoid_visual",
        "off_palette_color",
    }
    assert client.post("/brands/vedpragya/check", json={}).status_code == 422
    assert client.post("/brands/nope/check", json={"text": "x"}).status_code == 404


def test_campaign_run_to_completion(client):
    r = client.post(
        "/campaigns", params={"wait": "true"}, json={"brandId": "vedpragya", "brief": BRIEF}
    )
    assert r.status_code == 200
    c = r.json()
    assert c["status"] == "ready" and c["progress"] == 100
    assert c["scenes"] and c["deliverables"] and c["ads"] and c["followUps"]
    assert c["ads"][0]["cta"] == "Begin today"

    assert client.get(f"/campaigns/{c['id']}").json()["id"] == c["id"]
    assert [x["id"] for x in client.get("/campaigns", params={"brand_id": "vedpragya"}).json()] == [
        c["id"]
    ]
    assert client.get("/campaigns", params={"brand_id": "lumen-skin"}).json() == []


def test_campaign_background_run_is_accepted_then_completes(client):
    r = client.post("/campaigns", json={"brandId": "vedpragya", "brief": BRIEF})
    assert r.status_code == 202
    cid = r.json()["id"]
    final = None
    for _ in range(200):
        final = client.get(f"/campaigns/{cid}").json()
        if final["status"] in ("ready", "needs_attention", "failed"):
            break
    assert final and final["status"] == "ready"


def test_campaign_validation(client):
    assert client.post("/campaigns", json={"brandId": "nope", "brief": BRIEF}).status_code == 404
    bad_channel = {**BRIEF, "channels": ["tiktok"]}
    r = client.post("/campaigns", json={"brandId": "vedpragya", "brief": bad_channel})
    assert r.status_code == 422 and "tiktok" in r.json()["detail"]
    too_short = {**BRIEF, "totalDurationS": 3}
    assert (
        client.post("/campaigns", json={"brandId": "vedpragya", "brief": too_short}).status_code
        == 422
    )
    assert client.get("/campaigns/missing").status_code == 404


def test_follow_up_status_update(client):
    c = client.post(
        "/campaigns", params={"wait": "true"}, json={"brandId": "vedpragya", "brief": BRIEF}
    ).json()
    fid = c["followUps"][0]["id"]
    r = client.patch(f"/campaigns/{c['id']}/follow-ups/{fid}", json={"status": "done"})
    assert r.status_code == 200
    assert next(f for f in r.json()["followUps"] if f["id"] == fid)["status"] == "done"
    assert (
        client.patch(f"/campaigns/{c['id']}/follow-ups/zzz", json={"status": "done"}).status_code
        == 404
    )
    assert (
        client.patch(f"/campaigns/{c['id']}/follow-ups/{fid}", json={"status": "bogus"}).status_code
        == 422
    )

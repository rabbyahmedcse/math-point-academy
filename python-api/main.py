"""
Optional FastAPI service for heavier reporting. It reads the SAME MongoDB database as Next.js.

Auth: the browser's Better Auth cookie is forwarded by Next.js (lib/python-api.ts). This service
asks Next.js `/api/auth/get-session` to validate it (so signature/expiry logic lives in ONE place),
then enforces the role itself. Never trust a role sent in a request body or header.

Run:  pip install -r requirements.txt && uvicorn main:app --port 8000
"""
import os
from datetime import datetime

import httpx
from bson import ObjectId
from fastapi import Depends, FastAPI, HTTPException, Request
from pymongo import MongoClient

NEXT_URL = os.getenv("BETTER_AUTH_URL", "http://localhost:3000")
db = MongoClient(os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017"))[os.getenv("MONGODB_DB", "coaching")]
app = FastAPI(title="Coaching reports")


async def current_user(request: Request) -> dict:
    cookie = request.headers.get("cookie")
    if not cookie:
        raise HTTPException(401, "Not signed in")
    async with httpx.AsyncClient(timeout=5) as client:
        r = await client.get(f"{NEXT_URL}/api/auth/get-session", headers={"cookie": cookie})
    data = r.json() if r.status_code == 200 else None
    if not data or not data.get("user"):
        raise HTTPException(401, "Invalid session")
    # Re-read from DB so deactivation / role change applies instantly.
    user = db.user.find_one({"_id": ObjectId(data["user"]["id"])})
    if not user or user.get("status") != "active":
        raise HTTPException(403, "Account not active")
    return user


def staff(user: dict = Depends(current_user)) -> dict:
    if user.get("role") not in ("admin", "teacher"):
        raise HTTPException(403, "Staff only")
    return user


@app.get("/reports/attendance")
def attendance_report(batch_id: str, month: str, user: dict = Depends(staff)):
    """Per-student attendance % for one batch and month (YYYY-MM)."""
    batch = db.batches.find_one({"_id": ObjectId(batch_id)})
    if not batch:
        raise HTTPException(404, "Batch not found")
    if user["role"] == "teacher" and user["_id"] not in batch.get("teacherIds", []):
        raise HTTPException(403, "Not your batch")
    totals: dict[ObjectId, list[int]] = {}
    for doc in db.attendances.find({"batchId": batch["_id"], "date": {"$regex": f"^{month}"}}):
        for rec in doc["records"]:
            t = totals.setdefault(rec["studentId"], [0, 0])
            t[1] += 1
            if rec["status"] != "absent":
                t[0] += 1
    names = {u["_id"]: u["name"] for u in db.user.find({"_id": {"$in": list(totals)}})}
    return [
        {"studentId": str(sid), "name": names.get(sid), "attended": a, "sessions": n, "percent": round(a / n * 100) if n else 0}
        for sid, (a, n) in totals.items()
    ]


@app.get("/reports/fees")
def fee_report(month: str | None = None, user: dict = Depends(staff)):
    """Collected vs due for a month (admin: all batches, teacher: own batches)."""
    month = month or datetime.now().strftime("%Y-%m")
    query: dict = {"month": month}
    if user["role"] == "teacher":
        mine = [b["_id"] for b in db.batches.find({"teacherIds": user["_id"]}, {"_id": 1})]
        query["batchId"] = {"$in": mine}
    fees = list(db.fees.find(query))
    due = sum(max(f["amountDue"] - f["paidTotal"], 0) for f in fees)
    return {"month": month, "records": len(fees), "expected": sum(f["amountDue"] for f in fees),
            "collected": sum(f["paidTotal"] for f in fees), "due": due}

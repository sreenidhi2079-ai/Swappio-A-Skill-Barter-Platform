"""
routes/skills.py
----------------
All REST API routes for the Skill Barter application.

Endpoints:
  POST   /skills              - Create a new skill listing
  GET    /skills              - Fetch all skill listings
  GET    /skills/offers       - Fetch only 'offering' listings
  GET    /skills/requests     - Fetch only 'requesting' listings
  GET    /skills/search       - Search by keyword across fields
  GET    /skills/matches      - Find barter match pairs
  DELETE /skills/{id}         - Delete a listing by ID
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Tuple

from database import skills_collection
from models.skill import SkillCreate, SkillResponse, MatchResult

router = APIRouter()


# ─────────────────────────────────────────────
# Helper: Convert MongoDB document → SkillResponse dict
# ─────────────────────────────────────────────
def skill_doc_to_response(doc: dict) -> dict:
    """Translate a raw MongoDB document into a serializable dict."""
    if doc is None:
        return {}
    return {
        "id": str(doc["_id"]),
        "user_name": doc.get("user_name", ""),
        "skill_offered": doc.get("skill_offered", ""),
        "skill_requested": doc.get("skill_requested", ""),
        "description": doc.get("description", ""),
        "location": doc.get("location", "Remote"),
        "contact": doc.get("contact", ""),
        "availability": doc.get("availability", "Flexible"),
    }


# ─────────────────────────────────────────────
# POST /skills — Create a new skill listing
# ─────────────────────────────────────────────
@router.post("/skills", response_model=SkillResponse, status_code=201, tags=["Skills"])
def create_skill(skill: SkillCreate):
    """
    Create a new skill listing.
    Accepts a JSON body with user details, the skill offered, and the skill requested.
    """
    try:
        skill_dict = skill.model_dump() if hasattr(skill, "model_dump") else skill.dict()
        result = skills_collection.insert_one(skill_dict)
        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to insert into database")
        
        created = skills_collection.find_one({"_id": result.inserted_id})
        if not created:
             raise HTTPException(status_code=500, detail="Created document not found after insert")
             
        return skill_doc_to_response(created)
    except Exception as e:
        print(f"ERROR in create_skill: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ─────────────────────────────────────────────
# GET /skills — All listings
# ─────────────────────────────────────────────
@router.get("/skills", response_model=List[SkillResponse], tags=["Skills"])
def get_all_skills():
    """Return every skill listing in the database."""
    docs = skills_collection.find()
    return [skill_doc_to_response(doc) for doc in docs]


# ─────────────────────────────────────────────
# GET /skills/offers — Listings where skill_offered is set
# ─────────────────────────────────────────────
@router.get("/skills/offers", response_model=List[SkillResponse], tags=["Skills"])
def get_skill_offers():
    """Return listings where the user is primarily advertising their offered skill."""
    docs = skills_collection.find({"skill_offered": {"$exists": True, "$ne": ""}})
    return [skill_doc_to_response(doc) for doc in docs]


# ─────────────────────────────────────────────
# GET /skills/requests — Listings where skill_requested is set
# ─────────────────────────────────────────────
@router.get("/skills/requests", response_model=List[SkillResponse], tags=["Skills"])
def get_skill_requests():
    """Return listings where the user is looking for a particular skill."""
    docs = skills_collection.find({"skill_requested": {"$exists": True, "$ne": ""}})
    return [skill_doc_to_response(doc) for doc in docs]


# ─────────────────────────────────────────────
# GET /skills/search?q=<term> — Keyword search
# ─────────────────────────────────────────────
@router.get("/skills/search", response_model=List[SkillResponse], tags=["Skills"])
def search_skills(q: str = Query(..., min_length=1, description="Search term")):
    """
    Search skill listings by keyword.
    Performs a case-insensitive regex search across user_name, skill_offered,
    skill_requested, description, and location fields.
    """
    import re
    pattern = re.compile(q, re.IGNORECASE)
    query = {
        "$or": [
            {"user_name": {"$regex": pattern}},
            {"skill_offered": {"$regex": pattern}},
            {"skill_requested": {"$regex": pattern}},
            {"description": {"$regex": pattern}},
            {"location": {"$regex": pattern}},
        ]
    }
    docs = skills_collection.find(query)
    return [skill_doc_to_response(doc) for doc in docs]


# ─────────────────────────────────────────────
# GET /skills/matches — Barter matching engine
# ─────────────────────────────────────────────
@router.get("/skills/matches", response_model=List[MatchResult], tags=["Matching"])
def get_skill_matches(user_name: str = Query(None, description="Optional user name to scope matches to the logged-in user")):
    """
    Find mutual barter matches.

    Matching rule:
      UserA.skill_offered == UserB.skill_requested
      AND
      UserA.skill_requested == UserB.skill_offered

    Returns a deduplicated list of match pairs (A-B and B-A are counted once).
    If user_name is provided, results only include matches for that specific user.
    """
    all_skills = list(skills_collection.find())

    matches = []
    seen_pairs = set()  # Avoid duplicate (A,B) and (B,A) entries

    for a in all_skills:
        for b in all_skills:
            # Skip self-comparison
            if str(a["_id"]) == str(b["_id"]):
                continue

            a_offered = a.get("skill_offered", "").strip().lower()
            a_requested = a.get("skill_requested", "").strip().lower()
            b_offered = b.get("skill_offered", "").strip().lower()
            b_requested = b.get("skill_requested", "").strip().lower()

            # Mutual match condition
            if a_offered == b_requested and a_requested == b_offered:
                # If a user filters by their own name, ensure they are part of the match
                uA_name = a.get("user_name", "Unknown")
                uB_name = b.get("user_name", "Unknown")
                if user_name and user_name not in [uA_name, uB_name]:
                    continue

                pair_key = tuple(sorted([str(a["_id"]), str(b["_id"])]))
                pair_id = "-".join(sorted([str(a["_id"]), str(b["_id"])]))
                if pair_id not in seen_pairs:
                    seen_pairs.add(pair_id)
                    matches.append({
                        "match_id": pair_id,
                        "userA_name": uA_name,
                        "userA_offer": a.get("skill_offered", ""),
                        "userA_wants": a.get("skill_requested", ""),
                        "userB_name": uB_name,
                        "userB_offer": b.get("skill_offered", ""),
                        "userB_wants": b.get("skill_requested", ""),
                    })

    return matches


# ─────────────────────────────────────────────
# DELETE /skills/{id} — Remove a listing
# ─────────────────────────────────────────────
@router.delete("/skills/{skill_id}", status_code=200, tags=["Skills"])
def delete_skill(skill_id: str):
    """
    Delete a skill listing by its ID.
    Supports both MongoDB ObjectId and UUID strings for universal compatibility.
    """
    # 1. Try deleting with the ID exactly as provided (works for LOCAL and some CLOUD data)
    result = skills_collection.delete_one({"_id": skill_id})
    
    # 2. If not found, try converting to MongoDB's ObjectId format
    if result.deleted_count == 0:
        try:
            from bson import ObjectId
            if ObjectId.is_valid(skill_id):
                result = skills_collection.delete_one({"_id": ObjectId(skill_id)})
        except:
            pass

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Skill listing not found")

    return {"message": "Skill listing deleted successfully", "id": skill_id}

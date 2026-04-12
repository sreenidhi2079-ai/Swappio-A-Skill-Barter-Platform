import json
import os
import uuid
from datetime import datetime

# ─────────────────────────────────────────────
# DATABASE ADAPTER: Local JSON vs. Cloud MongoDB
# ─────────────────────────────────────────────

MONGODB_URL = os.getenv("MONGODB_URL")

if MONGODB_URL:
    try:
        from pymongo import MongoClient
        print("🌐 Swaaaappio is running in CLOUD MODE (MongoDB Atlas)")
        client = MongoClient(MONGODB_URL)
        db = client.get_database("swaaaappio")
        
        # Mapping collections to real MongoDB
        skills_collection = db.skills
        exchanges_collection = db.exchanges
        messages_collection = db.messages
        users_collection = db.users
        DB_MODE = "CLOUD"
    except Exception as e:
        print(f"⚠️ Failed to connect to Cloud MongoDB: {e}")
        DB_MODE = "FALLBACK"
else:
    DB_MODE = "LOCAL"

if DB_MODE in ["LOCAL", "FALLBACK"]:
    class JsonStore:
        def __init__(self, collection_name):
            data_dir = os.path.join(os.getcwd(), "data")
            if not os.path.exists(data_dir):
                os.makedirs(data_dir)
            self.filename = os.path.join(data_dir, f"{collection_name}.json")
            if not os.path.exists(self.filename):
                with open(self.filename, 'w') as f:
                    json.dump([], f)

        def _read(self):
            try:
                with open(self.filename, 'r') as f:
                    return json.load(f)
            except:
                return []

        def _write(self, data):
            def serializer(obj):
                if isinstance(obj, datetime):
                    return obj.isoformat()
                return str(obj)
            with open(self.filename, 'w') as f:
                json.dump(data, f, indent=2, default=serializer)

        def insert_one(self, doc):
            data = self._read()
            if "_id" not in doc:
                doc["_id"] = str(uuid.uuid4())
            data.append(doc)
            self._write(data)
            return type('Result', (object,), {'inserted_id': doc["_id"]})

        def _matches(self, doc, query):
            if not query: return True
            if "$or" in query:
                for sub in query["$or"]:
                    if self._matches(doc, sub): return True
                return False
            for k, v in query.items():
                doc_val = doc.get(k, "")
                if isinstance(v, dict) and "$regex" in v:
                    import re
                    if not re.search(v["$regex"], str(doc_val), re.I): return False
                elif isinstance(v, dict) and "$in" in v:
                    if doc_val not in v["$in"]: return False
                elif doc_val != v: return False
            return True

        def find_one(self, query):
            data = self._read()
            for doc in data:
                if self._matches(doc, query): return doc
            return None

        def find(self, query=None):
            data = self._read()
            filtered = [doc for doc in data if self._matches(doc, query)] if query else data
            return JsonCursor(filtered)

        def update_one(self, query, update):
            data = self._read()
            for doc in data:
                if self._matches(doc, query):
                    if "$set" in update: doc.update(update["$set"])
                    self._write(data)
                    return True
            return False

        def delete_one(self, query):
            data = self._read()
            original_len = len(data)
            filtered = [doc for doc in data if not self._matches(doc, query)]
            self._write(filtered)
            deleted_count = original_len - len(filtered)
            return type('Result', (object,), {'deleted_count': deleted_count})

    class JsonCursor:
        def __init__(self, data): self.data = data
        def sort(self, field, direction=1):
            self.data.sort(key=lambda x: x.get(field, ""), reverse=(direction == -1))
            return self
        def __iter__(self): return iter(self.data)
        def list(self): return self.data

    skills_collection = JsonStore("skills")
    exchanges_collection = JsonStore("exchanges")
    messages_collection = JsonStore("messages")
    users_collection = JsonStore("users")
    print(f"🚀 Swaaaappio is running in PROFESSIONAL MODE ({'JSON Local' if DB_MODE == 'LOCAL' else 'JSON Fallback'})")

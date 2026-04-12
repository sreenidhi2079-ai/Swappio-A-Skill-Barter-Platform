from pymongo import MongoClient
import os

try:
    client = MongoClient('mongodb+srv://sarithas2079:Saritha@cluster0.nnb2k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    db = client.skill_barter
    users = list(db.users.find())
    for u in users:
        print(f"USER: {u.get('user_name')} | CREDITS: {u.get('credits')}")
    
    exchanges = list(db.exchanges.find())
    for e in exchanges:
        print(f"EXCHANGE: {e.get('match_id')} | userA: {e.get('userA_id')} | userB: {e.get('userB_id')} | status: {e.get('status')}")
except Exception as e:
    print(f"Error: {e}")

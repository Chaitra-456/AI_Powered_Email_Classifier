# app.py
from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import re
import imaplib
import email
from email.header import decode_header
import socket
from fastapi.middleware.cors import CORSMiddleware
from typing import List

# -----------------------------
# FASTAPI APP + CORS
# -----------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# LOAD MODEL + TFIDF
# -----------------------------
model = pickle.load(open("best_model.sav", "rb"))
tfidf = pickle.load(open("tfidf_vectorizer.sav", "rb"))

# -----------------------------
# CATEGORY STORAGE (NEW)
# -----------------------------
CATEGORY_DATA = {
    "Inbox": [],
    "Academic": [],
    "Administration": [],
    "Campus Service": [],
    "Career And Opportunity": [],
    "Financial Services": [],
    "Service Notification": [],
    "Scholarship": [],
    "Skill Development": [],
    "Miscellaneous": [],
    "Spam": []
}

# -----------------------------
# DATA MODELS
# -----------------------------
class EmailInput(BaseModel):
    subject: str
    preview: str
    domain: str

class EmailFetchInput(BaseModel):
    email_id: str
    app_password: str
    limit: int = 300

class MoveSpamInput(BaseModel):
    email_id: str  # the IMAP msg id string

# -----------------------------
# CLEAN FUNCTION
# -----------------------------
def clean(t):
    if not t:
        return ""
    t = t.replace("\n", " ").replace("\r", " ")
    t = re.sub(r"\s+", " ", t)
    return t.strip()

# -----------------------------
# PREDICT CATEGORY
# -----------------------------
@app.post("/predict")
def predict_email(data: EmailInput):
    combined = clean(data.subject) + " " + clean(data.preview) + " " + clean(data.domain)
    vector = tfidf.transform([combined])
    pred = model.predict(vector)[0]
    return {"category": pred}

# -----------------------------
# FETCH GMAIL EMAILS (POST)
# -----------------------------
@app.post("/emails")
def get_emails(info: EmailFetchInput):
    EMAIL = info.email_id
    PASSWORD = info.app_password
    LIMIT = info.limit or 300

    try:
        # Force IPv4 (Google DNS fix)
        orig = socket.getaddrinfo
        def ipv4_only(*args, **kwargs):
            return [i for i in orig(*args, **kwargs) if i[0] == socket.AF_INET]
        socket.getaddrinfo = ipv4_only

        # Connect to Gmail IMAP
        M = imaplib.IMAP4_SSL("imap.gmail.com")
        M.login(EMAIL, PASSWORD)

        # Gmail folders
        FOLDERS = [
            "INBOX",
            '"INBOX"',
            '"Inbox"',
            '"[Gmail]/Inbox"',
            '"[Gmail]/Primary"',
        ]

        msg_ids = []

        # Try primary folders
        for f in FOLDERS:
            try:
                status, _ = M.select(f)
                if status == "OK":
                    status, nums = M.search(None, "ALL")
                    ids = nums[0].split()
                    if len(ids) > 0:
                        msg_ids = ids
                        break
            except:
                continue

        # Try ALL folders if no emails found
        if len(msg_ids) == 0:
            status, folders = M.list()
            for f in folders:
                try:
                    name = f.decode().split(' "/" ')[-1].strip('"')
                except:
                    try:
                        name = f.decode().split()[-1].strip('"')
                    except:
                        name = None
                if not name:
                    continue
                try:
                    M.select(f'"{name}"')
                    status, nums = M.search(None, "ALL")
                    ids = nums[0].split()
                    if len(ids) > 0:
                        msg_ids = ids
                        break
                except:
                    continue

        # NO EMAILS FOUND
        if len(msg_ids) == 0:
            return {"emails": []}

        # Only latest LIMIT emails
        msg_ids = msg_ids[-LIMIT:]
        emails = []

        for msg_id in msg_ids:
            try:
                _, data = M.fetch(msg_id, "(RFC822)")
                raw_bytes = data[0][1]
                msg = email.message_from_bytes(raw_bytes)
            except:
                continue

            # SUBJECT
            raw = msg.get("Subject")
            subject = "(No Subject)"
            if raw:
                decoded = decode_header(raw)[0]
                try:
                    subject = decoded[0].decode(decoded[1] or "utf-8", errors="ignore") if isinstance(decoded[0], bytes) else decoded[0]
                except:
                    subject = "(Unreadable Subject)"

            # FROM
            from_email = msg.get("From", "Unknown")

            # preview (plain text) and html
            preview = ""
            html = ""
            try:
                if msg.is_multipart():
                    for part in msg.walk():
                        ctype = part.get_content_type()
                        disp = str(part.get("Content-Disposition"))
                        if ctype == "text/plain" and "attachment" not in disp:
                            payload = part.get_payload(decode=True)
                            if payload:
                                preview = payload.decode("utf-8", errors="ignore")
                        elif ctype == "text/html" and "attachment" not in disp:
                            payload = part.get_payload(decode=True)
                            if payload:
                                html = payload.decode("utf-8", errors="ignore")
                else:
                    ctype = msg.get_content_type()
                    payload = msg.get_payload(decode=True)
                    if payload:
                        if ctype == "text/plain":
                            preview = payload.decode("utf-8", errors="ignore")
                        elif ctype == "text/html":
                            html = payload.decode("utf-8", errors="ignore")
            except:
                preview = ""
                html = ""

            preview = clean(preview)[:400]  # keep a bit bigger preview to show in UI
            domain = from_email.split("@")[-1] if "@" in from_email else ""

            emails.append({
                "id": msg_id.decode() if isinstance(msg_id, bytes) else str(msg_id),
                "subject": clean(subject),
                "from": from_email,
                "preview": preview,
                "domain": domain,
                "html": html
            })

        M.logout()

        # ---------------------------------------------------
        # STORE CATEGORIES (NEW)
        # ---------------------------------------------------
        for cat in CATEGORY_DATA:
            CATEGORY_DATA[cat] = []

        CATEGORY_DATA["Inbox"] = emails

        for mail in emails:
            combined = clean(mail["subject"] + " " + mail["preview"] + " " + mail["domain"])
            vector = tfidf.transform([combined])
            cat = model.predict(vector)[0]

            if cat not in CATEGORY_DATA:
                cat = "Miscellaneous"

            CATEGORY_DATA[cat].append(mail)

        return {"emails": emails}

    except Exception as e:
        return {"error": str(e)}

# -----------------------------
# FRONTEND CATEGORY ROUTE (NEW)
# -----------------------------
@app.get("/get_category/{cat}")
def get_category(cat: str):
    if cat not in CATEGORY_DATA:
        return []
    return CATEGORY_DATA[cat]

# -----------------------------
# MOVE TO SPAM (POST)
# -----------------------------
@app.post("/move_to_spam")
def move_to_spam(info: MoveSpamInput):
    # Find the mail by id in any category (except Spam) and move it to Spam
    target = None
    src_cat = None
    for cat, arr in CATEGORY_DATA.items():
        if cat == "Spam":
            continue
        for m in arr:
            if m.get("id") == info.email_id:
                target = m
                src_cat = cat
                break
        if target:
            break

    if not target:
        return {"error": "email not found"}

    # Remove from source
    if src_cat:
        CATEGORY_DATA[src_cat] = [m for m in CATEGORY_DATA[src_cat] if m.get("id") != info.email_id]

    # Add to Spam
    CATEGORY_DATA["Spam"].insert(0, target)
    return {"status": "moved", "to": "Spam"}

# -----------------------------
# ROOT
# -----------------------------
@app.get("/")
def home():
    return {"message": "API Running"}
#!/usr/bin/env python3
"""
Winter Arc Challenge — Supabase Direct User & PFP Management Tool
Use this script to directly create, update, and manage challenger profiles with PFPs in Supabase.
"""

import os
import sys
import json
import uuid
import datetime
import mimetypes
import argparse

try:
    import requests
except ImportError:
    print("Error: 'requests' package is required. Run: pip install requests")
    sys.exit(1)


def load_env_file(filepath=".env.local"):
    """Parse local env file for Supabase credentials."""
    env = {}
    if not os.path.exists(filepath):
        if os.path.exists(".env"):
            filepath = ".env"
        else:
            return env

    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            env[key.strip()] = val.strip().strip('"').strip("'")
    return env


class SupabaseManager:
    def __init__(self, supabase_url: str, anon_key: str, service_role_key: str = None):
        self.url = supabase_url.rstrip("/")
        self.anon_key = anon_key
        # Prefer service role key if provided for administrative user creation
        self.auth_key = service_role_key or anon_key
        self.has_admin = bool(service_role_key)

    def get_headers(self, use_admin=True):
        key = self.auth_key if use_admin else self.anon_key
        return {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

    def list_profiles(self):
        """Fetch all registered warrior profiles from public.profiles."""
        endpoint = f"{self.url}/rest/v1/profiles?select=*&order=created_at.desc"
        res = requests.get(endpoint, headers=self.get_headers())
        if res.status_code in (200, 201):
            return res.json()
        print(f"Failed to list profiles: HTTP {res.status_code} - {res.text}")
        return []

    def upload_pfp_file(self, local_image_path: str, user_id: str) -> str:
        """Upload a local image file to Supabase Storage (bucket: avatars) and return its public URL."""
        if not os.path.exists(local_image_path):
            print(f"File not found: {local_image_path}")
            return ""

        filename = os.path.basename(local_image_path)
        ext = os.path.splitext(filename)[1].lower() or ".jpg"
        target_name = f"{user_id}_{int(datetime.datetime.now().timestamp())}{ext}"
        mime_type, _ = mimetypes.guess_type(local_image_path)
        if not mime_type:
            mime_type = "image/jpeg"

        upload_url = f"{self.url}/storage/v1/object/avatars/{target_name}"
        headers = {
            "apikey": self.auth_key,
            "Authorization": f"Bearer {self.auth_key}",
            "Content-Type": mime_type,
            "x-upsert": "true",
        }

        with open(local_image_path, "rb") as f:
            data = f.read()

        res = requests.post(upload_url, headers=headers, data=data)
        if res.status_code in (200, 201):
            public_url = f"{self.url}/storage/v1/object/public/avatars/{target_name}"
            print(f"✓ PFP uploaded successfully: {public_url}")
            return public_url
        else:
            print(f"Notice: Storage bucket upload returned HTTP {res.status_code}. Using image fallback.")
            return ""

    def create_or_update_profile(self, user_id: str, display_name: str, avatar_url: str = None,
                                  timezone: str = "Asia/Kolkata", body_weight_kg: float = 70.0):
        """Upsert user profile into public.profiles."""
        endpoint = f"{self.url}/rest/v1/profiles"
        payload = {
            "id": user_id,
            "display_name": display_name,
            "avatar_url": avatar_url,
            "timezone": timezone,
            "body_weight_kg": body_weight_kg,
            "challenge_started_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }

        headers = self.get_headers(use_admin=True)
        headers["Prefer"] = "resolution=merge-duplicates,return=representation"

        res = requests.post(endpoint, headers=headers, json=payload)
        if res.status_code in (200, 201):
            print(f"✓ Profile for '{display_name}' saved into Supabase!")
            return res.json()
        else:
            print(f"Error saving profile: HTTP {res.status_code} - {res.text}")
            return None

    def create_auth_user(self, email: str, password: str, display_name: str):
        """Create real Auth User via Supabase Admin API."""
        if not self.has_admin:
            # If no service role key, sign up via public auth
            signup_url = f"{self.url}/auth/v1/signup"
            res = requests.post(
                signup_url,
                headers=self.get_headers(use_admin=False),
                json={"email": email, "password": password, "data": {"display_name": display_name}},
            )
            if res.status_code in (200, 201):
                data = res.json()
                uid = data.get("id") or (data.get("user") and data["user"].get("id"))
                return uid
            else:
                print(f"Auth signup failed: {res.text}")
                return None

        # Admin create user (auto-confirms email)
        admin_url = f"{self.url}/auth/v1/admin/users"
        payload = {
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {"display_name": display_name},
        }
        res = requests.post(admin_url, headers=self.get_headers(use_admin=True), json=payload)
        if res.status_code in (200, 201):
            return res.json().get("id")
        else:
            print(f"Admin create user error: HTTP {res.status_code} - {res.text}")
            # If user already exists, generate a consistent UUID
            return None


def get_default_avatar_url(name: str):
    """Generate a cool gradient dicebear avatar URL if no local image provided."""
    safe_name = name.strip().replace(" ", "+")
    return f"https://api.dicebear.com/7.x/bottts-neutral/svg?seed={safe_name}"


def interactive_mode(mgr: SupabaseManager):
    print("\n" + "=" * 60)
    print("  🔥 WINTER ARC — DIRECT SUPABASE USER & PFP MANAGER 🔥")
    print("=" * 60)

    while True:
        print("\nChoose an action:")
        print("1. Add New Challenger Profile (with PFP, Name & Email)")
        print("2. Update Existing User PFP / Name")
        print("3. List All Warriors currently in Supabase")
        print("4. Exit")
        choice = input("\nEnter choice [1-4]: ").strip()

        if choice == "1":
            print("\n--- Add New Challenger ---")
            name = input("Warrior Display Name / Handle (e.g. Marcus): ").strip()
            if not name:
                print("Name cannot be empty!")
                continue

            email = input(f"Email address (e.g. {name.lower().replace(' ', '')}@winterarc.io): ").strip()
            if not email:
                email = f"{name.lower().replace(' ', '')}_{int(datetime.datetime.now().timestamp())}@winterarc.io"

            password = input("Password [default: WinterArc2026!]: ").strip() or "WinterArc2026!"
            pfp_input = input("PFP (Enter local image path e.g. ./pfp.png OR an Image URL OR leave blank for cool avatar): ").strip()

            tz = input("Timezone [default: Asia/Kolkata]: ").strip() or "Asia/Kolkata"
            weight_str = input("Body weight in kg [default: 70.0]: ").strip() or "70.0"
            try:
                weight = float(weight_str)
            except ValueError:
                weight = 70.0

            print("\nRegistering in Supabase Auth...")
            user_id = mgr.create_auth_user(email, password, name)
            if not user_id:
                user_id = str(uuid.uuid4())
                print(f"Notice: Assigned profile UUID: {user_id}")

            avatar_url = ""
            if pfp_input:
                if os.path.exists(pfp_input):
                    avatar_url = mgr.upload_pfp_file(pfp_input, user_id)
                elif pfp_input.startswith("http"):
                    avatar_url = pfp_input

            if not avatar_url:
                avatar_url = get_default_avatar_url(name)

            mgr.create_or_update_profile(user_id, name, avatar_url, tz, weight)
            print("\nSUCCESS: Challenger profile is live in Supabase!")
            print(f"Name: {name} | Email: {email} | PFP: {avatar_url}")

        elif choice == "2":
            print("\n--- Update User PFP / Name ---")
            profiles = mgr.list_profiles()
            if not profiles:
                print("No profiles found in Supabase.")
                continue

            print("\nAvailable Users:")
            for idx, p in enumerate(profiles):
                print(f"[{idx + 1}] {p.get('display_name')} (ID: {p.get('id')})")

            sel = input("\nSelect user number to update: ").strip()
            try:
                sel_idx = int(sel) - 1
                target = profiles[sel_idx]
            except (ValueError, IndexError):
                print("Invalid selection.")
                continue

            new_name = input(f"New Name [{target.get('display_name')}]: ").strip() or target.get("display_name")
            pfp_input = input("New PFP (image path or URL) [leave blank to keep current]: ").strip()

            new_avatar = target.get("avatar_url")
            if pfp_input:
                if os.path.exists(pfp_input):
                    uploaded = mgr.upload_pfp_file(pfp_input, target["id"])
                    if uploaded:
                        new_avatar = uploaded
                elif pfp_input.startswith("http"):
                    new_avatar = pfp_input

            mgr.create_or_update_profile(target["id"], new_name, new_avatar, target.get("timezone", "Asia/Kolkata"))
            print(f"\nUser '{new_name}' updated successfully!")

        elif choice == "3":
            print("\n--- Current Supabase Challengers ---")
            profiles = mgr.list_profiles()
            if not profiles:
                print("No warriors in database yet. Add one using option 1!")
            else:
                print(f"Total Warriors: {len(profiles)}")
                for p in profiles:
                    print(f"• Name: {p.get('display_name', 'Unnamed')} | ID: {p.get('id')}")
                    print(f"  PFP: {p.get('avatar_url') or 'No avatar'}")
                    print(f"  Timezone: {p.get('timezone')} | Started: {p.get('challenge_started_at')}")
                    print("-" * 40)

        elif choice == "4":
            print("Exiting tool. Stay hard, warrior!")
            break


def main():
    parser = argparse.ArgumentParser(description="Directly sync users and PFPs into Supabase")
    parser.add_argument("--name", help="Challenger display name")
    parser.add_argument("--email", help="User email")
    parser.add_argument("--password", help="User password", default="WinterArc2026!")
    parser.add_argument("--pfp", help="Local image file path or image URL")
    parser.add_argument("--timezone", default="Asia/Kolkata", help="User timezone")
    parser.add_argument("--weight", type=float, default=70.0, help="Body weight kg")
    parser.add_argument("--list", action="store_true", help="List all users")
    args = parser.parse_args()

    # Load credentials from .env.local or environment
    env = load_env_file()
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or env.get("NEXT_PUBLIC_SUPABASE_URL")
    anon_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or env.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not anon_key:
        print("\nSupabase credentials not found in environment or .env.local.")
        supabase_url = input("Enter your Supabase URL (https://xxxx.supabase.co): ").strip()
        anon_key = input("Enter your Supabase Anon Key: ").strip()
        service_key = input("Enter Supabase Service Role Key (optional, press Enter to skip): ").strip() or None

    mgr = SupabaseManager(supabase_url, anon_key, service_key)

    if args.list:
        profiles = mgr.list_profiles()
        print(json.dumps(profiles, indent=2))
        return

    if args.name:
        name = args.name
        email = args.email or f"{name.lower().replace(' ', '')}@winterarc.io"
        user_id = mgr.create_auth_user(email, args.password, name) or str(uuid.uuid4())

        avatar_url = ""
        if args.pfp:
            if os.path.exists(args.pfp):
                avatar_url = mgr.upload_pfp_file(args.pfp, user_id)
            elif args.pfp.startswith("http"):
                avatar_url = args.pfp

        if not avatar_url:
            avatar_url = get_default_avatar_url(name)

        mgr.create_or_update_profile(user_id, name, avatar_url, args.timezone, args.weight)
        return

    # If no CLI arguments given, launch interactive menu
    interactive_mode(mgr)


if __name__ == "__main__":
    main()

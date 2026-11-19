"""
Admin CLI — create accounts and reset passwords without the API.

    python -m app.cli create-admin --username owner --display-name "Shop Owner"
    python -m app.cli reset-password --username owner
    python -m app.cli list-admins
    python -m app.cli deactivate --username old-admin
"""

from __future__ import annotations

import argparse
import getpass
import sys

from . import repository
from .db import connection, init_schema
from .schemas import password_policy_error
from .security import hash_password


def _prompt_password(username: str) -> str:
    while True:
        first = getpass.getpass("Password: ")
        problem = password_policy_error(first, username=username)
        if problem:
            print(f"  ✖ {problem}")
            continue

        if first != getpass.getpass("Repeat password: "):
            print("  ✖ Passwords do not match.")
            continue

        return first


def create_admin(args: argparse.Namespace) -> int:
    username = repository.normalise_username(args.username)

    with connection() as conn:
        if repository.get_by_username(conn, username):
            print(f"✖ '{username}' already exists. Use reset-password instead.")
            return 1

        password = args.password or _prompt_password(username)
        problem = password_policy_error(password, username=username)
        if problem:
            print(f"✖ {problem}")
            return 1

        repository.create_user(
            conn,
            username=username,
            password_hash=hash_password(password),
            display_name=args.display_name or username,
            role=args.role,
        )

    print(f"✔ Created admin '{username}' ({args.role})")
    return 0


def reset_password(args: argparse.Namespace) -> int:
    username = repository.normalise_username(args.username)

    with connection() as conn:
        user = repository.get_by_username(conn, username)
        if user is None:
            print(f"✖ No admin called '{username}'.")
            return 1

        password = args.password or _prompt_password(username)
        problem = password_policy_error(password, username=username)
        if problem:
            print(f"✖ {problem}")
            return 1

        repository.set_password_hash(conn, user["id"], hash_password(password))

    print(f"✔ Password updated for '{username}'")
    return 0


def list_admins(_: argparse.Namespace) -> int:
    with connection() as conn:
        users = repository.list_users(conn)

    if not users:
        print("No admin accounts yet — run: python -m app.cli create-admin --username owner")
        return 0

    print(f"{'USERNAME':<20}{'ROLE':<10}{'ACTIVE':<8}LAST LOGIN")
    for user in users:
        print(
            f"{user['username']:<20}{user['role']:<10}"
            f"{'yes' if user['is_active'] else 'no':<8}"
            f"{user['last_login_at'] or '—'}"
        )
    return 0


def deactivate(args: argparse.Namespace) -> int:
    username = repository.normalise_username(args.username)

    with connection() as conn:
        user = repository.get_by_username(conn, username)
        if user is None:
            print(f"✖ No admin called '{username}'.")
            return 1

        remaining = [
            entry
            for entry in repository.list_users(conn)
            if entry["is_active"] and entry["id"] != user["id"]
        ]
        if not remaining:
            print("✖ This is the only active admin — create another one first.")
            return 1

        repository.set_active(conn, user["id"], False)

    print(f"✔ '{username}' can no longer sign in")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="admin-cli", description="ZEESHAN admin accounts")
    sub = parser.add_subparsers(dest="command", required=True)

    create = sub.add_parser("create-admin", help="Create an admin account")
    create.add_argument("--username", required=True)
    create.add_argument("--display-name", default="")
    create.add_argument("--role", default="admin", choices=["owner", "admin"])
    create.add_argument("--password", help="Skip the prompt (useful for automation)")
    create.set_defaults(func=create_admin)

    reset = sub.add_parser("reset-password", help="Set a new password")
    reset.add_argument("--username", required=True)
    reset.add_argument("--password")
    reset.set_defaults(func=reset_password)

    listing = sub.add_parser("list-admins", help="Show every admin account")
    listing.set_defaults(func=list_admins)

    off = sub.add_parser("deactivate", help="Block an account without deleting it")
    off.add_argument("--username", required=True)
    off.set_defaults(func=deactivate)

    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    init_schema()
    return int(args.func(args))


if __name__ == "__main__":
    sys.exit(main())

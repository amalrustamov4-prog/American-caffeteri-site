import os
import zipfile
import shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
DESKTOP = os.path.dirname(ROOT)

ZIP_FINAL = os.path.join(DESKTOP, "american11_clean_final.zip")
ZIP_ALIAS = os.path.join(DESKTOP, "american11.zip")

EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    "__pycache__",
    ".gradle",
    "build",
    ".vercel",
    "backups",
    "Pods",
    "DerivedData",
}

EXCLUDE_EXTS = {
    ".pyc",
    ".DS_Store",
    ".jks",
    ".keystore",
    ".db",
    ".db-wal",
    ".db-shm",
    ".sqlite",
    ".sqlite3",
    ".xcarchive",
    ".ipa",
    ".app",
}

EXCLUDE_FILES = {
    "Thumbs.db",
    "keystore.properties",
}

def should_exclude(rel_path: str) -> bool:
    parts = rel_path.replace("\\", "/").split("/")
    for p in parts:
        if p in EXCLUDE_DIRS:
            return True
    fname = os.path.basename(rel_path)
    if fname in EXCLUDE_FILES:
        return True
    # Exclude secret .env files while keeping .env.example
    if fname.startswith(".env") and not fname.endswith(".example"):
        return True
    _, ext = os.path.splitext(fname)
    if ext in EXCLUDE_EXTS:
        return True
    return False

def build_zip(zip_path: str):
    print(f"Packing Clean Export ZIP: {zip_path}")
    count = 0
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for r, dirs, files in os.walk(ROOT):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for f in files:
                full_path = os.path.join(r, f)
                rel_path = os.path.relpath(full_path, ROOT)
                if should_exclude(rel_path):
                    continue
                zf.write(full_path, arcname=rel_path)
                count += 1
    sz_mb = os.path.getsize(zip_path) / (1024 * 1024)
    print(f"-> SUCCESS: {count} files packed, size: {sz_mb:.2f} MB")

if __name__ == "__main__":
    build_zip(ZIP_FINAL)
    shutil.copyfile(ZIP_FINAL, ZIP_ALIAS)
    print(f"-> Synced alias: {ZIP_ALIAS}")

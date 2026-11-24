import shutil
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parent
WWW = ROOT / "www"
ANDROID_ASSETS = ROOT / "android" / "app" / "src" / "main" / "assets" / "public"
IOS_ASSETS = ROOT / "ios" / "App" / "App" / "public"

FILES_TO_SYNC = [
    "index.html",
    "app.js",
    "style.css",
    "menu_data.js",
    "sw.js",
    "manifest.json",
    "admin.html",
    "admin.js",
    "admin.css",
    "courier.html",
]

def sync_targets():
    WWW.mkdir(exist_ok=True)
    
    # 1. Sync code files to www/
    for fname in FILES_TO_SYNC:
        src = ROOT / fname
        dst = WWW / fname
        if src.exists():
            shutil.copy2(src, dst)
            print(f"[SYNC] {src.name} -> www/{dst.name}")
            
    # 2. Sync images to www/images/
    src_images = ROOT / "images"
    dst_images = WWW / "images"
    if src_images.exists():
        shutil.copytree(src_images, dst_images, dirs_exist_ok=True)
        print(f"[SYNC] images/ -> www/images/ ({len(list(src_images.glob('**/*.*')))} files)")

    # 3. Sync to Android capacitor assets if exists
    if ANDROID_ASSETS.exists():
        for fname in FILES_TO_SYNC:
            src = ROOT / fname
            dst = ANDROID_ASSETS / fname
            if src.exists():
                shutil.copy2(src, dst)
        dst_android_imgs = ANDROID_ASSETS / "images"
        if src_images.exists():
            shutil.copytree(src_images, dst_android_imgs, dirs_exist_ok=True)
        print(f"[SYNC] Synchronized all assets to Android Capacitor ({ANDROID_ASSETS})")

    # 4. Sync to iOS capacitor assets if exists
    if IOS_ASSETS.exists():
        for fname in FILES_TO_SYNC:
            src = ROOT / fname
            dst = IOS_ASSETS / fname
            if src.exists():
                shutil.copy2(src, dst)
        dst_ios_imgs = IOS_ASSETS / "images"
        if src_images.exists():
            shutil.copytree(src_images, dst_ios_imgs, dirs_exist_ok=True)
        print(f"[SYNC] Synchronized all assets to iOS Capacitor ({IOS_ASSETS})")

if __name__ == "__main__":
    sync_targets()

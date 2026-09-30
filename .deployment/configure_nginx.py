#!/usr/bin/env python3
# ============================================================================
# LLOYDS METALS & ENERGY - NGINX AUTOMATED ROUTE INJECTOR
# Injects /onboarding directly into the active HTTPS (443) server block
# ============================================================================

import os
import sys
import glob
import subprocess

ONBOARDING_BLOCK = """
    # =========================================================================
    # LLOYDS WORKER ONBOARDING SYSTEM (taskai.lloyds.in/onboarding/)
    # =========================================================================
    location = /onboarding {
        return 301 /onboarding/;
    }

    location /onboarding/api/ {
        proxy_pass         http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection keep-alive;
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /onboarding/assets/ {
        alias /var/www/worker-onboarding/dist/assets/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
    }

    location /onboarding/ {
        alias /var/www/worker-onboarding/dist/;
        try_files $uri $uri/ /onboarding/index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        expires off;
    }
"""

def find_target_file():
    candidates = (
        glob.glob('/etc/nginx/sites-enabled/*') +
        glob.glob('/etc/nginx/sites-available/*') +
        glob.glob('/etc/nginx/conf.d/*.conf')
    )
    # Check for file containing 'hemm'
    for c in candidates:
        if os.path.isfile(c) and not c.endswith('.bak') and not 'onboarding' in os.path.basename(c):
            try:
                with open(c, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if '/hemm' in content or 'bhq-hemm' in content:
                        return c
            except Exception:
                pass

    # Check for file containing 'taskai.lloyds.in'
    for c in candidates:
        if os.path.isfile(c) and not c.endswith('.bak') and not 'onboarding' in os.path.basename(c):
            try:
                with open(c, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if 'taskai.lloyds.in' in content:
                        return c
            except Exception:
                pass
    return None

def main():
    target = find_target_file()
    if not target:
        print("❌ Could not locate active Nginx configuration for taskai.lloyds.in or hemm.")
        print("Please check /etc/nginx/sites-enabled/ to see where taskai.lloyds.in is configured.")
        sys.exit(1)

    # If it is a symlink in sites-enabled, resolve real file in sites-available
    real_target = os.path.realpath(target)
    print(f"🎯 Found active Nginx site configuration: {real_target}")

    with open(real_target, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Backup
    backup_path = real_target + '.bak_before_onboarding'
    if not os.path.exists(backup_path):
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print(f"💾 Created backup at: {backup_path}")

    # Remove any existing /onboarding snippets or inclusions to avoid conflicts
    cleaned_lines = []
    skip = False
    for line in lines:
        if 'LLOYDS WORKER ONBOARDING SYSTEM' in line or 'worker-onboarding.conf' in line:
            skip = True
            continue
        if skip:
            if line.strip().startswith('location') or (line.strip() == '}' and not 'add_header' in line):
                skip = False
            else:
                continue
        cleaned_lines.append(line)

    # Locate the /hemm/ or 443 block to insert /onboarding inside HTTPS server
    insert_pos = -1
    for i, line in enumerate(cleaned_lines):
        if 'location' in line and '/hemm' in line:
            insert_pos = i
            break

    if insert_pos != -1:
        # Find the closing brace of the hemm block
        brace_count = 0
        found_start = False
        for idx in range(insert_pos, len(cleaned_lines)):
            brace_count += cleaned_lines[idx].count('{')
            brace_count -= cleaned_lines[idx].count('}')
            if '{' in cleaned_lines[idx]:
                found_start = True
            if found_start and brace_count <= 0:
                insert_pos = idx + 1
                break
        cleaned_lines.insert(insert_pos, "\n" + ONBOARDING_BLOCK + "\n")
        print(f"✅ Injected /onboarding right after the /hemm block inside the active HTTPS server.")
    else:
        # If no /hemm found, find closing brace of the 443 server block
        ssl_block_found = False
        for i, line in enumerate(cleaned_lines):
            if '443' in line or 'ssl_certificate' in line:
                ssl_block_found = True
            if ssl_block_found and line.strip() == '}':
                cleaned_lines.insert(i, "\n" + ONBOARDING_BLOCK + "\n")
                print(f"✅ Injected /onboarding before closing brace of SSL server block (line {i+1}).")
                break

    with open(real_target, 'w', encoding='utf-8') as f:
        f.writelines(cleaned_lines)

    # Validate syntax with nginx -t
    print("🔍 Testing Nginx configuration syntax (nginx -t)...")
    res = subprocess.run(['nginx', '-t'], capture_output=True, text=True)
    if res.returncode != 0:
        print("❌ Nginx test failed! Reverting back to original configuration...")
        with open(real_target, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print(res.stderr)
        sys.exit(1)

    print(res.stderr.strip() or res.stdout.strip())
    # Reload nginx
    print("🔄 Reloading Nginx...")
    subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
    print("🎉 SUCCESS! Nginx reloaded cleanly. Route /onboarding is now live on HTTPS!")

if __name__ == '__main__':
    main()

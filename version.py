import json

# Read root package.json
with open(r'D:\AgnesRepo\mail-mind-assistant\package.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

old_version = data.get('version', '')
data['version'] = '0.3.0'

with open(r'D:\AgnesRepo\mail-mind-assistant\package.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
    f.write('\n')

print(f"Root package.json: {old_version} -> {data['version']}")

# Check apps/web/package.json
web_path = r'D:\AgnesRepo\mail-mind-assistant\apps\web\package.json'
import os
if os.path.exists(web_path):
    with open(web_path, 'r', encoding='utf-8') as f:
        web_data = json.load(f)
    old_web = web_data.get('version', '')
    web_data['version'] = '0.3.0'
    with open(web_path, 'w', encoding='utf-8') as f:
        json.dump(web_data, f, indent=2, ensure_ascii=False)
        f.write('\n')
    print(f"apps/web/package.json: {old_web} -> {web_data['version']}")

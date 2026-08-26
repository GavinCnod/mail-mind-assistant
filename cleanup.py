import os
for f in ['check_patch.py', 'fix_pop3.py', 'verify.py']:
    path = rf'D:\AgnesRepo\mail-mind-assistant\{f}'
    if os.path.exists(path):
        os.remove(path)
        print(f"Removed {f}")

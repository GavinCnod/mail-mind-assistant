#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import sys

src_dir = r'D:\AgnesRepo\mail-mind-assistant\prd'
out_dir = r'C:\Users\cswno\AppData\Local\Temp\mailmind_docs'
os.makedirs(out_dir, exist_ok=True)

for name in os.listdir(src_dir):
    src = os.path.join(src_dir, name)
    if os.path.isfile(src):
        with open(src, 'rb') as f_in:
            data = f_in.read()
        encodings = ['utf-8', 'gbk', 'gb2312', 'utf-16']
        text = None
        for enc in encodings:
            try:
                text = data.decode(enc)
                break
            except:
                pass
        if text is None:
            text = data.decode('latin-1', errors='replace')
        out_name = os.path.splitext(name)[0] + '.txt'
        out_path = os.path.join(out_dir, out_name)
        with open(out_path, 'w', encoding='utf-8') as f_out:
            f_out.write(text)
        print(f'Wrote {out_path} ({len(text)} chars)')

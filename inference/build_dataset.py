# build_dataset.py -- ubah manifest /api/dataset/export jadi dataset YOLO lokal.
# Usage: python build_dataset.py --api http://localhost:4000 --token <JWT> --out dataset
import argparse
import json
import os
import urllib.request


def fetch_json(url, token):
    req = urllib.request.Request(url, headers={'Authorization': f'Bearer {token}'})
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def download(url, path):
    with urllib.request.urlopen(url) as r, open(path, 'wb') as f:
        f.write(r.read())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--api', required=True, help='base URL backend, mis. http://localhost:4000')
    ap.add_argument('--token', required=True, help='JWT (admin/petugas)')
    ap.add_argument('--out', default='dataset')
    a = ap.parse_args()

    man = fetch_json(f'{a.api}/api/dataset/export?format=json', a.token)['data']
    classes = man['classes']
    img_dir = os.path.join(a.out, 'images')
    lbl_dir = os.path.join(a.out, 'labels')
    os.makedirs(img_dir, exist_ok=True)
    os.makedirs(lbl_dir, exist_ok=True)

    ok = 0
    for i, it in enumerate(man['items']):
        ext = os.path.splitext(it['image_url'].split('?')[0])[1] or '.jpg'
        stem = f'img_{i:05d}'
        try:
            download(it['image_url'], os.path.join(img_dir, stem + ext))
        except Exception as e:
            print(f'skip {it["image_url"]}: {e}')
            continue
        with open(os.path.join(lbl_dir, stem + '.txt'), 'w') as f:
            for l in it['labels']:
                f.write(f"{l['class_id']} {l['x_center']} {l['y_center']} {l['w']} {l['h']}\n")
        ok += 1

    with open(os.path.join(a.out, 'data.yaml'), 'w') as f:
        f.write(f'path: {os.path.abspath(a.out)}\n')
        f.write('train: images\nval: images\n')
        f.write(f'nc: {len(classes)}\n')
        f.write(f'names: {classes}\n')

    print(f'Done: {ok}/{man["count_images"]} gambar terunduh, {man["count_labels"]} label -> {a.out}/')


if __name__ == '__main__':
    main()
# GRID.ID — Inference Service

Service terpisah untuk AI Screening. Backend Node memanggilnya via HTTP.

## Jalankan
```bash
cd inference
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```
Cek: http://localhost:8000/health · Docs: http://localhost:8000/docs

## Kontrak
POST /infer  body: { "photo_url": "..." }
resp: { ok, data: { detections: [ {defect, confidence, severity, bbox, model_version} ], model_version } }

## Integrasi model (tugas Thio)
Ganti HANYA isi fungsi `run_inference()` di main.py dengan YOLOv8.
Jangan ubah bentuk output. Taruh weights di inference/weights/ (gitignore).
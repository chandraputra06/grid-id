# GRID.ID inference service (FastAPI).
# SEKARANG: mock deterministik. NANTI: Thio ganti isi run_inference() dgn YOLOv8 asli.
# Kontrak output WAJIB tetap sama: list of {defect, confidence, severity, bbox, model_version}.
import hashlib
import os

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="GRID.ID Inference", version="0.1.0")

CLASSES = ["isolator_pecah", "korosi", "kabel_bermasalah", "komponen_hilang"]
MODEL_VERSION = os.getenv("MODEL_VERSION", "mock-v0")


class InferRequest(BaseModel):
    photo_url: str


def _hash(s: str) -> int:
    return int(hashlib.sha256(s.encode()).hexdigest(), 16)


def run_inference(photo_url: str):
    """
    MOCK deteksi deterministik dari photo_url.

    >>> GANTI isi fungsi ini saat integrasi model asli <<<
      1. download gambar dari photo_url (requests.get)
      2. model = YOLO('weights.pt')        # ultralytics, load sekali di startup
      3. results = model(img)
      4. untuk tiap box: map class_id -> salah satu CLASSES,
         confidence = box.conf, severity = fungsi(conf, luas bbox / aturan),
         bbox = {x,y,w,h} ternormalisasi, model_version = MODEL_VERSION
    Bentuk return TIDAK boleh berubah.
    """
    h = _hash(photo_url)
    r = h % 10
    n = 0 if r < 2 else (1 if r < 8 else 2)  # ~20% nol, ~60% satu, ~20% dua deteksi
    dets = []
    for i in range(n):
        hi = _hash(f"{photo_url}#{i}")
        dets.append({
            "defect": CLASSES[hi % 4],
            "confidence": round(0.55 + (hi % 40) / 100, 2),   # 0.55 - 0.94
            "severity": 40 + (hi // 7 % 51),                   # 40 - 90
            "bbox": {
                "x": round((hi % 60) / 100, 2),
                "y": round((hi // 3 % 60) / 100, 2),
                "w": 0.2, "h": 0.2,
            },
            "model_version": MODEL_VERSION,
        })
    return dets


@app.get("/health")
def health():
    return {"ok": True, "service": "grid-id-inference", "model_version": MODEL_VERSION}


@app.post("/infer")
def infer(req: InferRequest):
    detections = run_inference(req.photo_url)
    return {"ok": True, "data": {"detections": detections, "model_version": MODEL_VERSION}}
#!/bin/bash
# enc.sh <frames_dir> <out_dir> — відео циклу мішечка: d (868×1128, ПК) і m (650×846, телефон), WebM VP9 alpha + HEVC alpha
F=$1; O=$2
enc() { # w h crf tag hevc_q
  ffmpeg -hide_banner -loglevel error -y -framerate 24 -i "$F/f%04d.png" -vf "scale=$1:$2:flags=lanczos" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf $3 -row-mt 1 -deadline good -cpu-used 2 -an "$O/bag-wind-$4.webm"
  ffmpeg -hide_banner -loglevel error -y -framerate 24 -i "$F/f%04d.png" -vf "scale=$1:$2:flags=lanczos,format=bgra" -c:v hevc_videotoolbox -allow_sw 1 -alpha_quality 0.6 -q:v $5 -tag:v hvc1 -movflags +faststart -an "$O/bag-wind-$4.mp4"
}
enc 868 1128 ${CRF_D:-32} d ${Q_D:-62}
enc 650 846 ${CRF_M:-38} m ${Q_M:-52}
for f in "$O"/bag-wind-*.webm "$O"/bag-wind-*.mp4; do printf '%-16s %5s KB\n' "$(basename "$f")" $(( $(stat -f%z "$f") / 1024 )); done

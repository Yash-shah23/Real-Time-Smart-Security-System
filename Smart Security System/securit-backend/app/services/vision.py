import cv2
from ultralytics import YOLO
import math
import time

# 1. Initialize YOLO Model
# Nano model is best for real-time performance on laptops (RTX 3050)
model = YOLO("yolov8n.pt")

# 2. Camera Initialization Logic
def initialize_camera():
    # We try index 0 (Internal), then 1 (Phone Link), then 2
    for index in [0, 1, 2]:
        print(f"DEBUG: Attempting to open camera index {index}...")
        cap = cv2.VideoCapture(index)
        if cap.isOpened():
            print(f"SUCCESS: Connected to camera at index {index}")
            return cap
        cap.release()
    return None

cap = initialize_camera()

if cap is None:
    print("ERROR: No camera detected. Ensure no other app (Chrome/Zoom) is using it.")
    exit()

# 3. Define the Restricted Zone (Fetched from Dashboard later)
# These will eventually be dynamic based on your React "Zone Drawing"
zone_x1, zone_y1 = 150, 100
zone_x2, zone_y2 = 500, 450

# Target classes (0=Person)
target_classes = [0] 

print("System Status: ACTIVE. Press 'q' on the 'Security Feed' window to exit.")

while True:
    success, frame = cap.read()
    if not success:
        print("ALERT: Lost connection to camera stream.")
        break

    # Optional: Mirror the frame for more natural preview
    frame = cv2.flip(frame, 1)

    # 4. Run Inference
    results = model(frame, stream=True, verbose=False)

    # 5. Draw the Static Perimeter (The Red Box)
    cv2.rectangle(frame, (zone_x1, zone_y1), (zone_x2, zone_y2), (0, 0, 255), 2)
    cv2.putText(frame, "RESTRICTED ZONE ALPHA", (zone_x1, zone_y1 - 10), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

    # 6. Logic to Process Detections
    for r in results:
        boxes = r.boxes
        for box in boxes:
            # Get Bounding Box
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = math.ceil((box.conf[0] * 100)) / 100
            cls = int(box.cls[0])

            if cls in target_classes and conf > 0.5:
                # Calculate Object Center
                cx, cy = int((x1 + x2) / 2), int((y1 + y2) / 2)

                # Check Perimeter Breach
                is_intruder = (zone_x1 < cx < zone_x2) and (zone_y1 < cy < zone_y2)

                # Visual Feedback
                color = (0, 0, 255) if is_intruder else (0, 255, 0)
                label = "INTRUDER!" if is_intruder else "Authorized"

                # Draw Visuals
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.circle(frame, (cx, cy), 5, color, -1)
                cv2.putText(frame, f"{label} {conf}", (x1, y1 - 10), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    # 7. Force the Window to the Front
    cv2.imshow("Security Feed", frame)

    # Press 'q' to stop
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
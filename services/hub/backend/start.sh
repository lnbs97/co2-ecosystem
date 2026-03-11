#!/bin/bash

# 1. Starte den Worker im Hintergrund (& Zeichen am Ende)
python user_worker.py &

# 2. Starte den Main Service im Vordergrund
python user_service.py
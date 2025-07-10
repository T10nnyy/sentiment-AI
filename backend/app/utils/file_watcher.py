import asyncio
import os
from pathlib import Path
from typing import Callable, Dict, Any
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import logging

from ..core.config import settings

logger = logging.getLogger(__name__)

class FileWatcher:
    def __init__(self, watch_directory: str = "./uploads"):
        self.watch_directory = Path(watch_directory)
        self.watch_directory.mkdir(exist_ok=True)
        self.observer = Observer()
        self.callbacks: Dict[str, Callable] = {}
        
    def add_callback(self, event_type: str, callback: Callable):
        """Add callback for file events"""
        self.callbacks[event_type] = callback
        
    def start_watching(self):
        """Start watching for file changes"""
        event_handler = FileEventHandler(self.callbacks)
        self.observer.schedule(event_handler, str(self.watch_directory), recursive=True)
        self.observer.start()
        logger.info(f"Started watching directory: {self.watch_directory}")
        
    def stop_watching(self):
        """Stop watching for file changes"""
        self.observer.stop()
        self.observer.join()
        logger.info("Stopped file watching")

class FileEventHandler(FileSystemEventHandler):
    def __init__(self, callbacks: Dict[str, Callable]):
        self.callbacks = callbacks
        
    def on_created(self, event):
        if not event.is_directory:
            callback = self.callbacks.get("created")
            if callback:
                asyncio.create_task(callback(event.src_path))
                
    def on_modified(self, event):
        if not event.is_directory:
            callback = self.callbacks.get("modified")
            if callback:
                asyncio.create_task(callback(event.src_path))

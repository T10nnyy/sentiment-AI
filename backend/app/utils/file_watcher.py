"""
Hot Reload Implementation using Watchdog
"""

import asyncio
import logging
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from .config import settings

logger = logging.getLogger(__name__)

class ModelFileHandler(FileSystemEventHandler):
    """Handles file system events for model directory"""
    
    def __init__(self, reload_callback):
        self.reload_callback = reload_callback
        self.debounce_time = 2.0  # seconds
        self.last_reload = 0
    
    def on_modified(self, event):
        """Handle file modification events"""
        if event.is_directory:
            return
        
        # Check if it's a model file
        if any(event.src_path.endswith(ext) for ext in ['.bin', '.safetensors', '.h5', '.ckpt']):
            self._trigger_reload()
    
    def on_created(self, event):
        """Handle file creation events"""
        if event.is_directory:
            return
        
        if any(event.src_path.endswith(ext) for ext in ['.bin', '.safetensors', '.h5', '.ckpt']):
            self._trigger_reload()
    
    def _trigger_reload(self):
        """Trigger model reload with debouncing"""
        import time
        current_time = time.time()
        
        if current_time - self.last_reload > self.debounce_time:
            self.last_reload = current_time
            logger.info("Model files changed, triggering reload...")
            
            # Schedule reload in event loop
            try:
                loop = asyncio.get_event_loop()
                loop.create_task(self.reload_callback())
            except RuntimeError:
                # No event loop running
                logger.warning("No event loop available for hot reload")

class FileWatcher:
    """Watches model directory for changes and triggers hot reload"""
    
    def __init__(self, reload_callback):
        self.reload_callback = reload_callback
        self.observer = None
        self.handler = None
    
    def start(self):
        """Start watching the model directory"""
        if not settings.enable_hot_reload:
            logger.info("Hot reload disabled")
            return
        
        model_path = Path(settings.local_model_path)
        if not model_path.exists():
            logger.warning(f"Model path {model_path} does not exist, creating...")
            model_path.mkdir(parents=True, exist_ok=True)
        
        self.handler = ModelFileHandler(self.reload_callback)
        self.observer = Observer()
        self.observer.schedule(self.handler, str(model_path), recursive=True)
        self.observer.start()
        
        logger.info(f"Started watching {model_path} for model changes")
    
    def stop(self):
        """Stop watching the model directory"""
        if self.observer:
            self.observer.stop()
            self.observer.join()
            logger.info("Stopped file watcher")

import logging
import os

def configure_logger(name="fake_news_checker"):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    # Create console handler
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)

    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    ch.setFormatter(formatter)

    # Add handler to logger
    logger.addHandler(ch)

    # Configure log level based on environment
    if os.getenv("ENVIRONMENT") == "production":
        logger.setLevel(logging.WARNING)
    else:
        logger.setLevel(logging.INFO)

    return logger

logger = configure_logger()

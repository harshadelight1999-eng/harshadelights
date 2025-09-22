# Harsha Delights ERPNext Customizations

This directory contains the custom ERPNext app for Harsha Delights confectionery business.

## Structure

- `hooks.py` - App configuration and hooks
- `modules.txt` - List of custom modules
- `patches.txt` - Database patches for migrations
- `fixtures/` - Initial data fixtures
- `harsha_delights/` - Main app module

## Installation

This app is automatically installed when the ERPNext Docker container is built.

## Features

- Custom item types for confectionery products
- Batch and expiry tracking
- Production order workflows
- Customer segmentation (B2B/B2C/International/Local)
- Pricing rules and calculations
- Quality control workflows
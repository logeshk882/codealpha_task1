# Language Translation Tool

## Overview
Simple translation web app (frontend + Node backend). Backend supports Google Cloud Translation (v2) or Azure Translator.

## Prerequisites
- Node.js 18+
- npm
- A translation provider account:
  - **Google**: Google Cloud project with Cloud Translation API enabled and a service account JSON. Set `GOOGLE_APPLICATION_CREDENTIALS` env var to the JSON file path.
  - **Azure**: Azure Cognitive Services Translator resource and subscription key & region.

## Install
1. Clone repository
2. Install server dependencies:

# Contributing to Applied AI Systems Lab

Thank you for your interest in contributing! We love pull requests from everyone.

## 🌈 How to Contribute

1. **Fork the repository** and create your branch from `main`.
2. **Setup your environment** (see README.md).
3. **Make your changes**. If you're adding a new experiment, follow the pattern in `server/experiments/`.
4. **Test your changes** with `npm run dev`.
5. **Issue a pull request**.

## 🧪 Adding a New Experiment

To add a new experiment module:
1. Create a folder in `server/experiments/[slug]`.
2. Define your `schema.ts`, `prompt.ts`, `handler.ts`, and `index.ts`.
3. Register it in `config/experiments.ts`.
4. Add translations in `messages/en.json` and `messages/vi.json`.

## 📜 Code of Conduct

Help us keep the community open and inclusive. Please be respectful and professional in your communications.

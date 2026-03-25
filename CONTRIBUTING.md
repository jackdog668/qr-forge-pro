# Contributing to QrCody

Thanks for your interest in contributing! This project is open source under MIT license.

## How to Contribute

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create a branch** for your feature or fix: `git checkout -b feature/your-feature`
4. **Make your changes** in `public/index.html`
5. **Test** locally with `npx serve public`
6. **Commit** with a descriptive message
7. **Push** and open a Pull Request

## Development

This is a zero-build-step project. The entire app is in `public/index.html`. Just edit and refresh.

```bash
npx serve public -l 3000
```

## Code Standards

- All dynamic values must be escaped via `esc()` before DOM insertion
- Storage data must be validated via `valLib()` / `valPre()` on load
- New features should work offline (update `sw.js` cache list)
- ARIA labels required on interactive elements
- Mobile-first responsive design

## Security

If you discover a security vulnerability, please open an issue with the `security` label. See `docs/SECURITY-AUDIT.md` for the existing audit report.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

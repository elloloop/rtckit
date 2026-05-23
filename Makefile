.PHONY: ci install build test typecheck clean

# Full local gate — run before pushing to main. Mirrors the CI workflow.
ci:
	pnpm turbo run typecheck test build

install:
	pnpm install

build:
	pnpm turbo run build

test:
	pnpm turbo run test

typecheck:
	pnpm turbo run typecheck

clean:
	pnpm turbo run clean

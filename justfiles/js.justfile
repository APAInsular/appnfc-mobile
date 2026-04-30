[group('Dependencies')]
clear-dep:
    @echo "Cleaning project..."
    rm -rf node_modules bun.lockb package-lock.json

[group('Dependencies')]
install:
    @echo "Installing dependencies..."
    bun install


[group('Frameworks')]
adonis-api name:
    @echo "Scaffolding AdonisJS API..."
    bun create adonisjs@latest {{ name }} --kit=api

[group('Frameworks')]
vite name:
    @echo "Scaffolding ViteJS..."
    bun create vite {{ name }}

[group('Frameworks')]
astro name:
    @echo "Scaffolding Astro..."
    bun create astro@latest {{ name }}

[group('Frameworks')]
elysia name:
    @echo "Scaffolding Elysia..."
    bun create elysia {{ name }}

[group('Frameworks')]
fastify name:
    @echo "Scaffolding Fastify..."
    bun create fastify {{ name }}

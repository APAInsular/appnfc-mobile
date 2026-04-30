_pre-commit:
    @echo "Unconfigured tests"

[group('Git')]
commit type *message: _pre-commit
    #!/usr/bin/env bash
    case "{{ type }}" in
        feat|fix|chore|docs|refactor|infra) ;;
        *)
            echo "Error: El tipo debe ser feat, fix, chore, docs, infra o refactor"
            exit 1
            ;;
    esac
    git add .
    git commit -m "{{ type }}: {{ message }}"

[group('Git')]
feat *msg:
    just commit feat {{ msg }}

[group('Git')]
fix *msg:
    just commit fix {{ msg }}

[group('Git')]
chore *msg:
    just commit chore {{ msg }}

[group('Git')]
docs *msg:
    just commit docs {{ msg }}

[group('Git')]
infra *msg:
    just commit infra {{ msg }}

[group('Git')]
refactor *msg:
    just commit refactor {{ msg }}

[group('Git')]
wip *msg:
    git add .
    git commit -m "wip: {{ msg }}"
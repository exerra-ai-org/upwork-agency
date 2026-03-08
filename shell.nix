{
  pkgs ? import <nixpkgs> { },
}:

pkgs.mkShell {
  packages = with pkgs; [
    # Runtime & Package Manager
    bun
    nodejs_24

    # Database
    prisma
    prisma-engines
    openssl

    # Monorepo
    turbo

    # Linters & Formatters
    lefthook
    treefmt
    nixfmt
    prettier
  ];

  # Prisma needs these on NixOS
  PRISMA_CLIENT_ENGINE_TYPE = "binary";

  PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/schema-engine";

  PRISMA_QUERY_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/query-engine";

  PRISMA_FMT_BINARY = "${pkgs.prisma-engines}/bin/prisma-fmt";

  shellHook = ''
    export PATH="$HOME/.bun/bin:$PATH"
    lefthook install
  '';
}

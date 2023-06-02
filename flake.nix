{
    description = "Chessable Download";
    inputs = {
        nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    };
    outputs = { self, nixpkgs, ... }:
    let
        linux = "x86_64-linux";
        mac = "aarch64-darwin";
        pkgs = import nixpkgs { system = linux; };
        pkgs-darwin = import nixpkgs { system = mac; };
        bun = pkgs.callPackage nix/bun.nix {};
        bun-darwin = pkgs-darwin.callPackage nix/bun.nix {};
    in
    {
        defaultPackage.${linux} = pkgs.mkShell {
            packages = with pkgs; [
                bun
                nodejs_20
                yarn
            ];
        };
        defaultPackage.${mac} = pkgs-darwin.mkShell {
            packages = with pkgs-darwin; [
                bun-darwin
                nodejs_20
                yarn
            ];
        };
    };
}
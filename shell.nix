{ sources ? import ./nix/sources.nix
, pkgs ? import sources.nixpkgs {}
}:
let bun-0_6_2 = pkgs.callPackage nix/bun.nix {};
in pkgs.mkShell {
  buildInputs = [
  ];
  packages = [
     bun-0_6_2
     pkgs.niv
     pkgs.bun
     pkgs.nodejs
     pkgs.yarn
  ];
}

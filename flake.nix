{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    systems.url = "github:nix-systems/default";
  };

  outputs = { systems, nixpkgs, ... }@inputs: let
    eachSystem = f: nixpkgs.lib.genAttrs (import systems) (system: f {
      inherit system;
      pkgs = nixpkgs.legacyPackages.${system};
    });
  in {
    packages = eachSystem ( { pkgs, system }: {
      default = pkgs.buildNpmPackage rec {
        owner = "regular";
        repo = "tre-compile";

        name = repo;

        src = ./.;

        npmDepsHash = "sha256-j4Bn7FD9v9mIxt1hfFUJKGgyKQR/UEfilf2InwQBeZE=";
        #makeCacheWritable = true;
        npmFlags = [ "--only=prouction" "--no-optional"];
        dontNpmBuild = true;

        #propagatedBuildInputs = [ pkgs.git ];
        propagatedNativeBuildInputs = [ pkgs.git ];
        nativeBuildInputs = [ pkgs.makeWrapper pkgs.hello ];
        postInstall = ''
          wrapProgram $out/bin/tre-compile \
          --set GIT_EXECUTABLE_PATH ${pkgs.git}/bin/git
        '';

        meta = {
          description = "Command-line tools for compiling web apps for Bay of Plenty";
          homepage = "https://github.com/${owner}/${repo}";
          license = pkgs.lib.licenses.mit;
          mainProgram = "tre-compile";
          maintainers = [ "jan@lagomorph.de" ];
        };
      };
    });

    devShells = eachSystem ( { pkgs, ... }: {
      default = pkgs.mkShell {
        buildInputs = [
          pkgs.git
          pkgs.nodejs
          pkgs.hello
        ];
      };
    });
  };
}

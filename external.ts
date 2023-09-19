const { Walker, DepType } = require("flora-colossus");
const { dirname } = require("path");

const defaultOpts = {
    // @ts-ignore
    externals: [],
    includeDeps: true,
};

export class ForgeExternalsPlugin {
    name = "forge-externals-plugin"
    __isElectronForgePlugin = true;

    // @ts-ignore
    constructor(opts) {
        const options = { ...defaultOpts, ...(opts || {}) };
        // @ts-ignore
        this._externals = options.externals;
        // @ts-ignore
        this._includeDeps = options.includeDeps;
    }

    // @ts-ignore
    init = (dir) => {
        // @ts-ignore
        this._dir = dir;
    };

    // @ts-ignore
    getHook(hookName) {
        switch (hookName) {
            case "resolveForgeConfig":
                return this.resolveForgeConfig;
        }
    }


    getHooks() {
        return {
            "resolveForgeConfig": this.resolveForgeConfig
        };
    }

    // @ts-ignore
    resolveForgeConfig = async (forgeConfig) => {
        // @ts-ignore
        const foundModules = new Set(this._externals);

        // @ts-ignore
        if (this._includeDeps) {
            // @ts-ignore
            for (const external of this._externals) {
                // @ts-ignore
                const moduleRoot = dirname(
                    // @ts-ignore
                    require.resolve(`${external}/package.json`, { paths: [this._dir] })
                );

                const walker = new Walker(moduleRoot);
                // These are private so it's quite nasty!
                // @ts-ignore
                walker.modules = [];
                // @ts-ignore
                await walker.walkDependenciesForModule(moduleRoot, DepType.PROD);
                // @ts-ignore
                walker.modules
                    // @ts-ignore
                    .filter((dep) => dep.nativeModuleType === DepType.PROD)
                    // @ts-ignore
                    .map((dep) => dep.name)
                    // @ts-ignore
                    .forEach((name) => foundModules.add(name));
            }
        }

        // The webpack plugin already sets the ignore function.
        const existingIgnoreFn = forgeConfig.packagerConfig.ignore;

        // We override it and ensure we include external modules too
        // @ts-ignore
        forgeConfig.packagerConfig.ignore = (file) => {
            const existingResult = existingIgnoreFn(file);

            if (existingResult == false) {
                return false;
            }

            if (file === "/node_modules") {
                return false;
            }

            for (const module of foundModules) {
                // @ts-ignore
                if (file.startsWith(`/node_modules/${module}`) || file.startsWith(`/node_modules/${module.split('/')[0]}`)) {
                    return false;
                }
            }

            return true;
        };

        return forgeConfig;
    };
}

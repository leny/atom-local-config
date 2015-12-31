"use babel";

import ConfigManager from "./config-manager";
import { CompositeDisposable } from "atom";
import CSON from "cson-parser";
import fs from "fs";

let oConfig,
    oDisposables,
    fActivate,
    fDeactivate,
    fApplyLocalConfig,
    fRestoreConfig;

oConfig = {
    "applyOnActivation": {
        "type": "boolean",
        "default": false,
        "title": "Auto apply",
        "description": "If a local config file is found when project is loaded, it will be applied."
    },
    "configFilePaths": {
        "type": "array",
        "title": "Local config file path",
        "description": "Array of paths to lookup in project for local config file.",
        "default": [ ".atom", ".atom.cson", "atom.cson", ".config.cson", "config.cson", "atom-config.cson" ],
        "items": {
            "type": "string"
        }
    }
};

fActivate = function() {
    if ( ConfigManager.hasConfigBackup() ) {
        ConfigManager.restore();
        atom.config.load();
    }

    oDisposables && oDisposables.dispose();
    oDisposables = new CompositeDisposable();

    oDisposables.add( atom.commands.add( "atom-workspace", {
        "local-config:apply-local-config": () => {
            fApplyLocalConfig( false );
        },
        "local-config:restore-config": () => {
            fRestoreConfig();
        }
    } ) );

    if ( atom.config.get( "local-config.applyOnActivation" ) ) {
        fApplyLocalConfig();
    }
};

fDeactivate = function() {
    oDisposables.dispose();

    fRestoreConfig();
};

fApplyLocalConfig = function( bSilent = true ) {
    let sConfigFilePath,
        sLocalConfigContent,
        oLocalConfig;

    if ( !( sConfigFilePath = ConfigManager.getLocalConfigFile( atom.config.get( "local-config.configFilePaths" ) ) ) ) {
        if ( !bSilent ) {
            atom.notifications.addWarning( "No local config file found.", {
                "detail": "You can change the possible paths to lookup inside package's settings.",
                "dismissable": true
            } );
        }
        return;
    }

    if ( ConfigManager.hasConfigBackup() ) {
        ConfigManager.restore();
    }
    ConfigManager.backup();

    try {
        sLocalConfigContent = fs.readFileSync( atom.project.resolvePath( sConfigFilePath ), "utf-8" );
        oLocalConfig = CSON.parse( sLocalConfigContent );
    } catch ( oError ) {
        atom.notifications.addError( `Failed to load "${ sConfigFilePath }"`, {
            "detail": oError.message,
            "dismissable": true
        } );
        return;
    }

    if ( oLocalConfig.global != null ) {
        oLocalConfig[ "*" ] = oLocalConfig.global;
        delete oLocalConfig.global;
    }

    for ( let sScopeSelector in oLocalConfig ) {
        let oScopedConfig = oLocalConfig[ sScopeSelector ],
            oOptions = {};

        if ( sScopeSelector !== "*" ) {
            oOptions.scopeSelector = sScopeSelector;
        }

        for ( let sPackage in oScopedConfig ) {
            let oPackageConfig = oScopedConfig[ sPackage ];

            for ( let sKey in oPackageConfig ) {
                let mValue = oPackageConfig[ sKey ],
                    sKeyPath = `${ sPackage }.${ sKey }`;

                atom.config.set( sKeyPath, mValue, oOptions );
            }
        }
    }
};

fRestoreConfig = function() {
    if ( ConfigManager.hasConfigBackup() ) {
        ConfigManager.restore();
        atom.config.load();
    }
};

export {
    oConfig as config,
    fActivate as activate,
    fDeactivate as deactivate,
    fApplyLocalConfig as applyLocalConfig,
    fRestoreConfig as restoreConfig
};
